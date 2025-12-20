import { EmbedBuilder } from 'discord.js';
import { t } from '../i18n.js';

export function buildWaitingEmbed(lang, subject, description) {
  const tx = t(lang);

  return new EmbedBuilder()
    .setTitle(tx.ticketCreatedTitle)
    .setDescription(tx.ticketCreatedDesc)
    .addFields(
      { name: tx.subjectLabel, value: subject.slice(0, 1024) },
      { name: tx.descriptionLabel, value: description ? description.slice(0, 1024) : 'N/A' },
      { name: tx.mediaLabel, value: tx.mediaNote }
    )
    .setTimestamp(Date.now());
}

export function buildNewTicketLogEmbed(lang, user, thread, subject, description) {
  const tx = t(lang);

  return new EmbedBuilder()
    .setAuthor({
      name: `${user.username} (${user.id})`,
      iconURL: user.displayAvatarURL({ size: 128 })
    })
    .setTitle(tx.newTicketTitle)
    .setDescription(`Thread: ${thread.name} (ID: ${thread.id})`)
    .addFields(
      { name: tx.subjectLabel, value: subject.slice(0, 1024) },
      { name: tx.descriptionLabel, value: description ? description.slice(0, 1024) : 'N/A' }
    )
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .setTimestamp(Date.now());
}

export function buildAcceptedEmbed(userId) {
  return new EmbedBuilder()
    .setTitle('Ticket accepted')
    .setDescription(`Accepted by <@${userId}>`)
    .setTimestamp(Date.now());
}

export function buildClosedEmbed(userId, reason, notes) {
  return new EmbedBuilder()
    .setTitle('Ticket closed')
    .setDescription(`Closed by <@${userId}>`)
    .addFields(
      { name: 'Reason', value: reason ? reason.slice(0, 1024) : 'N/A' },
      { name: 'Notes', value: notes ? notes.slice(0, 1024) : 'N/A' }
    )
    .setTimestamp(Date.now());
}

export function buildTranscriptEmbed(thread, meta, closedByUserId, archivedCount, skippedCount, reason, notes) {
  const embed = new EmbedBuilder()
    .setTitle('Ticket transcript')
    .setDescription(`Thread: ${thread.name} (ID: ${thread.id})`)
    .addFields(
      { name: 'Owner', value: meta?.ownerId ? `<@${meta.ownerId}>` : 'N/A', inline: true },
      { name: 'Closed by', value: `<@${closedByUserId}>`, inline: true },
      { name: 'Archived files', value: String(archivedCount), inline: true },
      { name: 'Skipped files', value: String(skippedCount), inline: true }
    )
    .setTimestamp(Date.now());

  if (reason) embed.addFields({ name: 'Reason', value: reason.slice(0, 1024) });
  if (notes) embed.addFields({ name: 'Notes', value: notes.slice(0, 1024) });

  return embed;
}

export function buildCloseSummaryEmbed(
  lang,
  thread,
  archivedCount,
  skippedCount,
  logChannelMention,
  reason,
  notes,
  skippedPreview
) {
  const tx = t(lang);

  const embed = new EmbedBuilder()
    .setTitle(tx.ticketClosedTitle)
    .setDescription(`Thread: ${thread.name} (ID: ${thread.id})`)
    .addFields(
      { name: tx.archivedFilesLabel, value: String(archivedCount), inline: true },
      { name: tx.skippedFilesLabel, value: String(skippedCount), inline: true },
      { name: tx.postedToLabel, value: logChannelMention || 'N/A', inline: true }
    )
    .setTimestamp(Date.now());

  if (reason) embed.addFields({ name: tx.reasonLabel, value: reason.slice(0, 1024) });
  if (notes) embed.addFields({ name: tx.notesLabel, value: notes.slice(0, 1024) });
  if (skippedPreview) {
    embed.addFields({ name: tx.firstSkippedLabel, value: skippedPreview.slice(0, 1024) });
  }

  return embed;
}
