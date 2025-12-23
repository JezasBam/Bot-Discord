import { ChannelType, ThreadAutoArchiveDuration } from 'discord.js';
import { t } from './i18n.js';
import { buildCreateTicketModal, buildCloseTicketModal } from './ui/modals.js';
import { buildJoinButtonRow, buildDisabledJoinButtonRow, buildCloseButtonRow } from './ui/buttons.js';
import {
  buildWaitingEmbed,
  buildNewTicketLogEmbed,
  buildAcceptedEmbed,
  buildClosedEmbed,
  buildTranscriptEmbed,
  buildCloseSummaryEmbed
} from './ui/embeds.js';
import {
  fetchThreadMessages,
  buildThreadTranscript,
  createTranscriptFile,
  collectFilesFromMessages,
  formatSkippedFiles
} from './services/transcriptService.js';
import {
  getGuildTicketConfig,
  getKey,
  saveTicketToDb,
  updateTicketAcceptance,
  removeTicketFromDb,
  cleanupOrphanTicket
} from '../../storage/repositories/ticketRepository.js';
import { safeEphemeralUpdate } from '../../core/interaction-utils.js';
import {
  TICKET_COOLDOWN_MS,
  TICKET_COOLDOWN_CLEANUP_INTERVAL_MS,
  MAX_TRANSCRIPT_MESSAGES,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENT_FILES,
  FILES_BATCH_SIZE
} from '../../config/constants.js';
import { getLogger } from '../../core/logger.js';

const logger = getLogger();

const openCooldown = new Map();
let cooldownCleanupInterval = null;

export function startCooldownCleanup() {
  if (cooldownCleanupInterval) return;
  cooldownCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, ts] of openCooldown) {
      if (now - ts > TICKET_COOLDOWN_MS * 2) {
        openCooldown.delete(key);
      }
    }
  }, TICKET_COOLDOWN_CLEANUP_INTERVAL_MS);
}

export function stopCooldownCleanup() {
  if (cooldownCleanupInterval) {
    clearInterval(cooldownCleanupInterval);
    cooldownCleanupInterval = null;
  }
}

function getTicketName(lang, user) {
  const base = user.username?.replaceAll(' ', '-')?.toLowerCase() || 'user';
  const tag = lang === 'ro' ? 'ro' : 'en';
  return `ticket-${tag}-${base}`.slice(0, 100);
}

async function resolveExistingThread(guild, threadId) {
  if (!threadId) return null;
  const cached = guild.channels.cache.get(threadId);
  if (cached) return cached;
  try {
    return await guild.channels.fetch(threadId);
  } catch {
    return null;
  }
}

async function sendFilesInBatches(channel, firstMessage, files, options = {}) {
  const batchSize = options.batchSize ?? FILES_BATCH_SIZE;
  if (!files.length) {
    await channel.send(firstMessage);
    return;
  }

  const chunks = [];
  for (let i = 0; i < files.length; i += batchSize) {
    chunks.push(files.slice(i, i + batchSize));
  }

  await channel.send({ ...firstMessage, files: chunks[0] });
  for (let i = 1; i < chunks.length; i++) {
    await channel.send({ files: chunks[i] });
  }
}

export async function handleTicketButton(interaction, _context = {}) {
  if (!interaction.inGuild() || !interaction.guild) return;

  const id = interaction.customId;
  if (!id.startsWith('ticket_')) return;

  if (id === 'ticket_close') {
    await showCloseModal(interaction);
    return;
  }

  if (id.startsWith('ticket_join_')) {
    const threadId = id.slice('ticket_join_'.length);
    await handleJoin(interaction, threadId);
    return;
  }

  if (id === 'ticket_open_ro' || id === 'ticket_open_en') {
    const lang = id === 'ticket_open_ro' ? 'ro' : 'en';
    await showCreateModal(interaction, lang);
  }
}

export async function handleTicketModalSubmit(interaction, _context = {}) {
  if (!interaction.inGuild() || !interaction.guild) return;

  if (interaction.customId.startsWith('ticket_close_confirm_')) {
    const threadId = interaction.customId.slice('ticket_close_confirm_'.length);
    const reason = interaction.fields.getTextInputValue('reason')?.trim() || '';
    const notes = interaction.fields.getTextInputValue('notes')?.trim() || '';
    await handleCloseConfirm(interaction, threadId, reason, notes);
    return;
  }

  if (!interaction.customId.startsWith('ticket_create_')) return;

  const lang = interaction.customId.endsWith('_ro') ? 'ro' : 'en';
  const tx = t(lang);
  const subject = interaction.fields.getTextInputValue('subject')?.trim() || '';
  const description = interaction.fields.getTextInputValue('description')?.trim() || '';

  if (!subject) {
    await interaction.reply({ content: tx.subjectRequired, flags: 64 });
    return;
  }

  await createTicketFromModal(interaction, lang, subject, description);
}

