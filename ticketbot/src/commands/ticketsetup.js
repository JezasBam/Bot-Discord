import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js';
import { loadDb, updateGuildConfig } from '../storage/db.js';
import { getLogger } from '../core/logger.js';
import { SUPPORT_ROLE_NAME } from '../config/constants.js';

const logger = getLogger();

export const data = new SlashCommandBuilder()
  .setName('ticketsetup')
  .setDescription('Setup ticket system (RO/EN)')
  .addStringOption((opt) =>
    opt
      .setName('language')
      .setDescription('Ticket language')
      .setRequired(true)
      .addChoices({ name: 'Romana', value: 'ro' }, { name: 'English', value: 'en' })
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  if (!interaction.inGuild() || !interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
    return;
  }

  const lang = interaction.options.getString('language', true);

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const result = await setupLanguage(interaction.guild, lang);

    await interaction.editReply({
      content: `Setup completed for **${lang.toUpperCase()}**.\nSupport role: <@&${result.supportRoleId}>\nCategory: <#${result.categoryId}>\nChannel: <#${result.channelId}>`
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Setup failed.';
    await interaction.editReply({ content: msg.slice(0, 1800) });
  }
}

async function setupLanguage(guild, lang) {
  const botMember = guild.members.me ?? (await guild.members.fetchMe());
  assertBotSetupPermissions(botMember);

  const supportRole = await ensureSupportRole(guild);
  const naming = LANG_CONFIG[lang];

  const category = await ensureCategory(guild, naming.categoryName);
  const [channel, supportLogChannel] = await Promise.all([
    ensureSetupChannel(guild, category.id, naming.channelName, supportRole, botMember),
    ensureSupportLogChannel(guild, category.id, naming.supportLogChannelName, supportRole, botMember)
  ]);
  const panelMessageId = await ensurePanelMessage(channel, lang);

  await updateGuildConfig(guild.id, async (cfg) => {
    cfg.ticketSystem ??= {};
    cfg.ticketSystem.supportRoleId = supportRole.id;
    cfg.ticketSystem[lang] = {
      categoryId: category.id,
      channelId: channel.id,
      supportLogChannelId: supportLogChannel.id,
      panelMessageId
    };
    return cfg;
  });

  return { supportRoleId: supportRole.id, categoryId: category.id, channelId: channel.id };
}

const REQUIRED_SETUP_PERMS = [
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.AttachFiles,
  PermissionFlagsBits.EmbedLinks,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.CreatePublicThreads,
  PermissionFlagsBits.CreatePrivateThreads,
  PermissionFlagsBits.ManageThreads
];

function assertBotSetupPermissions(botMember) {
  const missing = botMember.permissions.missing(REQUIRED_SETUP_PERMS);
  if (missing.length) {
    throw new Error(`Missing bot permissions: ${missing.join(', ')}`);
  }
}

const LANG_CONFIG = {
  ro: {
    categoryName: 'Tichete RO',
    channelName: 'deschide-ticket-ro',
    supportLogChannelName: 'support-ro',
    buttonLabel: 'Deschide Ticket',
    customId: 'ticket_open_ro',
    embedTitle: 'Suport - Ticket (Romana)',
    embedDesc:
      'Apasa butonul de mai jos ca sa deschizi un ticket. Vei completa un formular scurt, apoi se va crea un thread privat.',
    field1: {
      name: 'Ce se intampla dupa ce deschizi ticket-ul',
      value: 'Un membru din Support va primi notificare si poate intra in thread cand preia ticket-ul.'
    },
    field2: {
      name: 'Media (poze / videoclipuri)',
      value: 'Le poti trimite ulterior direct in thread, dupa crearea ticket-ului.'
    }
  },
  en: {
    categoryName: 'Tickets EN',
    channelName: 'open-ticket-en',
    supportLogChannelName: 'support-en',
    buttonLabel: 'Open Ticket',
    customId: 'ticket_open_en',
    embedTitle: 'Support - Ticket (English)',
    embedDesc:
      'Press the button below to open a ticket. You will fill a short form, then a private thread will be created.',
    field1: {
      name: 'What happens next',
      value: 'A Support member will be notified and can join the thread when they take the ticket.'
    },
    field2: {
      name: 'Media (images / videos)',
      value: 'You can upload them later directly in the thread, after the ticket is created.'
    }
  }
};

async function ensureSupportRole(guild) {
  return (
    guild.roles.cache.find((r) => r.name === SUPPORT_ROLE_NAME) ??
    guild.roles.create({ name: SUPPORT_ROLE_NAME, mentionable: true })
  );
}

async function ensureCategory(guild, name) {
  return (
    guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && c.name === name) ??
    guild.channels.create({ name, type: ChannelType.GuildCategory })
  );
}

