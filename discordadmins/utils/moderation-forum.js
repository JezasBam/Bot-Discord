import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { loadConfig } from '../../ticketbot/src/config/index.js';
import { getLogger } from '../../ticketbot/src/core/logger.js';

const logger = getLogger();
const config = loadConfig();

/**
 * Asigură că tag-ul INFO există în forum
 */
export async function ensureInfoTag(forumChannel) {
  try {
    // Verificăm dacă tag-ul INFO există deja
    const existingTag = forumChannel.availableTags.find(tag => 
      tag.name.toLowerCase() === 'info' || tag.name.toLowerCase() === '🔵 info'
    );
    
    if (existingTag) {
      logger.info('INFO tag already exists in forum');
      return existingTag;
    }
    
    // Adăugăm tag-ul INFO dacă nu există
    const newTags = [
      ...forumChannel.availableTags,
      {
        name: '🔵 INFO'
      }
    ];
    
    await forumChannel.setAvailableTags(newTags);
    logger.info('Successfully added INFO tag to forum');
    
    // Returnăm tag-ul nou creat
    return forumChannel.availableTags.find(tag => tag.name === '🔵 INFO');
    
  } catch (error) {
    logger.error('Failed to ensure INFO tag:', error);
    return null;
  }
}

/**
 * Creează sau actualizează un thread în forum pentru o acțiune de moderare
 * @param {Object} interaction - Discord interaction
 * @param {Object} action - Detaliile acțiunii
 * @param {string} action.type - 'mute', 'kick', 'ban'
 * @param {Object} action.target - Utilizatorul țintă
 * @param {Object} action.executor - Cine a executat acțiunea
 * @param {string} action.reason - Motivul acțiunii
 * @param {number} action.duration - Durata (doar pentru mute)
 * @param {Date} action.expires - Când expiră (doar pentru mute)
 */
export async function createModerationPost(interaction, action) {
  try {
    const guild = interaction.guild;
    
    // Căutăm canalul forum de support
    const forumChannel = guild.channels.cache.find(channel => 
      channel.type === 15 && // GuildForum
      (channel.name === 'support-ro' || channel.name === 'support-en')
    );

    if (!forumChannel) {
      logger.warn('Support forum channel not found');
      return null;
    }

    // Asigurăm tag-ul INFO în forum
    const infoTag = await ensureInfoTag(forumChannel);

    // Căutăm thread existent pentru acest utilizator
    const existingThread = await findUserThread(forumChannel, action.target.user.tag);
    
    if (existingThread) {
      // Actualizăm thread-ul existent
      await updateExistingThread(existingThread, action, infoTag);
      logger.info(`Updated moderation thread: ${existingThread.id} for ${action.type} on ${action.target.user.tag}`);
      return existingThread;
    } else {
      // Creăm thread nou
      const newThread = await createNewThread(forumChannel, action, infoTag);
      logger.info(`Created new moderation thread: ${newThread.id} for ${action.type} on ${action.target.user.tag}`);
      return newThread;
    }

  } catch (error) {
    logger.error('Error creating moderation thread:', error);
    return null;
  }
}

/**
 * Caută un thread existent pentru un utilizator
 */
async function findUserThread(forumChannel, userTag) {
  try {
    // Preluăm toate thread-urile active din forum
    const threads = forumChannel.threads.cache;
    
    // Căutăm thread-ul după numele utilizatorului
    for (const [threadId, thread] of threads) {
      if (thread.name === userTag && !thread.archived) {
        return thread;
      }
    }
    
    // Dacă nu găsim în cache, încercăm să fetch-uim
    const activeThreads = await forumChannel.threads.fetchActive();
    for (const thread of activeThreads.threads.values()) {
      if (thread.name === userTag && !thread.archived) {
        return thread;
      }
    }
    
    return null;
  } catch (error) {
    logger.error('Error finding user thread:', error);
    return null;
  }
}

/**
 * Creează un thread nou pentru utilizator
 */
async function createNewThread(forumChannel, action, infoTag) {
  // Numele thread-ului bazat pe utilizator
  const threadName = `${action.target.user.tag}`.slice(0, 100);

  // Creăm embed-ul pentru postare
  const embed = createModerationEmbed(action);

  // Creăm butoanele de acțiune
  const row = createActionButtons(action);

  // Creăm thread-ul în forum cu tag-ul INFO
  const thread = await forumChannel.threads.create({
    name: threadName,
    message: {
      embeds: [embed],
      components: [row]
    },
    appliedTags: infoTag ? [infoTag.id] : []
  });

  // Închidem imediat thread-ul (locked)
  try {
    await thread.setLocked(true);
    logger.info(`Thread ${thread.id} created and locked for user ${action.target.user.tag}`);
  } catch (error) {
    logger.warn('Failed to lock new thread:', error.message);
  }

  return thread;
}

