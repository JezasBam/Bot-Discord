import { AttachmentBuilder } from 'discord.js';
import {
  MAX_TRANSCRIPT_MESSAGES,
  MAX_TRANSCRIPT_CHARS,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENT_FILES,
  ATTACHMENT_DOWNLOAD_TIMEOUT_MS
} from '../../../config/constants.js';

export function formatTranscriptLine(message) {
  const ts = message.createdAt ? message.createdAt.toISOString() : new Date().toISOString();
  const author = message.author
    ? `${message.author.username}#${message.author.discriminator ?? '0'} (${message.author.id})`
    : 'Unknown';
  const content = (message.content || '').replaceAll('\r', '').replaceAll('\n', '\\n');
  const attachments = message.attachments?.size
    ? ` attachments=${[...message.attachments.values()].map((a) => a.url).join(', ')}`
    : '';
  return `[${ts}] ${author}: ${content}${attachments}`;
}

export async function fetchThreadMessages(thread, options = {}) {
  const maxMessages = options.maxMessages ?? MAX_TRANSCRIPT_MESSAGES;

  let before;
  const all = [];
  while (all.length < maxMessages) {
    const remaining = maxMessages - all.length;
    const batchSize = Math.min(100, remaining);
    const batch = await thread.messages.fetch({ limit: batchSize, before });
    if (!batch.size) break;
    const msgs = [...batch.values()];
    all.push(...msgs);
    before = msgs[msgs.length - 1].id;
    if (batch.size < batchSize) break;
  }

  all.sort((a, b) => (a.createdTimestamp ?? 0) - (b.createdTimestamp ?? 0));
  return all;
}

export async function buildThreadTranscript(thread, options = {}) {
  const maxMessages = options.maxMessages ?? MAX_TRANSCRIPT_MESSAGES;
  const maxChars = options.maxChars ?? MAX_TRANSCRIPT_CHARS;

  const all = await fetchThreadMessages(thread, { maxMessages });

  let out = '';
  for (const msg of all) {
    const line = formatTranscriptLine(msg) + '\n';
    if (out.length + line.length > maxChars) break;
    out += line;
  }
  return out || '(no messages)\n';
}

export function createTranscriptFile(transcript, threadId) {
  return new AttachmentBuilder(Buffer.from(transcript, 'utf8'), {
    name: `ticket-transcript-${threadId}.txt`
  });
}

function shouldArchiveAttachment(att) {
  return Boolean(att?.url);
}

export async function downloadAttachmentToFile(att, options = {}) {
  const maxBytes = options.maxBytes ?? MAX_ATTACHMENT_BYTES;
  const timeoutMs = options.timeoutMs ?? ATTACHMENT_DOWNLOAD_TIMEOUT_MS;

  const url = att?.url;
  if (!url) return { file: null, skipped: { name: att?.name || 'file', url: null, reason: 'missing_url' } };

  const contentLength = typeof att?.size === 'number' ? att.size : null;
  if (contentLength && contentLength > maxBytes) {
    return { file: null, skipped: { name: att?.name || 'file', url, reason: 'too_large' } };
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      return { file: null, skipped: { name: att?.name || 'file', url, reason: `http_${res.status}` } };
    }
    const lenHeader = res.headers.get('content-length');
    const len = lenHeader ? Number(lenHeader) : null;
    if (len && Number.isFinite(len) && len > maxBytes) {
      try {
        res.body?.cancel();
      } catch {
        /* ignore */
      }
      return { file: null, skipped: { name: att?.name || 'file', url, reason: 'too_large' } };
    }

    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    if (buf.length > maxBytes) {
      return { file: null, skipped: { name: att?.name || 'file', url, reason: 'too_large' } };
    }

    const safeName = (att?.name || `media-${Date.now()}`).slice(0, 120);
    return { file: new AttachmentBuilder(buf, { name: safeName }), skipped: null };
  } catch {
    return { file: null, skipped: { name: att?.name || 'file', url, reason: 'download_failed' } };
  } finally {
    clearTimeout(timer);
  }
}

export async function collectFilesFromMessages(messages, options = {}) {
  const maxFiles = options.maxFiles ?? MAX_ATTACHMENT_FILES;
  const maxBytes = options.maxBytes ?? MAX_ATTACHMENT_BYTES;
  const outFiles = [];
  const skipped = [];

  for (const msg of messages) {
    if (!msg?.attachments?.size) continue;
    for (const att of msg.attachments.values()) {
      if (!shouldArchiveAttachment(att)) continue;
      if (outFiles.length >= maxFiles) return { files: outFiles, skipped };

      const { file, skipped: s } = await downloadAttachmentToFile(att, { maxBytes });
      if (file) outFiles.push(file);
      else if (s) skipped.push(s);
    }
  }

  return { files: outFiles, skipped };
}

export function formatSkippedFiles(skippedFiles) {
  return (skippedFiles || [])
    .slice(0, 10)
    .map((s) => `${s.name}: ${s.url || ''} (${s.reason})`)
    .join('\n');
}
