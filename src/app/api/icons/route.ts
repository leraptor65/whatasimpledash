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

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = path.join(ICONS_DIR, sanitizedName);

    await fs.writeFile(filePath, buffer);
    return NextResponse.json({ success: true, fileName: sanitizedName });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('name');

    if (!fileName) {
      return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 });
    }

    // Basic security check to prevent directory traversal
    if (fileName.includes('..') || fileName.includes('/')) {
      return NextResponse.json({ success: false, error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(ICONS_DIR, fileName);
    await fs.unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}