/**
 * Actualizează un thread existent cu noua acțiune
 */
async function updateExistingThread(thread, action, infoTag) {
  try {
    // Creăm embed pentru noua acțiune
    const newEmbed = createModerationEmbed(action);
    
    // Creăm butoane pentru noua acțiune
    const newButtons = createActionButtons(action);
    
    // Trimitem un nou mesaj în thread cu noua acțiune
    await thread.send({
      embeds: [newEmbed],
      components: [newButtons]
    });
    
    // Asigurăm tag-ul INFO
    if (infoTag) {
      // Verificăm dacă tag-ul INFO este deja aplicat
      if (!thread.appliedTags.includes(infoTag.id)) {
        await thread.setAppliedTags([...thread.appliedTags, infoTag.id]);
        logger.info(`Applied INFO tag to thread ${thread.id}`);
      }
    } else {
      logger.warn('INFO tag not available for thread application');
    }
    
    // Asigurăm că thread-ul rămâne locked
    if (!thread.locked) {
      await thread.setLocked(true);
      logger.info(`Re-locked thread ${thread.id}`);
    }
    
  } catch (error) {
    logger.error('Error updating existing thread:', error);
    throw error;
  }
}

/**
 * Creează embed-ul pentru acțiunea de moderare
 */
function createModerationEmbed(action) {
  const colors = {
    mute: 0xFF6B6B, // Red
    kick: 0xFFA500, // Orange  
    ban: 0xFF0000   // Dark Red
  };

  const emojis = {
    mute: '🔇',
    kick: '👢', 
    ban: '�' // 🔇 pentru că ban-ul e acum mute permanent
  };

  const embed = new EmbedBuilder()
    .setColor(colors[action.type])
    .setTitle(`${emojis[action.type]} ${action.type === 'ban' ? 'Mute Permanent' : action.type.toUpperCase()} - ${action.target.user.tag}`)
    .setThumbnail(action.target.user.displayAvatarURL())
    .addFields(
      { 
        name: '👤 Utilizator', 
        value: `<@${action.target.id}> (${action.target.user.tag})`, 
        inline: true 
      },
      { 
        name: '👨‍⚖️ Executat de', 
        value: `<@${action.executor.id}> (${action.executor.user.tag})`, 
        inline: true 
      },
      { 
        name: '📅 Data', 
        value: `<t:${Math.floor(Date.now() / 1000)}:F>`, 
        inline: true 
      }
    );

  // Adăugăm câmpuri specifice fiecărui tip de acțiune
  if (action.type === 'mute') {
    embed.addFields(
      { 
        name: '⏰ Durată', 
        value: `${action.duration} minute`, 
        inline: true 
      },
      { 
        name: '⏱️ Expiră la', 
        value: `<t:${Math.floor(action.expires.getTime() / 1000)}:R>`, 
        inline: true 
      }
    );
  }

  if (action.type === 'ban') {
    embed.addFields(
      { 
        name: '⏰ Durată', 
        value: '28 zile (permanent)', 
        inline: true 
      },
      { 
        name: '⏱️ Expiră la', 
        value: `<t:${Math.floor(action.expires.getTime() / 1000)}:R>`, 
        inline: true 
      }
    );
  }

  if (action.reason) {
    embed.addFields(
      { 
        name: '📝 Motiv', 
        value: action.reason, 
        inline: false 
      }
    );
  }

  embed
    .setFooter({ text: `ID: ${action.target.id}` })
    .setTimestamp();

  return embed;
}

/**
 * Creează butoanele de acțiune pentru postare
 */
function createActionButtons(action) {
  const row = new ActionRowBuilder();

  if (action.type === 'mute') {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`moderation_unmute_${action.target.id}`)
        .setLabel('🔊 Unmute')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔊')
    );
  }

  if (action.type === 'ban') {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`moderation_unban_${action.target.id}`)
        .setLabel('🔓 Unban')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🔓')
    );
  }
  
  return row;
}

/**
 * Procesează interacțiunile cu butoanele de moderare
 */
