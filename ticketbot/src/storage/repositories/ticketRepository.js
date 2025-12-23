import { loadDb, updateGuildConfig } from '../db.js';

const CONFIG_CACHE_TTL = 10_000;
const configCache = new Map();

export async function getGuildTicketConfig(guildId, useCache = true) {
  if (useCache) {
    const cached = configCache.get(guildId);
    if (cached && Date.now() - cached.ts < CONFIG_CACHE_TTL) {
      return cached.data;
    }
  }

  const db = await loadDb();
  const data = db.guilds?.[guildId]?.ticketSystem || null;

  configCache.set(guildId, { data, ts: Date.now() });
  return data;
}

export function invalidateConfigCache(guildId) {
  if (guildId) {
    configCache.delete(guildId);
  } else {
    configCache.clear();
  }
}

export function getKey(lang, userId) {
  return `${lang}:${userId}`;
}

export async function saveTicketToDb(guildId, key, threadId, ticketData) {
  invalidateConfigCache(guildId);

  return updateGuildConfig(guildId, async (c) => {
    c.ticketSystem ??= {};
    c.ticketSystem.openTickets ??= {};
    c.ticketSystem.ticketsByThread ??= {};

    c.ticketSystem.openTickets[key] = threadId;
    c.ticketSystem.ticketsByThread[threadId] = ticketData;

    return c;
  });
}

export async function updateTicketAcceptance(guildId, threadId, userId) {
  invalidateConfigCache(guildId);

  let acceptedNow = false;
  let acceptedIds = [];

  const updated = await updateGuildConfig(guildId, async (c) => {
    const t = c.ticketSystem;
    if (!t?.ticketsByThread?.[threadId]) return c;

    const ticket = t.ticketsByThread[threadId];
    ticket.acceptedByIds ??= [];
    if (!ticket.acceptedByIds.includes(userId)) {
      ticket.acceptedByIds.push(userId);
    }
    acceptedIds = ticket.acceptedByIds;

    if (!ticket.acceptedAt) {
      acceptedNow = true;
      ticket.acceptedAt = Date.now();
    }

    return c;
  });

  if (updated?.ticketSystem?.ticketsByThread?.[threadId]?.acceptedByIds) {
    acceptedIds = updated.ticketSystem.ticketsByThread[threadId].acceptedByIds;
  }

  return { acceptedNow, acceptedIds };
}

export async function removeTicketFromDb(guildId, threadId) {
  invalidateConfigCache(guildId);

  return updateGuildConfig(guildId, async (c) => {
    const t = c.ticketSystem;
    if (!t) return c;

    const m = t.ticketsByThread?.[threadId];
    if (m?.ownerId && m.lang) {
      const k = getKey(m.lang, m.ownerId);
      if (t.openTickets?.[k] === threadId) delete t.openTickets[k];
    }

    if (t.ticketsByThread?.[threadId]) delete t.ticketsByThread[threadId];
    return c;
  });
}

export async function cleanupOrphanTicket(guildId, key, threadId) {
  if (!guildId || !key || !threadId) return;
  invalidateConfigCache(guildId);

  await updateGuildConfig(guildId, async (c) => {
    const t = c.ticketSystem;
    if (!t) return c;
    if (t.openTickets?.[key] === threadId) {
      delete t.openTickets[key];
    }
    if (t.ticketsByThread?.[threadId]) {
      delete t.ticketsByThread[threadId];
    }
    return c;
  });
}

export async function updatePanelMessageId(guildId, lang, messageId) {
  invalidateConfigCache(guildId);

  return updateGuildConfig(guildId, async (cfg) => {
    cfg.ticketSystem ??= {};
    cfg.ticketSystem[lang] ??= {};
    cfg.ticketSystem[lang].panelMessageId = messageId;
    return cfg;
  });
}

export async function saveGuildTicketSetup(guildId, lang, setupData) {
  invalidateConfigCache(guildId);

  return updateGuildConfig(guildId, async (cfg) => {
    cfg.ticketSystem ??= {};
    cfg.ticketSystem.supportRoleId = setupData.supportRoleId;
    cfg.ticketSystem[lang] = {
      categoryId: setupData.categoryId,
      channelId: setupData.channelId,
      supportLogChannelId: setupData.supportLogChannelId,
      panelMessageId: setupData.panelMessageId
    };
    return cfg;
  });
}
