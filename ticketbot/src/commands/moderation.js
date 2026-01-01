import { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';
import { hasAdminRole } from '../utils/permissions.js';
import { loadConfig } from '../config/index.js';

const config = loadConfig();

export const banData = new ContextMenuCommandBuilder()
  .setName('Ban User')
  .setType(ApplicationCommandType.User);

export async function executeBan(interaction, context) {
  const { logger } = context;
  const targetUser = interaction.targetMember;
  const executor = interaction.member;

  if (!await hasAdminRole(executor)) {
    await interaction.reply({ 
      content: '❌ Nu ai permisiunea de a folosi această comandă!', 
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

  if (!targetUser.bannable) {
    await interaction.reply({ 
      content: '❌ Nu pot da ban acestui utilizator! Verifică permisiunile bot-ului.', 
      ephemeral: true 
    });
    return;
  }

  try {
    await targetUser.ban({ 
      reason: `Ban de către admin: ${executor.user.tag}`,
      deleteMessageSeconds: 0 
    });
    
    const banEmbed = {
      title: '🔨 Utilizator Banat',
      description: `**${targetUser.user.tag}** a primit ban permanent`,
      color: 0xFF0000,
      fields: [
        { name: '👤 Utilizator', value: `<@${targetUser.id}>`, inline: true },
        { name: '🔒 Tip', value: 'Permanent', inline: true },
        { name: '👨‍⚖️ Admin', value: `<@${executor.id}>`, inline: true }
      ],
      timestamp: new Date().toISOString()
    };

    await interaction.reply({ embeds: [banEmbed] });
    logger.info(`User ${targetUser.user.tag} banned by ${executor.user.tag}`);

  } catch (error) {
    logger.error('Error banning user:', error);
    await interaction.reply({ 
      content: '❌ A apărut o eroare la banarea utilizatorului!', 
      ephemeral: true 
    });
  }
}

export const kickData = new ContextMenuCommandBuilder()
  .setName('Kick User')
  .setType(ApplicationCommandType.User);

export async function executeKick(interaction, context) {
  const { logger } = context;
  const targetUser = interaction.targetMember;
  const executor = interaction.member;

  if (!await hasAdminRole(executor)) {
    await interaction.reply({ 
      content: '❌ Nu ai permisiunea de a folosi această comandă!', 
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

  } catch (error) {
    logger.error('Error kicking user:', error);
    await interaction.reply({ 
      content: '❌ A apărut o eroare la darea afară a utilizatorului!', 
      ephemeral: true 
    });
  }
}
