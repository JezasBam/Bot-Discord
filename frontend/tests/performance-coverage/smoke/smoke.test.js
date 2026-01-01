import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..', '..');

describe('Frontend Smoke Tests', () => {
  it('should have package.json', async () => {
    const pkgPath = path.join(projectRoot, 'package.json');
    const exists = await fs.access(pkgPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('should have valid package.json', async () => {
    const pkgPath = path.join(projectRoot, 'package.json');
    const content = await fs.readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(content);
    expect(pkg.name).toBe('embed-builder');
    expect(pkg.type).toBe('module');
    expect(pkg.scripts).toHaveProperty('dev');
    expect(pkg.scripts).toHaveProperty('build');
    expect(pkg.scripts).toHaveProperty('lint');
  });

  it('should have main.tsx entry point', async () => {
    const mainPath = path.join(projectRoot, 'src', 'main.tsx');
    const exists = await fs.access(mainPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('should have App.tsx component', async () => {
    const appPath = path.join(projectRoot, 'src', 'app', 'App.tsx');
    const exists = await fs.access(appPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('should have required config files', async () => {
    const files = ['vite.config.ts', 'tailwind.config.js', 'tsconfig.json', 'eslint.config.js'];
    for (const file of files) {
      const filePath = path.join(projectRoot, file);
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists, `${file} should exist`).toBe(true);
    }
  });

  it('should have features directory structure', async () => {
    const featuresDir = path.join(projectRoot, 'src', 'features');
    const exists = await fs.access(featuresDir).then(() => true).catch(() => false);
    expect(exists).toBe(true);
    
    const subdirs = ['discord', 'embedEditor', 'projects'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(featuresDir, subdir);
      const subdirExists = await fs.access(subdirPath).then(() => true).catch(() => false);
      expect(subdirExists, `features/${subdir} should exist`).toBe(true);
    }
  });

  it('should have BotProfileEditor component', async () => {
    const componentPath = path.join(projectRoot, 'src', 'features', 'discord', 'components', 'BotProfileEditor.tsx');
    const exists = await fs.access(componentPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('should have useBotProfile hook', async () => {
    const hookPath = path.join(projectRoot, 'src', 'features', 'discord', 'hooks', 'useBotProfile.ts');
    const exists = await fs.access(hookPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('should have dist directory after build', async () => {
    const distPath = path.join(projectRoot, 'dist');
    const exists = await fs.access(distPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
    
    const indexPath = path.join(distPath, 'index.html');
    const indexExists = await fs.access(indexPath).then(() => true).catch(() => false);
    expect(indexExists).toBe(true);
  });
});
