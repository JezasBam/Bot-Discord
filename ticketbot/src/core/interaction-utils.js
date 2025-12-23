import { MessageFlags } from 'discord.js';

export async function safeReply(interaction, options) {
  try {
    if (interaction.deferred || interaction.replied) {
      return await interaction.editReply(options);
    }
    return await interaction.reply(options);
  } catch (err) {
    if (err.code === 10062) return null;
    if (err.code === 40060) return null;
    throw err;
  }
}

export async function safeEphemeralReply(interaction, content) {
  return safeReply(interaction, {
    content,
    flags: MessageFlags.Ephemeral
  });
}

export async function safeEphemeralUpdate(interaction, payload) {
  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(payload);
    } else {
      await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral });
    }
    return true;
  } catch {
    try {
      await interaction.followUp({ ...payload, flags: MessageFlags.Ephemeral });
      return true;
    } catch {
      return false;
    }
  }
}

export async function safeDeferReply(interaction, ephemeral = true) {
  try {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({
        flags: ephemeral ? MessageFlags.Ephemeral : undefined
      });
    }
    return true;
  } catch (err) {
    if (err.code === 10062 || err.code === 40060) return false;
    throw err;
  }
}

export async function withErrorHandling(interaction, handler, logger) {
  try {
    await handler(interaction);
  } catch (err) {
    logger.error(`[${interaction.id}] Handler error:`, err);
    await safeReply(interaction, {
      content: 'An error occurred.',
      flags: MessageFlags.Ephemeral
    }).catch(() => {});
  }
}