async function showCreateModal(interaction, lang) {
  const guild = interaction.guild;
  const cfg = await getGuildTicketConfig(guild.id);
  const tx = t(lang);

  const panel = cfg?.[lang];
  const supportRoleId = cfg?.supportRoleId;

  if (!panel?.channelId || !supportRoleId) {
    await interaction.reply({ content: tx.notConfigured, flags: 64 });
    return;
  }

  if (interaction.channelId !== panel.channelId) {
    await interaction.reply({ content: tx.wrongChannel, flags: 64 });
    return;
  }

  const cooldownKey = `${guild.id}:${interaction.user.id}`;
  const now = Date.now();
  const last = openCooldown.get(cooldownKey) ?? 0;
  const remaining = TICKET_COOLDOWN_MS - (now - last);
  if (remaining > 0) {
    await interaction.reply({ content: tx.cooldown(Math.ceil(remaining / 1000)), flags: 64 });
    return;
  }
  openCooldown.set(cooldownKey, now);

  const key = getKey(lang, interaction.user.id);
  const existingThreadId = cfg?.openTickets?.[key];
  const existingThread = await resolveExistingThread(guild, existingThreadId);
  if (existingThread) {
    await interaction.reply({ content: tx.alreadyOpen(existingThread.id), flags: 64 });
    return;
  }

  if (existingThreadId) {
    await cleanupOrphanTicket(guild.id, key, existingThreadId);
  }

  await interaction.showModal(buildCreateTicketModal(lang));
}

async function createTicketFromModal(interaction, lang, subject, description) {
  const guild = interaction.guild;
  const cfg = await getGuildTicketConfig(guild.id);
  const tx = t(lang);

  const panel = cfg?.[lang];
  const supportRoleId = cfg?.supportRoleId;
  const supportLogChannelId = panel?.supportLogChannelId;

  if (!panel?.channelId || !supportRoleId) {
    await interaction.reply({ content: tx.notConfigured, flags: 64 });
    return;
  }

  await interaction.deferReply({ flags: 64 });

  const key = getKey(lang, interaction.user.id);
  const existingThreadId = cfg?.openTickets?.[key];
  const existingThread = await resolveExistingThread(guild, existingThreadId);
  if (existingThread) {
    await interaction.editReply({ content: tx.alreadyOpen(existingThread.id) });
    return;
  }

  if (existingThreadId) {
    await cleanupOrphanTicket(guild.id, key, existingThreadId);
  }

  const channel = await guild.channels.fetch(panel.channelId);
  if (!channel || channel.type !== ChannelType.GuildText) {
    await interaction.editReply({ content: 'Ticket panel channel is missing or invalid.' });
    return;
  }

  const me = guild.members.me ?? (await guild.members.fetchMe());
  const perms = channel.permissionsFor(me);
  if (!perms || !perms.has(['CreatePrivateThreads', 'ManageThreads', 'ViewChannel'])) {
    await interaction.editReply({
      content: 'Missing permissions in this channel (Create Private Threads / Manage Threads / View Channel).'
    });
    return;
  }

  let thread;
  try {
    thread = await channel.threads.create({
      name: getTicketName(lang, interaction.user),
      autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      type: ChannelType.PrivateThread,
      invitable: false
    });
  } catch (err) {
    logger.error('Failed to create ticket thread:', err);
    await interaction.editReply({
      content: 'I could not create a private thread. Ensure I have Create Private Threads / Manage Threads permissions.'
    });
    return;
  }

  try {
    await thread.members.add(interaction.user.id);
  } catch (err) {
    logger.debug('Failed to add user to thread:', err.message);
  }

  try {
    await thread.send({
      embeds: [buildWaitingEmbed(lang, subject, description)],
      components: [buildCloseButtonRow()]
    });
  } catch (err) {
    logger.error('Failed to send welcome embed to thread:', err);
  }

  let supportLogMessageId = null;
  let supportForumThreadId = null;
  let supportForumMessageId = null;

  if (supportLogChannelId) {
    try {
      const logChannel = await guild.channels.fetch(supportLogChannelId);
      const embed = buildNewTicketLogEmbed(lang, interaction.user, thread, subject, description);
      const payload = {
        content: `Opened by <@${interaction.user.id}> <@&${supportRoleId}>`,
        embeds: [embed],
        components: [buildJoinButtonRow(thread.id)]
      };

      if (logChannel && logChannel.type === ChannelType.GuildText) {
        const msg = await logChannel.send(payload);
        supportLogMessageId = msg.id;
      }

      if (logChannel && logChannel.type === ChannelType.GuildForum) {
        const postName = `${thread.name}-${interaction.user.id.slice(-4)}`.slice(0, 100);
        const postThread = await logChannel.threads.create({
          name: postName,
          message: payload
        });

        supportForumThreadId = postThread.id;
        try {
          const starter = await postThread.fetchStarterMessage();
          supportForumMessageId = starter?.id || null;
        } catch (err) {
          logger.debug('Failed to fetch starter message:', err.message);
        }
      }
    } catch (err) {
      logger.error('Failed to post to support log channel:', err);
    }
  }

  await saveTicketToDb(guild.id, key, thread.id, {
    ownerId: interaction.user.id,
    lang,
    createdAt: Date.now(),
    panelChannelId: panel.channelId,
    subject,
    description,
    supportLogMessageId,
    supportForumThreadId,
    supportForumMessageId,
    acceptedByIds: [],
    acceptedAt: null
  });

  await interaction.editReply({ content: tx.created(thread.id) });
}

