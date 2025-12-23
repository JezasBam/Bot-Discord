import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

describe('Bot Smoke Tests', () => {
  it('should have package.json', async () => {
    const pkgPath = path.join(projectRoot, 'package.json');
    const exists = await fs.access(pkgPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('should have valid package.json', async () => {
    const pkgPath = path.join(projectRoot, 'package.json');
    const content = await fs.readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(content);
    expect(pkg.name).toBe('discord-ticket-bot');
    expect(pkg.type).toBe('module');
  });

  it('should have src/index.js', async () => {
    const indexPath = path.join(projectRoot, 'src', 'index.js');
    const exists = await fs.access(indexPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('should have commands directory with files', async () => {
    const commandsDir = path.join(projectRoot, 'src', 'commands');
    const files = await fs.readdir(commandsDir);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(0);
    expect(jsFiles).toContain('ping.js');
    expect(jsFiles).toContain('ticketsetup.js');
  });

  it('should have required config files', async () => {
    const files = ['.env.example', 'eslint.config.js', '.prettierrc'];
    for (const file of files) {
      const filePath = path.join(projectRoot, file);
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists, `${file} should exist`).toBe(true);
    }
  });
});