const BASE_PERMS = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory];
const THREAD_PERMS = [...BASE_PERMS, PermissionFlagsBits.SendMessagesInThreads, PermissionFlagsBits.AttachFiles];
const LOG_PERMS = [
  ...BASE_PERMS,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.SendMessagesInThreads,
  PermissionFlagsBits.CreatePublicThreads,
  PermissionFlagsBits.AttachFiles
];
const BOT_SETUP_PERMS = [
  ...THREAD_PERMS,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.CreatePrivateThreads,
  PermissionFlagsBits.ManageThreads
];

async function ensureSetupChannel(guild, categoryId, channelName, supportRole, botMember) {
  const existing = guild.channels.cache.find((c) => c.type === ChannelType.GuildText && c.name === channelName);
  const overwrites = [
    { id: guild.roles.everyone.id, allow: THREAD_PERMS, deny: [PermissionFlagsBits.SendMessages] },
    { id: supportRole.id, allow: THREAD_PERMS },
    { id: botMember.id, allow: BOT_SETUP_PERMS }
  ];

  if (existing) {
    try {
      await existing.edit({ parent: categoryId });
    } catch (err) {
      logger.debug('Failed to move channel to category:', err.message);
    }
    try {
      await existing.permissionOverwrites.set(overwrites);
    } catch (err) {
      logger.debug('Failed to set channel permissions:', err.message);
    }
    return existing;
  }

  return guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: categoryId,
    permissionOverwrites: overwrites
  });
}

async function ensureSupportLogChannel(guild, categoryId, channelName, supportRole, botMember) {
  const existing = guild.channels.cache.find((c) => c.type === ChannelType.GuildForum && c.name === channelName);
  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: supportRole.id, allow: LOG_PERMS },
    { id: botMember.id, allow: LOG_PERMS }
  ];

  if (existing) {
    try {
      await existing.edit({ parent: categoryId });
    } catch (err) {
      logger.debug('Failed to move forum to category:', err.message);
    }
    try {
      await existing.permissionOverwrites.set(overwrites);
    } catch (err) {
      logger.debug('Failed to set forum permissions:', err.message);
    }
    return existing;
  }

  return guild.channels.create({
    name: channelName,
    type: ChannelType.GuildForum,
    parent: categoryId,
    permissionOverwrites: overwrites
  });
}

async function ensurePanelMessage(channel, lang) {
  const cfg = LANG_CONFIG[lang];
  const embed = new EmbedBuilder()
    .setTitle(cfg.embedTitle)
    .setDescription(cfg.embedDesc)
    .addFields(cfg.field1, cfg.field2)
    .setColor(0x5865f2);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(cfg.customId).setLabel(cfg.buttonLabel).setStyle(ButtonStyle.Primary)
  );

  const payload = { embeds: [embed], components: [row] };

  try {
    const db = await loadDb();
    const msgId = db?.guilds?.[channel.guildId]?.ticketSystem?.[lang]?.panelMessageId;
    if (msgId) {
      const previous = await channel.messages.fetch(msgId);
      await previous.edit(payload);
      return previous.id;
    }
  } catch (err) {
    logger.debug('Panel message not found or could not be edited:', err.message);
  }

  const created = await channel.send(payload);
  try {
    await updateGuildConfig(channel.guildId, async (cfg) => {
      cfg.ticketSystem ??= {};
      cfg.ticketSystem[lang] ??= {};
      cfg.ticketSystem[lang].panelMessageId = created.id;
      return cfg;
    });
  } catch (err) {
    logger.error('Failed to save panel message ID to database:', err);
  }

  return created.id;
}
