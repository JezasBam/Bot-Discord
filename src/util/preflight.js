import fs from 'node:fs/promises';
import path from 'node:path';
import { projectRoot } from './paths.js';

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function runPreflight(options = {}) {
  const logger = options.logger;
  const problems = [];

  const requiredEnv = ['DISCORD_TOKEN', 'CLIENT_ID'];
  for (const k of requiredEnv) {
    if (!process.env[k]) problems.push(`Missing required environment variable: ${k}`);
  }

  const expectedDirs = [
    path.join(projectRoot, 'src'),
    path.join(projectRoot, 'src', 'commands'),
    path.join(projectRoot, 'src', 'features', 'tickets'),
    path.join(projectRoot, 'src', 'storage'),
    path.join(projectRoot, 'data')
  ];

  for (const d of expectedDirs) {
    if (!(await exists(d))) problems.push(`Missing required directory: ${path.relative(projectRoot, d)}`);
  }

  const pkgPath = path.join(projectRoot, 'package.json');
  if (!(await exists(pkgPath))) {
    problems.push('Missing package.json at project root');
  }

  const dbPath = path.join(projectRoot, 'data', 'db.json');
  if (await exists(dbPath)) {
    try {
      const raw = await fs.readFile(dbPath, 'utf8');
      JSON.parse(raw);
    } catch {
      problems.push('data/db.json exists but is not valid JSON');
    }
  }

  try {
    const { loadCommands } = await import('../loaders/commands.js');
    const commands = await loadCommands();
    if (!commands || commands.size === 0) problems.push('No commands were loaded from src/commands');
  } catch (e) {
    problems.push(`Failed to load commands: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (logger) {
    for (const p of problems) logger.error(p);
  }

  return { ok: problems.length === 0, problems };
}
