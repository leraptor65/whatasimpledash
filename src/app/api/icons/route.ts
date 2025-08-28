import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');

export async function GET() {
  try {
    // Ensure the directory exists to prevent errors on a fresh install
    await fs.access(ICONS_DIR).catch(() => fs.mkdir(ICONS_DIR, { recursive: true }));
    
    const files = await fs.readdir(ICONS_DIR);
    // Filter out any hidden files like .DS_Store
    const icons = files.filter(file => !file.startsWith('.'));
    return NextResponse.json({ success: true, icons });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}