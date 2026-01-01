import fs from 'node:fs/promises';
import path from 'node:path';

const DB_PATH = path.resolve(process.cwd(), 'data', 'db.json');

let dbQueue = Promise.resolve();

function enqueueDb(task) {
  const next = dbQueue.then(task, task);
  dbQueue = next.catch(() => {});
  return next;
}

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    // Backup corrupt file and return initial state
    const backupPath = `${filePath}.corrupt.${Date.now()}`;
    await fs.rename(filePath, backupPath);
    console.error(`Corrupt DB file backed up to ${backupPath}`);
    return { version: 1, guilds: {} };
  }
}

async function writeJsonFileAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  const tmpPath = path.join(dir, `.${path.basename(filePath)}.tmp`);
  const payload = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(tmpPath, payload, 'utf8');
  await fs.rename(tmpPath, filePath);
}

export async function loadDb() {
  try {
    return await readJsonFile(DB_PATH);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      const initial = { version: 1, guilds: {} };
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      await writeJsonFileAtomic(DB_PATH, initial);
      return initial;
    }
    throw err;
  }
}

export async function saveDb(db) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await writeJsonFileAtomic(DB_PATH, db);
}

export async function updateGuildConfig(guildId, updater) {
  return enqueueDb(async () => {
    const db = await loadDb();
    db.guilds[guildId] ??= {};
    const next = await updater(db.guilds[guildId]);
    if (next && typeof next === 'object') {
      db.guilds[guildId] = next;
    }
    await saveDb(db);
    return db.guilds[guildId];
  });
}
