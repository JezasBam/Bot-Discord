import { Events, MessageFlags } from 'discord.js';
import { handleTicketButton, handleTicketModalSubmit } from '../features/tickets/index.js';
import { withErrorHandling } from '../core/interaction-utils.js';

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction, context) {
  const { logger, client } = context;

  if (interaction.isButton()) {
    await withErrorHandling(interaction, () => handleTicketButton(interaction, context), logger);
    return;
  }

  if (interaction.isModalSubmit()) {
    await withErrorHandling(interaction, () => handleTicketModalSubmit(interaction, context), logger);
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
