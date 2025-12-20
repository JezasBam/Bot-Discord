import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { projectRoot } from '../util/paths.js';

export async function loadEvents(client, context = {}) {
  const eventsDir = path.join(projectRoot, 'src', 'events');

  let entries;
  try {
    entries = await fs.readdir(eventsDir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  const loaded = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.js')) continue;

    const fullPath = path.join(eventsDir, entry.name);
    const mod = await import(pathToFileURL(fullPath).href);

    if (!mod?.name || typeof mod.execute !== 'function') {
      continue;
    }

    const handler = (...args) => mod.execute(...args, context);

    if (mod.once) {
      client.once(mod.name, handler);
    } else {
      client.on(mod.name, handler);
    }

    loaded.push({
      name: mod.name,
      file: entry.name,
      once: !!mod.once
    });
  }

  return loaded;
}