export async function handleModerationButton(interaction) {
  const customId = interaction.customId;
  
  if (!customId.startsWith('moderation_')) return;

  const [, action, userId] = customId.split('_');
  const guild = interaction.guild;
  const member = interaction.member;

  try {
    // Verificăm permisiunile
    if (action === 'unmute') {
      // Doar rolul Support poate da unmute
      const hasSupportRole = member.roles.cache.some(role => role.name === 'Support');
      if (!hasSupportRole) {
        await interaction.reply({
          content: '❌ Doar utilizatorii cu rolul **Support** pot folosi această comandă!',
          ephemeral: true
        });
        return;
      }
    }

    if (action === 'unban') {
      // Doar owner-ul poate da unban
      if (member.id !== guild.ownerId) {
        await interaction.reply({
          content: '❌ Doar owner-ul serverului poate folosi această comandă!',
          ephemeral: true
        });
        return;
      }
    }

    // Executăm acțiunea
    if (action === 'unmute') {
      await handleUnmute(interaction, userId);
    } else if (action === 'unban') {
      await handleUnban(interaction, userId);
    }

  } catch (error) {
    logger.error(`Error handling moderation button ${action}:`, error);
    await interaction.reply({
      content: '❌ A apărut o eroare la procesarea cererii!',
      ephemeral: true
    });
  }
}

/**
 * Gestionează acțiunea de unmute
 */
async function handleUnmute(interaction, userId) {
  const guild = interaction.guild;
  
  try {
    const targetUser = await guild.members.fetch(userId);
    if (!targetUser) {
      await interaction.reply({
        content: '❌ Utilizatorul nu a fost găsit!',
        ephemeral: true
      });
      return;
    }

    await targetUser.timeout(null);
    
    // Actualizăm embed-ul
    await updateModerationPost(interaction.message, 'UNMUTED', interaction.member);

    await interaction.update({
      content: '✅ Utilizatorul a primit unmute cu succes!',
      components: [] // Eliminăm butoanele
    });

    logger.info(`User ${targetUser.user.tag} unmuted by ${interaction.member.user.tag}`);

  } catch (error) {
    logger.error('Error unmuting user:', error);
    await interaction.reply({
      content: '❌ A apărut o eroare la ridicarea mute-ului!',
      ephemeral: true
    });
  }
}

/**
 * Gestionează acțiunea de unban
 */
async function handleUnban(interaction, userId) {
  const guild = interaction.guild;
  
  try {
    const targetUser = await guild.members.fetch(userId);
    if (!targetUser) {
      await interaction.reply({
        content: '❌ Utilizatorul nu a fost găsit!',
        ephemeral: true
      });
      return;
    }

    // Ridicăm mute-ul permanent (timeout)
    await targetUser.timeout(null);
    
    // Oprimem auto-renewal dacă există
    if (global.banRenewals && global.banRenewals.has(userId)) {
      global.banRenewals.delete(userId);
      logger.info(`Auto-renewal oprit pentru utilizatorul ${userId}`);
    }
    
    // Actualizăm embed-ul
    await updateModerationPost(interaction.message, 'UNBANNED', interaction.member);

    await interaction.update({
      content: '✅ Utilizatorul a primit unban cu succes!',
      components: [] // Eliminăm butoanele
    });

    logger.info(`User ${targetUser.user.tag} unbanned by ${interaction.member.user.tag}`);

  } catch (error) {
    logger.error('Error unbanning user:', error);
    await interaction.reply({
      content: '❌ A apărut o eroare la ridicarea ban-ului!',
      ephemeral: true
    });
  }
}

/**
 * Actualizează embed-ul postării de moderare
 */
async function updateModerationPost(message, status, executor) {
  try {
    const embed = message.embeds[0];
    if (!embed) return;

    // Adăugăm status-ul nou
    const updatedEmbed = EmbedBuilder.from(embed)
      .addFields(
        { 
          name: '✅ Status', 
          value: `${status} de <@${executor.id}> la <t:${Math.floor(Date.now() / 1000)}:R>`, 
          inline: false 
        }
      )
      .setColor(status === 'UNMUTED' ? 0x00FF00 : status === 'UNBANNED' ? 0x00FFFF : 0x00FF00); // Green pentru unmute, Cyan pentru unban

    await message.edit({ embeds: [updatedEmbed] });

  } catch (error) {
    logger.error('Error updating moderation post:', error);
  }
}
