import { SlashCommandBuilder } from 'discord.js';
import { ensureInfoTag } from '../utils/moderation-forum.js';
import { getLogger } from '../../ticketbot/src/core/logger.js';

const logger = getLogger();

export const data = new SlashCommandBuilder()
  .setName('ensure-info-tag')
  .setDescription('Forțează crearea tag-ului INFO în forum-ul de support')
  .setDefaultMemberPermissions(0); // Doar owner-ul poate folosi

export async function execute(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    
    // Căutăm canalul forum de support
    const forumChannel = guild.channels.cache.find(channel => 
      channel.type === 15 && // GuildForum
      (channel.name === 'support-ro' || channel.name === 'support-en')
    );

    if (!forumChannel) {
      await interaction.editReply({
        content: '❌ Forum-ul de support nu a fost găsit!'
      });
      return;
    }

    // Verificăm tag-urile curente
    const currentTags = forumChannel.availableTags;
    const infoTagExists = currentTags.some(tag => tag.name.toLowerCase() === 'info');
    
    let response = `📋 Forum: **${forumChannel.name}**\n`;
    response += `🏷️ Tag-uri curente: ${currentTags.length}\n`;
    
    currentTags.forEach(tag => {
      response += `  • ${tag.name} ${tag.emoji || ''}\n`;
    });

    if (infoTagExists) {
      response += `\n✅ Tag-ul INFO există deja!`;
    } else {
      response += `\n❌ Tag-ul INFO nu există. Încerc să-l creez...`;
      
      const infoTag = await ensureInfoTag(forumChannel);
      
      if (infoTag) {
        response += `\n✅ Tag-ul INFO a fost creat cu succes!`;
        response += `\n🏷️ Nume: ${infoTag.name} ${infoTag.emoji || ''}`;
        response += `\n🆔 ID: ${infoTag.id}`;
      } else {
        response += `\n❌ Eroare la crearea tag-ului INFO`;
      }
    }

    await interaction.editReply({ content: response });

  } catch (error) {
    logger.error('Error in ensure-info-tag command:', error);
    await interaction.editReply({
      content: '❌ A apărut o eroare la verificarea tag-ului INFO!'
    });
  }
}
