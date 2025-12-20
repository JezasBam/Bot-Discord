export const TEXT = {
  ro: {
    notConfigured: 'Sistemul de ticket nu este configurat. Ruleaza /ticketsetup.',
    wrongChannel: 'Foloseste butonul de ticket din canalul corect.',
    subjectRequired: 'Subiectul este obligatoriu.',
    alreadyOpen: (threadId) => `Ai deja un ticket deschis: <#${threadId}>`,
    created: (threadId) => `Ticket creat: <#${threadId}>`,
    cooldown: (seconds) => `Te rog asteapta ${seconds}s inainte sa deschizi alt ticket.`,
    closeTitle: 'Inchide ticket',
    closeReasonLabel: 'Motiv inchidere (optional)',
    closeNotesLabel: 'Note (optional)',
    closeStarted: 'Inchid ticketul...',
    closeSummary: ({ archivedCount, skippedCount }) =>
      `Ticket inchis. Fisiere arhivate: ${archivedCount}. Sarite: ${skippedCount}.`,
    closeDenied: 'Nu poti inchide acest ticket.',
    ticketCreatedTitle: 'Ticket creat',
    ticketCreatedDesc: 'Asteapta pana cand un membru din Support accepta ticketul.',
    subjectLabel: 'Subiect',
    descriptionLabel: 'Descriere',
    mediaLabel: 'Media',
    mediaNote: 'Poze/videoclipuri se pot trimite ulterior in thread.',
    openTicketTitle: 'Deschide ticket',
    descriptionPlaceholder: 'Nota: Poze/videoclipuri le poti pune ulterior in thread.',
    newTicketTitle: 'Ticket nou (RO)',
    ticketClosedTitle: 'Ticket inchis',
    archivedFilesLabel: 'Fisiere arhivate',
    skippedFilesLabel: 'Fisiere sarite',
    postedToLabel: 'Trimis in',
    reasonLabel: 'Motiv',
    notesLabel: 'Note',
    firstSkippedLabel: 'Primele fisiere sarite'
  },
  en: {
    notConfigured: 'Ticket system is not configured. Run /ticketsetup.',
    wrongChannel: 'Use the ticket button in the correct ticket panel channel.',
    subjectRequired: 'Subject is required.',
    alreadyOpen: (threadId) => `You already have an open ticket: <#${threadId}>`,
    created: (threadId) => `Created ticket: <#${threadId}>`,
    cooldown: (seconds) => `Please wait ${seconds}s before opening another ticket.`,
    closeTitle: 'Close ticket',
    closeReasonLabel: 'Close reason (optional)',
    closeNotesLabel: 'Notes (optional)',
    closeStarted: 'Closing ticket...',
    closeSummary: ({ archivedCount, skippedCount }) =>
      `Ticket closed. Archived files: ${archivedCount}. Skipped: ${skippedCount}.`,
    closeDenied: 'You cannot close this ticket.',
    ticketCreatedTitle: 'Ticket created',
    ticketCreatedDesc: 'Please wait until a Support member accepts the ticket.',
    subjectLabel: 'Subject',
    descriptionLabel: 'Description',
    mediaLabel: 'Media',
    mediaNote: 'Images/videos can be sent later in the thread.',
    openTicketTitle: 'Open ticket',
    descriptionPlaceholder: 'Note: You can upload images/videos later in the thread.',
    newTicketTitle: 'New ticket (EN)',
    ticketClosedTitle: 'Ticket closed',
    archivedFilesLabel: 'Archived files',
    skippedFilesLabel: 'Skipped files',
    postedToLabel: 'Posted to',
    reasonLabel: 'Reason',
    notesLabel: 'Notes',
    firstSkippedLabel: 'First skipped files'
  }
};

export function t(lang) {
  return TEXT[lang] ?? TEXT.en;
}
