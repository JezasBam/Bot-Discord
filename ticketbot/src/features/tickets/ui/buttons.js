import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function buildJoinButtonRow(threadId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_join_${threadId}`).setLabel('Join Ticket').setStyle(ButtonStyle.Secondary)
  );
}

export function buildDisabledJoinButtonRow(threadId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ticket_join_${threadId}`)
      .setLabel('Join Ticket')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );
}

export function buildCloseButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger)
  );
}

export function buildPanelButton(lang, customId, label) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(ButtonStyle.Primary)
  );
}