async function showCloseModal(interaction) {
  const guild = interaction.guild;
  const thread = interaction.channel;
  if (!thread || !thread.isThread()) {
    await interaction.reply({ content: 'This button can only be used inside a ticket thread.', flags: 64 });
    return;
  }

  const cfg = await getGuildTicketConfig(guild.id);
  const meta = cfg?.ticketsByThread?.[thread.id];
  const lang = meta?.lang || 'en';
  const tx = t(lang);

  const supportRoleId = cfg?.supportRoleId;
  const member = interaction.member;
  const isSupport = supportRoleId && member && 'roles' in member ? member.roles.cache?.has(supportRoleId) : false;
  const isOwner = meta?.ownerId === interaction.user.id;

  if (!isSupport && !isOwner) {
    await interaction.reply({ content: tx.closeDenied, flags: 64 });
    return;
  }

  await interaction.showModal(buildCloseTicketModal(thread.id, lang));
}

async function handleJoin(interaction, threadId) {
  const guild = interaction.guild;
  const cfg = await getGuildTicketConfig(guild.id);
  const supportRoleId = cfg?.supportRoleId;

  const member = interaction.member;
  const isSupport = supportRoleId && member && 'roles' in member ? member.roles.cache?.has(supportRoleId) : false;

  if (!isSupport) {
    await interaction.reply({ content: 'Only Support can join tickets.', flags: 64 });
    return;
  }

  let thread;
  try {
    thread = await guild.channels.fetch(threadId);
  } catch {
    thread = null;
  }

  if (!thread || !thread.isThread()) {
    await interaction.reply({ content: 'Ticket thread no longer exists.', flags: 64 });
    return;
  }

  try {
    await thread.members.add(interaction.user.id);
  } catch {
    await interaction.reply({ content: 'Failed to join ticket. Check my permissions.', flags: 64 });
    return;
  }

  const { acceptedNow, acceptedIds } = await updateTicketAcceptance(guild.id, threadId, interaction.user.id);

  if (acceptedNow) {
    try {
      await thread.send({ embeds: [buildAcceptedEmbed(interaction.user.id)] });
    } catch (err) {
      logger.debug('Failed to send accepted embed:', err.message);
    }
  }

  try {
    if (interaction.message?.editable) {
      const { EmbedBuilder } = await import('discord.js');
      const embeds = interaction.message.embeds?.map((e) => EmbedBuilder.from(e)) || [];
      if (embeds[0]) {
        const list = (acceptedIds || [])
          .slice(0, 20)
          .map((id) => `<@${id}>`)
          .join(', ');
        const value = list || `<@${interaction.user.id}>`;
        const existingFields = embeds[0].data.fields || [];
        const idx = existingFields.findIndex((f) => (f?.name || '').toLowerCase() === 'accepted by');
        if (idx >= 0) {
          embeds[0].spliceFields(idx, 1, { name: 'Accepted by', value: value.slice(0, 1024) });
        } else {
          embeds[0].addFields({ name: 'Accepted by', value: value.slice(0, 1024) });
        }
      }
      await interaction.message.edit({ embeds, components: interaction.message.components });
    }
  } catch (err) {
    logger.debug('Failed to update join button message:', err.message);
  }

  await interaction.reply({ content: `Joined ticket: <#${thread.id}>`, flags: 64 });
}

