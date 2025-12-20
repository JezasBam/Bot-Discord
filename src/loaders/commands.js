import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { projectRoot } from '../util/paths.js';

export async function loadCommands() {
  const commandsDir = path.join(projectRoot, 'src', 'commands');
  const entries = await fs.readdir(commandsDir, { withFileTypes: true });

  const commands = new Map();
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.js')) continue;

    const fullPath = path.join(commandsDir, entry.name);
    const mod = await import(pathToFileURL(fullPath).href);
    if (!mod?.data?.name || typeof mod.execute !== 'function') continue;

    commands.set(mod.data.name, mod);
  }

  return commands;
}

export async function getCommandJson() {
  const commands = await loadCommands();
  return [...commands.values()].map((c) => c.data.toJSON());
}
