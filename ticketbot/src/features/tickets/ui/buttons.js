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

export function buildSupportCloseButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_support_close').setLabel('Închide').setStyle(ButtonStyle.Secondary)
  );
}

export function buildForumCloseButtonRow(threadId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_forum_close_${threadId}`).setLabel('Închide').setStyle(ButtonStyle.Secondary)
  );
}

export function buildJoinAndCloseButtonRow(threadId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ticket_join_${threadId}`).setLabel('Join Ticket').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`ticket_forum_close_${threadId}`).setLabel('Închide').setStyle(ButtonStyle.Secondary)
  );
}

export function buildDisabledJoinAndCloseButtonRow(threadId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`ticket_join_${threadId}`)
      .setLabel('Join Ticket')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder().setCustomId(`ticket_forum_close_${threadId}`).setLabel('Închide').setStyle(ButtonStyle.Secondary)
  );
}

export function buildPanelButton(lang, customId, label) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(ButtonStyle.Primary)
  );
}
