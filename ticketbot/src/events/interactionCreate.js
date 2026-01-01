import { Events, MessageFlags } from 'discord.js';
import { handleTicketButton, handleTicketModalSubmit } from '../features/tickets/index.js';
import { withErrorHandling } from '../core/interaction-utils.js';
import { executeMute, executeBan, executeKick, handleMuteModal } from '../../../discordadmins/commands/moderation.js';
import { handleModerationButton } from '../../../discordadmins/utils/moderation-forum.js';

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction, context) {
  const { logger, client } = context;

  if (interaction.isButton()) {
    await withErrorHandling(interaction, async () => {
      // Handle moderation buttons first
      if (interaction.customId.startsWith('moderation_')) {
        await handleModerationButton(interaction);
        return;
      }
      
      // Handle ticket buttons
      await handleTicketButton(interaction, context);
    }, logger);
    return;
  }

  if (interaction.isModalSubmit()) {
    await withErrorHandling(interaction, async () => {
      // Handle mute modal
      if (interaction.customId.startsWith('mute_')) {
        await handleMuteModal(interaction, context);
        return;
      }
      
      // Handle ticket modal
      await handleTicketModalSubmit(interaction, context);
    }, logger);
    return;
  }

  if (interaction.isUserContextMenuCommand()) {
    await withErrorHandling(interaction, async () => {
      switch (interaction.commandName) {
        case '🔇 Mute User':
          await executeMute(interaction, context);
          break;
        case 'Ban User':
          await executeBan(interaction, context);
          break;
        case 'Kick User':
          await executeKick(interaction, context);
          break;
        default:
          logger.warn(`Unknown context menu command: ${interaction.commandName}`);
          await interaction.reply({ 
            content: 'Comandă necunoscută!', 
            ephemeral: true 
          });
      }
    }, logger);
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    logger.warn(`Unknown command: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction, context);
  } catch (err) {
    logger.error(`Error executing /${interaction.commandName}:`, err);

    const payload = {
      content: 'An error occurred while executing this command.',
      flags: MessageFlags.Ephemeral
    };

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    } catch {
      /* interaction expired */
    }
  }
}
