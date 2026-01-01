import { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { hasAdminRole } from '../utils/permissions.js';
import { loadConfig } from '../../ticketbot/src/config/index.js';
import { createModerationPost } from '../utils/moderation-forum.js';

const config = loadConfig();

export const muteData = new ContextMenuCommandBuilder()
  .setName('🔇 Mute User')
  .setType(ApplicationCommandType.User);

export async function executeMute(interaction, context) {
  const { logger } = context;
  const targetUser = interaction.targetMember;
  const executor = interaction.member;

  logger.info(`Mute attempt: ${executor.user.tag} -> ${targetUser.user.tag}`);

  // Allow only users with Support role
  const hasSupportRole = executor.roles.cache.some(role => role.name === 'Support');
  
  if (!hasSupportRole) {
    logger.warn(`Mute permission denied for ${executor.user.tag} - no Support role`);
    await interaction.reply({ 
      content: '❌ Doar utilizatorii cu rolul **Support** pot folosi această comandă!', 
      ephemeral: true 
    });
    return;
  }

  if (!targetUser) {
    logger.error('Target user not found');
    await interaction.reply({ 
      content: '❌ Utilizatorul nu a fost găsit!', 
      ephemeral: true 
    });
    return;
  }

  // Check if user is already muted
  const isCurrentlyMuted = targetUser.communicationDisabledUntil && 
                          targetUser.communicationDisabledUntil > Date.now();

  if (isCurrentlyMuted) {
    await interaction.reply({ 
      content: '❌ Utilizatorul are deja mute!', 
      ephemeral: true 
    });
    return;
  }

  // Create and show modal for duration input
  const modal = new ModalBuilder()
    .setCustomId(`mute_${targetUser.id}`)
    .setTitle(`Mute utilizator: ${targetUser.user.tag}`);

  const durationInput = new TextInputBuilder()
    .setCustomId('mute_duration')
    .setLabel('Durata mute-ului (minute):')
    .setPlaceholder('Introdu numărul de minute (ex: 5, 10, 60)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(3);

  const reasonInput = new TextInputBuilder()
    .setCustomId('mute_reason')
    .setLabel('Motiv (opțional):')
    .setPlaceholder('Motivul pentru care dai mute...')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(500);

  const firstActionRow = new ActionRowBuilder().addComponents(durationInput);
  const secondActionRow = new ActionRowBuilder().addComponents(reasonInput);

  modal.addComponents(firstActionRow, secondActionRow);

  await interaction.showModal(modal);
  logger.info(`Mute modal shown for ${executor.user.tag} -> ${targetUser.user.tag}`);
}

export async function handleMuteModal(interaction, context) {
  const { logger } = context;
  const executor = interaction.member;
  
  // Extract target user ID from modal custom ID
  const targetUserId = interaction.customId.replace('mute_', '');
  const guild = interaction.guild;
  
  if (!guild) {
    logger.error('Guild not found in modal interaction');
    await interaction.reply({ 
      content: '❌ Eroare internă: guild negăsit!', 
      ephemeral: true 
    });
    return;
  }

  const targetUser = await guild.members.fetch(targetUserId).catch(() => null);
  
  if (!targetUser) {
    logger.error(`Target user ${targetUserId} not found`);
    await interaction.reply({ 
      content: '❌ Utilizatorul nu a fost găsit!', 
      ephemeral: true 
    });
    return;
  }

  // Get duration and reason from modal
  const durationInput = interaction.fields.getTextInputValue('mute_duration');
  const reasonInput = interaction.fields.getTextInputValue('mute_reason') || 'Fără motiv specificat';
  
  // Validate duration
  const duration = parseInt(durationInput);
  if (isNaN(duration) || duration < 1 || duration > 1440) { // Max 24 hours
    await interaction.reply({ 
      content: '❌ Durata invalidă! Introduceți un număr între 1 și 1440 minute (max 24 ore).', 
      ephemeral: true 
    });
    return;
  }

  // Check if user is already muted (in case something changed)
  const isCurrentlyMuted = targetUser.communicationDisabledUntil && 
                          targetUser.communicationDisabledUntil > Date.now();

  if (isCurrentlyMuted) {
    await interaction.reply({ 
      content: '❌ Utilizatorul are deja mute!', 
      ephemeral: true 
    });
    return;
  }

  // Apply mute
  if (!targetUser.manageable) {
    logger.error(`Cannot manage user ${targetUser.user.tag}`);
    await interaction.reply({ 
      content: '❌ Nu pot modifica acest utilizator! Verifică permisiunile bot-ului.', 
      ephemeral: true 
    });
    return;
  }

  try {
    const muteDurationMs = duration * 60 * 1000;
    logger.info(`Applying mute for ${duration} minutes (${muteDurationMs}ms)`);
    
    await targetUser.timeout(muteDurationMs, `Mute de ${executor.user.tag}: ${reasonInput}`);
    
    const muteEmbed = {
      title: '🔇 Utilizator Mutat',
      description: `**${targetUser.user.tag}** a primit mute pentru ${duration} minute`,
      color: 0xFF6B6B,
      fields: [
        { name: '👤 Utilizator', value: `<@${targetUser.id}>`, inline: true },
        { name: '⏰ Durată', value: `${duration} minute`, inline: true },
        { name: '👨‍⚖️ Suport', value: `<@${executor.id}>`, inline: true },
        { name: '📝 Motiv', value: reasonInput, inline: false },
        { name: '⏱️ Timp rămas', value: '<t:' + Math.floor(Date.now() / 1000 + (duration * 60)) + ':R>', inline: true }
      ],
      timestamp: new Date().toISOString()
    };

    await interaction.reply({ embeds: [muteEmbed] });
    logger.info(`User ${targetUser.user.tag} muted by ${executor.user.tag} for ${duration} minutes. Reason: ${reasonInput}`);

    // Creăm postare în forum pentru tracking
    await createModerationPost(interaction, {
      type: 'mute',
      target: targetUser,
      executor: executor,
      reason: reasonInput,
      duration: duration,
      expires: new Date(Date.now() + muteDurationMs)
    });

    // Auto-unmute after duration
    setTimeout(async () => {
      try {
        await targetUser.timeout(null);
        logger.info(`Auto-unmuted user ${targetUser.user.tag}`);
      } catch (error) {
        logger.error('Failed to auto-unmute user:', error);
      }
    }, muteDurationMs);

  } catch (error) {
    logger.error('Error muting user:', error);
    await interaction.reply({ 
      content: '❌ A apărut o eroare la mutarea utilizatorului!', 
      ephemeral: true 
    });
  }
}

export const banData = new ContextMenuCommandBuilder()
  .setName('Ban User')
  .setType(ApplicationCommandType.User);

export async function executeBan(interaction, context) {
  const { logger } = context;
  const targetUser = interaction.targetMember;
  const executor = interaction.member;

  // Allow only server owner
  if (executor.id !== executor.guild.ownerId) {
    logger.warn(`Ban permission denied for ${executor.user.tag} - not server owner`);
    await interaction.reply({ 
      content: '❌ Doar owner-ul serverului poate folosi această comandă!', 
      ephemeral: true 
    });
    return;
  }

  if (!targetUser) {
    await interaction.reply({ 
      content: '❌ Utilizatorul nu a fost găsit!', 
      ephemeral: true 
    });
    return;
  }

  if (targetUser.id === executor.id) {
    await interaction.reply({ 
      content: '❌ Nu îți poți da ban singur!', 
      ephemeral: true 
    });
    return;
  }

  if (!targetUser.manageable) {
    logger.error(`Cannot manage user ${targetUser.user.tag} - missing permissions`);
    logger.error(`Bot role: ${interaction.guild.members.me.roles.cache.map(r => r.name).join(', ')}`);
    logger.error(`Target user roles: ${targetUser.roles.cache.map(r => r.name).join(', ')}`);
    logger.error(`Bot position: ${interaction.guild.members.me.roles.highest.position}`);
    logger.error(`Target user position: ${targetUser.roles.highest.position}`);
    await interaction.reply({ 
      content: '❌ Nu pot modifica acest utilizator! Verifică permisiunile bot-ului!', 
      ephemeral: true 
    });
    return;
  }

  try {
    // Mute permanent pe server (7 zile cu auto-renewal)
    const permanentMuteMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    logger.info(`Attempting permanent mute: ${executor.user.tag} -> ${targetUser.user.tag}`);
    logger.info(`Target user ID: ${targetUser.id}, Executor ID: ${executor.id}`);
    logger.info(`Duration: ${permanentMuteMs}ms (${permanentMuteMs / (1000 * 60 * 60)} hours)`);
    logger.info(`NOTĂ: Auto-renewal la fiecare 6 zile pentru permanent`);
    
    // Calculăm data de expirare corectă în format ISO 8601
    const expiresAt = new Date(Date.now() + permanentMuteMs);
    const expiresAtISO = expiresAt.toISOString();
    
    logger.info(`Attempting to apply timeout: ${permanentMuteMs}ms`);
    logger.info(`Expires at: ${expiresAtISO}`);
    logger.info(`Expires timestamp: ${expiresAt.getTime()}`);
    logger.info(`Current time: ${new Date().toISOString()}`);
    logger.info(`Current timestamp: ${Date.now()}`);
    
    // Folosim abordarea directă cu timeout() - Discord.js se ocupă de format
    const timeoutResult = await targetUser.timeout(permanentMuteMs, `Ban permanent de către owner: ${executor.user.tag}`);
    
    logger.info(`Timeout result:`, timeoutResult);
    logger.info(`Successfully applied timeout to ${targetUser.user.tag}`);
    logger.info(`Timeout expires at: ${expiresAtISO}`);
    logger.info(`NOTĂ: Auto-renewal programat peste 6 zile`);
    
    // Programăm auto-renewal peste 6 zile
    setTimeout(async () => {
      try {
        logger.info(`Auto-renewal pentru ${targetUser.user.tag} - reaplicare timeout`);
        const user = await interaction.guild.members.fetch(targetUser.id);
        if (user) {
          await user.timeout(permanentMuteMs, `Ban permanent auto-renewal de către owner: ${executor.user.tag}`);
          logger.info(`Auto-renewal successful for ${targetUser.user.tag}`);
          
          // Programăm următorul auto-renewal
          scheduleAutoRenewal(interaction, targetUser, executor);
        }
      } catch (error) {
        logger.error(`Auto-renewal failed for ${targetUser.user.tag}:`, error);
      }
    }, 6 * 24 * 60 * 60 * 1000); // 6 zile
    
    // Salvăm informațiile pentru auto-renewal
    if (!global.banRenewals) global.banRenewals = new Map();
    global.banRenewals.set(targetUser.id, {
      executor: executor.id,
      guild: interaction.guild.id,
      duration: permanentMuteMs,
      reason: `Ban permanent de către owner: ${executor.user.tag}`
    });
    
    const banEmbed = {
      title: '🔇 Utilizator Mutat Permanent',
      description: `**${targetUser.user.tag}** a primit ban permanent pe server`,
      color: 0xFF0000,
      fields: [
        { name: '👤 Utilizator', value: `<@${targetUser.id}>`, inline: true },
        { name: '⏰ Durată', value: 'Permanent', inline: true },
        { name: '👨‍⚖️ Owner', value: `<@${executor.id}>`, inline: true },
        { name: '⏱️ Expiră la', value: 'Permanent', inline: true }
      ],
      timestamp: new Date().toISOString()
    };

    await interaction.reply({ embeds: [banEmbed] });
    logger.info(`User ${targetUser.user.tag} permanently muted by ${executor.user.tag}`);

    // Creăm postare în forum pentru tracking
    try {
      await createModerationPost(interaction, {
        type: 'ban',
        target: targetUser,
        executor: executor,
        reason: `Ban permanent de către owner: ${executor.user.tag}`,
        duration: 7 * 24 * 60, // 7 days in minutes
        expires: expiresAt
      });
      logger.info(`Moderation post created for ${targetUser.user.tag}`);
    } catch (forumError) {
      logger.error('Error creating moderation post:', forumError);
    }

  } catch (error) {
    logger.error('Error permanently muting user:', error);
    logger.error('Error details:', {
      targetUserId: targetUser?.id,
      executorId: executor?.id,
      errorMessage: error.message,
      errorStack: error.stack
    });
    await interaction.reply({ 
      content: '❌ A apărut o eroare la mutarea permanentă a utilizatorului!', 
      ephemeral: true 
    });
  }
}

/**
 * Programează următorul auto-renewal pentru ban permanent
 */
async function scheduleAutoRenewal(interaction, targetUser, executor) {
  const permanentMuteMs = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  setTimeout(async () => {
    try {
      logger.info(`Auto-renewal programat pentru ${targetUser.user.tag} - reaplicare timeout`);
      const user = await interaction.guild.members.fetch(targetUser.id);
      if (user) {
        await user.timeout(permanentMuteMs, `Ban permanent auto-renewal de către owner: ${executor.user.tag}`);
        logger.info(`Auto-renewal successful for ${targetUser.user.tag}`);
        
        // Programăm următorul auto-renewal (recursiv)
        scheduleAutoRenewal(interaction, targetUser, executor);
      } else {
        logger.warn(`User ${targetUser.user.tag} nu mai este pe server, oprire auto-renewal`);
        // Ștergem din map
        if (global.banRenewals) {
          global.banRenewals.delete(targetUser.id);
        }
      }
    } catch (error) {
      logger.error(`Auto-renewal failed for ${targetUser.user.tag}:`, error);
      // Încercăm din nou peste 1 oră
      setTimeout(() => scheduleAutoRenewal(interaction, targetUser, executor), 60 * 60 * 1000);
    }
  }, 6 * 24 * 60 * 60 * 1000); // 6 zile
}

export const kickData = new ContextMenuCommandBuilder()
  .setName('Kick User')
  .setType(ApplicationCommandType.User);

export async function executeKick(interaction, context) {
  const { logger } = context;
  const targetUser = interaction.targetMember;
  const executor = interaction.member;

  // Allow only server owner
  if (executor.id !== executor.guild.ownerId) {
    logger.warn(`Kick permission denied for ${executor.user.tag} - not server owner`);
    await interaction.reply({ 
      content: '❌ Doar owner-ul serverului poate folosi această comandă!', 
      ephemeral: true 
    });
    return;
  }

  if (!targetUser) {
    await interaction.reply({ 
      content: '❌ Utilizatorul nu a fost găsit!', 
      ephemeral: true 
    });
    return;
  }

  if (targetUser.id === executor.id) {
    await interaction.reply({ 
      content: '❌ Nu îți poți da kick singur!', 
      ephemeral: true 
    });
    return;
  }

  if (!targetUser.kickable) {
    await interaction.reply({ 
      content: '❌ Nu pot da kick acestui utilizator! Verifică permisiunile bot-ului.', 
      ephemeral: true 
    });
    return;
  }

  try {
    await targetUser.kick(`Kick de către admin: ${executor.user.tag}`);
    
    const kickEmbed = {
      title: '👢 Utilizator Dat Afară',
      description: `**${targetUser.user.tag}** a primit kick`,
      color: 0xFFA500,
      fields: [
        { name: '👤 Utilizator', value: `<@${targetUser.id}>`, inline: true },
        { name: '🔄 Status', value: 'Se poate reconecta', inline: true },
        { name: '👨‍⚖️ Admin', value: `<@${executor.id}>`, inline: true }
      ],
      timestamp: new Date().toISOString()
    };

    await interaction.reply({ embeds: [kickEmbed] });
    logger.info(`User ${targetUser.user.tag} kicked by ${executor.user.tag}`);

    // Creăm postare în forum pentru tracking
    await createModerationPost(interaction, {
      type: 'kick',
      target: targetUser,
      executor: executor,
      reason: `Kick de către admin: ${executor.user.tag}`
    });

  } catch (error) {
    logger.error('Error kicking user:', error);
    await interaction.reply({ 
      content: '❌ A apărut o eroare la darea afară a utilizatorului!', 
      ephemeral: true 
    });
  }
}
