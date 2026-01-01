import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadAdminCommands() {
  const commandsDir = path.join(__dirname, 'commands');
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
    
    if (mod?.data?.name && typeof mod.execute === 'function') {
      commands.set(mod.data.name, mod);
    }
    
    // Adăugăm și comanda de verificare a tag-urilor
    if (mod.name === 'check-support-tag' && typeof mod.execute === 'function') {
      commands.set(mod.data.name, mod);
    }
  }

  return commands;
}

export async function getAdminCommandsJson() {
  const commands = await loadAdminCommands();
  return [...commands.values()].map((c) => c.data.toJSON());
}
