import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { projectRoot } from '../util/paths.js';
import { loadAdminCommands } from '../../../discordadmins/index.js';

export async function loadCommands() {
  const commandsDir = path.join(projectRoot, 'src', 'commands');
  const entries = await fs.readdir(commandsDir, { withFileTypes: true });

  const commands = new Map();
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.js')) continue;

    const fullPath = path.join(commandsDir, entry.name);
    const mod = await import(pathToFileURL(fullPath).href);
    
    if (mod?.data?.name && typeof mod.execute === 'function') {
      commands.set(mod.data.name, mod);
    }
    
    if (mod?.muteData?.name && typeof mod.executeMute === 'function') {
      commands.set(mod.muteData.name, { ...mod, data: mod.muteData, execute: mod.executeMute });
    }
    
    if (mod?.banData?.name && typeof mod.executeBan === 'function') {
      commands.set(mod.banData.name, { ...mod, data: mod.banData, execute: mod.executeBan });
    }
    
    if (mod?.kickData?.name && typeof mod.executeKick === 'function') {
      commands.set(mod.kickData.name, { ...mod, data: mod.kickData, execute: mod.executeKick });
    }
  }

  const adminCommands = await loadAdminCommands();
  for (const [name, cmd] of adminCommands) {
    commands.set(name, cmd);
  }

  return commands;
}

export async function getCommandJson() {
  const commands = await loadCommands();
  return [...commands.values()].map((c) => c.data.toJSON());
}
