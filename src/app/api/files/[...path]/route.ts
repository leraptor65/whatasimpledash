import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getConfig, saveConfig } from '@/lib/config';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Helper to ensure a directory exists
async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// GET: List files in a directory (icons or backgrounds)
export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const dirPath = path.join(PUBLIC_DIR, ...params.path);
    if (!dirPath.startsWith(PUBLIC_DIR)) throw new Error('Invalid path');

    await ensureDir(dirPath);
    const files = await fs.readdir(dirPath);
    const fileList = files.filter(file => !file.startsWith('.')); // Exclude hidden files
    return NextResponse.json({ success: true, files: fileList });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Upload a file to a directory
export async function POST(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const uploadDir = path.join(PUBLIC_DIR, ...params.path);
    if (!uploadDir.startsWith(PUBLIC_DIR)) throw new Error('Invalid path');

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) throw new Error('No file provided.');

    await ensureDir(uploadDir);

    const filename = path.basename(file.name).replace(/[^a-zA-Z0-9.\-_]/g, '');
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    let config = await getConfig();
    if (params.path[0] === 'backgrounds') {
      if (!config.backgrounds) config.backgrounds = { active: '', history: [] };
      if (!config.backgrounds.history?.includes(filename)) {
        if (!config.backgrounds.history) config.backgrounds.history = [];
        config.backgrounds.history.push(filename);
      }
      config.backgrounds.active = filename;
      await saveConfig(config);
    }

    return NextResponse.json({ success: true, filename, config });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE: Remove a file
export async function DELETE(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(PUBLIC_DIR, ...params.path);
    if (!filePath.startsWith(PUBLIC_DIR)) throw new Error('Invalid path');

    const filename = path.basename(filePath);
    const type = params.path[0]; // 'backgrounds' or 'icons'

    await fs.unlink(filePath);

    let config = await getConfig();
    if (type === 'backgrounds') {
      if (config.backgrounds) {
        config.backgrounds.history = config.backgrounds.history?.filter(f => f !== filename) || [];
        if (config.backgrounds.active === filename) {
          config.backgrounds.active = '';
        }
      }
      await saveConfig(config);
    }

    return NextResponse.json({ success: true, config });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}