import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { t } from '../i18n.js';

export function buildCreateTicketModal(lang) {
  const tx = t(lang);

  const modal = new ModalBuilder()
    .setCustomId(lang === 'ro' ? 'ticket_create_ro' : 'ticket_create_en')
    .setTitle(tx.openTicketTitle);

  const subjectInput = new TextInputBuilder()
    .setCustomId('subject')
    .setLabel(tx.subjectLabel)
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(80)
    .setRequired(true);

  const descriptionInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel(tx.descriptionLabel)
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(tx.descriptionPlaceholder)
    .setMinLength(0)
    .setMaxLength(1000)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(subjectInput),
    new ActionRowBuilder().addComponents(descriptionInput)
  );

  return modal;
}

export function buildCloseTicketModal(threadId, lang) {
  const tx = t(lang);

  const modal = new ModalBuilder().setCustomId(`ticket_close_confirm_${threadId}`).setTitle(tx.closeTitle);

  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel(tx.closeReasonLabel)
    .setStyle(TextInputStyle.Short)
    .setMinLength(0)
    .setMaxLength(100)
    .setRequired(false);

  const notesInput = new TextInputBuilder()
    .setCustomId('notes')
    .setLabel(tx.closeNotesLabel)
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(0)
    .setMaxLength(1000)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(reasonInput),
    new ActionRowBuilder().addComponents(notesInput)
  );

  return modal;
}
