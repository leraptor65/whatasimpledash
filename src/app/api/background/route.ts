import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type { DashboardConfig } from '@/types';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'services.yml');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'backgrounds');

// Helper to ensure the upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
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

// POST: Handles new background uploads (from file or URL)
export async function POST(request: Request) {
  await ensureUploadDir();
  const config = await readConfig();
  if (!config.backgrounds) {
    config.backgrounds = { active: '', history: [] };
  }

  let filename = '';

  try {
    // Check if it's a file upload or URL download
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('background') as File | null;
      if (!file) throw new Error('No file provided.');
      
      // Sanitize filename to prevent path traversal
      filename = path.basename(file.name).replace(/[^a-zA-Z0-9.\-_]/g, '');
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

    } else { // Assume URL download
      const { url } = await request.json();
      if (!url) throw new Error('No URL provided.');

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download image from URL.');
      
      const buffer = Buffer.from(await response.arrayBuffer());
      filename = path.basename(new URL(url).pathname).replace(/[^a-zA-Z0-9.\-_]/g, '');
      if (!filename || filename === '/') { // Handle URLs that don't have a clear filename
          filename = `${Date.now()}.jpg`;
      }
      await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
    }

    // Update config
    config.backgrounds.active = filename;
    if (!config.backgrounds.history?.includes(filename)) {
      config.backgrounds.history?.push(filename);
    }
    await writeConfig(config);

    return NextResponse.json({ success: true, config });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT: Sets an existing background as active
export async function PUT(request: Request) {
    try {
        const { filename } = await request.json();
        if (!filename) throw new Error('No filename provided.');

        const config = await readConfig();
        if (!config.backgrounds) {
            config.backgrounds = { active: '', history: [] };
        }
        config.backgrounds.active = filename;
        await writeConfig(config);

        return NextResponse.json({ success: true, config });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}


// DELETE: Removes a background from history and the filesystem
export async function DELETE(request: Request) {
    try {
        const { filename } = await request.json();
        if (!filename) throw new Error('No filename provided.');

        // Delete the file
        await fs.unlink(path.join(UPLOAD_DIR, filename));

        // Update the config
        const config = await readConfig();
        if (config.backgrounds) {
            config.backgrounds.history = config.backgrounds.history?.filter(f => f !== filename) || [];
            if (config.backgrounds.active === filename) {
                config.backgrounds.active = config.backgrounds.history[0] || '';
            }
        }
        await writeConfig(config);

        return NextResponse.json({ success: true, config });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}