async function handleCloseConfirm(interaction, threadId, reason, notes) {
  const guild = interaction.guild;
  let thread = interaction.channel;
  if (!thread || !thread.isThread() || thread.id !== threadId) {
    try {
      thread = await guild.channels.fetch(threadId);
    } catch {
      thread = null;
    }
  }

  const cfg = await getGuildTicketConfig(guild.id);
  const meta = cfg?.ticketsByThread?.[threadId];
  const lang = meta?.lang || 'en';
  const tx = t(lang);

  const supportRoleId = cfg?.supportRoleId;
  const member = interaction.member;
  const isSupport = supportRoleId && member && 'roles' in member ? member.roles.cache?.has(supportRoleId) : false;
  const isOwner = meta?.ownerId === interaction.user.id;

  if (!isSupport && !isOwner) {
    await interaction.reply({ content: tx.closeDenied, flags: 64 });
    return;
  }

  await interaction.deferReply({ flags: 64 });
  await safeEphemeralUpdate(interaction, { content: tx.closeStarted });

  if (!thread || !thread.isThread()) {
    await safeEphemeralUpdate(interaction, { content: 'Ticket thread no longer exists.' });
    return;
  }

  try {
    await thread.send({ embeds: [buildClosedEmbed(interaction.user.id, reason, notes)] });
  } catch (err) {
    logger.debug('Failed to send closed embed:', err.message);
  }

  const metaLang = meta?.lang;
  const panelCfg = metaLang ? cfg?.[metaLang] : null;
  const supportLogChannelId = panelCfg?.supportLogChannelId;

  let archivedCount = 0;
  let skippedCount = 0;
  let skippedPreview = '';
  let logChannelMention = '';

  if (supportLogChannelId) {
    try {
      const logChannel = await guild.channels.fetch(supportLogChannelId);
      const messages = await fetchThreadMessages(thread, { maxMessages: MAX_TRANSCRIPT_MESSAGES });
      const transcript = await buildThreadTranscript(thread);
      const transcriptFile = createTranscriptFile(transcript, thread.id);

      const { files: archivedFiles, skipped: skippedFiles } = await collectFilesFromMessages(messages, {
        maxFiles: MAX_ATTACHMENT_FILES,
        maxBytes: MAX_ATTACHMENT_BYTES
      });

      archivedCount = archivedFiles.length;
      skippedCount = (skippedFiles || []).length;
      skippedPreview = formatSkippedFiles(skippedFiles);

      const embed = buildTranscriptEmbed(thread, meta, interaction.user.id, archivedCount, skippedCount, reason, notes);
      const content = skippedPreview ? `Skipped files (too large/failed):\n${skippedPreview}` : undefined;
      const allFiles = [transcriptFile, ...archivedFiles];

      if (logChannel && logChannel.type === ChannelType.GuildText) {
        logChannelMention = `<#${logChannel.id}>`;
        await sendFilesInBatches(logChannel, { content, embeds: [embed] }, allFiles, { batchSize: FILES_BATCH_SIZE });

        if (meta?.supportLogMessageId) {
          try {
            const m = await logChannel.messages.fetch(meta.supportLogMessageId);
            if (m?.editable) {
              await m.edit({ components: [buildDisabledJoinButtonRow(thread.id)] });
            }
          } catch (err) {
            logger.debug('Failed to disable join button on log message:', err.message);
          }
        }
      }

      if (logChannel && logChannel.type === ChannelType.GuildForum) {
        const forumThreadId = meta?.supportForumThreadId;
        if (forumThreadId) {
          try {
            const forumThread = await guild.channels.fetch(forumThreadId);
            if (forumThread && forumThread.isThread()) {
              logChannelMention = `<#${forumThread.id}>`;
              await sendFilesInBatches(forumThread, { content, embeds: [embed] }, allFiles, {
                batchSize: FILES_BATCH_SIZE
              });

              if (meta?.supportForumMessageId) {
                try {
                  const starter = await forumThread.messages.fetch(meta.supportForumMessageId);
                  if (starter?.editable) {
                    await starter.edit({ components: [buildDisabledJoinButtonRow(thread.id)] });
                  }
                } catch (err) {
                  logger.debug('Failed to disable join button on forum starter:', err.message);
                }
              }
            }
          } catch (err) {
            logger.debug('Failed to update forum thread:', err.message);
          }
        }
      }
    } catch (err) {
      logger.error('Failed to post transcript to log channel:', err);
    }
  }

  const summaryEmbed = buildCloseSummaryEmbed(
    lang,
    thread,
    archivedCount,
    skippedCount,
    logChannelMention,
    reason,
    notes,
    skippedPreview
  );

  try {
    await safeEphemeralUpdate(interaction, { embeds: [summaryEmbed] });
  } catch (err) {
    logger.debug('Failed to send close summary:', err.message);
  }

  await removeTicketFromDb(guild.id, thread.id);

  try {
    await thread.delete();
  } catch (err) {
    logger.debug('Failed to delete thread, attempting archive:', err.message);
    try {
      await thread.setLocked(true);
      await thread.setArchived(true);
    } catch (archiveErr) {
      logger.error('Failed to archive thread:', archiveErr);
    }
  }
}
