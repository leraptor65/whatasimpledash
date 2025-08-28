import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type { DashboardConfig } from '@/types';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'services.yml');
const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');
const BACKGROUNDS_DIR = path.join(process.cwd(), 'public', 'backgrounds');

// Helper to ensure a directory exists
async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Helper to read and write YAML config
async function readConfig(): Promise<DashboardConfig> {
  const fileContents = await fs.readFile(CONFIG_PATH, 'utf8');
  return yaml.load(fileContents) as DashboardConfig;
}

async function writeConfig(config: DashboardConfig) {
  const yamlString = yaml.dump(config);
  await fs.writeFile(CONFIG_PATH, yamlString, 'utf8');
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let filename = '';
    let config: DashboardConfig | null = null;

    if (contentType.includes('multipart/form-data')) {
      // --- Handle File Upload ---
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const type = formData.get('type') as 'icon' | 'background' | null;

      if (!file || !type) throw new Error('File and type are required for form-data uploads.');
      
      const uploadDir = type === 'icon' ? ICONS_DIR : BACKGROUNDS_DIR;
      await ensureDir(uploadDir);

      filename = path.basename(file.name).replace(/[^a-zA-Z0-9.\-_]/g, '');
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, filename), buffer);

      if (type === 'background') {
        config = await readConfig();
        if (!config.backgrounds) config.backgrounds = { active: '', history: [] };
        if (!config.backgrounds.history?.includes(filename)) {
          config.backgrounds.history?.push(filename);
        }
        config.backgrounds.active = filename;
        await writeConfig(config);
      }
    } else if (contentType.includes('application/json')) {
      // --- Handle URL Download ---
      const { url } = await request.json();
      if (!url) throw new Error('URL is required for JSON uploads.');

      await ensureDir(BACKGROUNDS_DIR);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download image from URL.');

      const buffer = Buffer.from(await response.arrayBuffer());
      const urlPath = new URL(url).pathname;
      const ext = path.extname(urlPath) || '.jpg';
      filename = `${Date.now()}${ext}`;
      
      await fs.writeFile(path.join(BACKGROUNDS_DIR, filename), buffer);

      config = await readConfig();
      if (!config.backgrounds) config.backgrounds = { active: '', history: [] };
      if (!config.backgrounds.history?.includes(filename)) {
        config.backgrounds.history?.push(filename);
      }
      config.backgrounds.active = filename;
      await writeConfig(config);
    } else {
      throw new Error('Unsupported content type.');
    }

    return NextResponse.json({ success: true, filename, config });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}