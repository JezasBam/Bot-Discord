import { SlashCommandBuilder } from 'discord.js';
import { ensureInfoTag } from '../utils/moderation-forum.js';
import { getLogger } from '../../ticketbot/src/core/logger.js';

const logger = getLogger();

export const data = new SlashCommandBuilder()
  .setName('check-support-tag')
  .setDescription('Verifică și creează tag-ul Support în forum-ul de support')
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
    const infoTagExists = currentTags.some(tag => tag.name.toLowerCase() === 'info' || tag.name.toLowerCase() === '🔵 info');
    const supportTagExists = currentTags.some(tag => tag.name.toLowerCase() === 'support' || tag.name.toLowerCase() === '🟠 support');
    const rezolvatTagExists = currentTags.some(tag => tag.name.toLowerCase() === 'rezolvat' || tag.name.toLowerCase() === '🟢 rezolvat');
    
    let response = `📋 Tag-uri disponibile în forum-ul **${forumChannel.name}**:\n`;
    currentTags.forEach(tag => {
      response += `  • ${tag.name} ${tag.emoji || ''}\n`;
    });

    if (infoTagExists && supportTagExists && rezolvatTagExists) {
      response += `\n✅ Toate tag-urile (INFO, Support și Rezolvat) există!`;
    } else {
      response += `\n❌ Lipsesc tag-uri:`;
      if (!infoTagExists) response += ` INFO`;
      if (!supportTagExists) response += ` Support`;
      if (!rezolvatTagExists) response += ` Rezolvat`;
      
      response += `\n🔄 Încerc să le creez...`;
      
      // Încercăm să adăugăm tag-ul INFO (folosind funcția existentă)
      const infoTag = await ensureInfoTag(forumChannel);
      
      // Încercăm să adăugăm manual tag-ul Support
      if (!supportTagExists) {
        try {
          const newTags = [
            ...forumChannel.availableTags,
            {
              name: '🟠 Support'
            }
          ];
          await forumChannel.setAvailableTags(newTags);
          response += `\n✅ Tag-ul Support a fost creat cu succes!`;
        } catch (err) {
          response += `\n❌ Eroare la crearea tag-ului Support: ${err.message}`;
        }
      }
      
      // Încercăm să adăugăm manual tag-ul Rezolvat
      if (!rezolvatTagExists) {
        try {
          const newTags = [
            ...forumChannel.availableTags,
            {
              name: '🟢 Rezolvat'
            }
          ];
          await forumChannel.setAvailableTags(newTags);
          response += `\n✅ Tag-ul Rezolvat a fost creat cu succes!`;
        } catch (err) {
          response += `\n❌ Eroare la crearea tag-ului Rezolvat: ${err.message}`;
        }
      }
      
      if (infoTag) {
        response += `\n✅ Tag-ul INFO este disponibil`;
      }
    }

    await interaction.editReply({ content: response });

  } catch (error) {
    logger.error('Error in check-support-tag command:', error);
    await interaction.editReply({
      content: '❌ A apărut o eroare la verificarea tag-urilor!'
    });
  }
}
