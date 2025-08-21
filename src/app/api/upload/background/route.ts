import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public');
const BACKGROUND_FILENAME = 'background.png';
const FILE_PATH = path.join(UPLOAD_DIR, BACKGROUND_FILENAME);

// Ensure the 'public' directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  await ensureUploadDir();
  try {
    const formData = await request.formData();
    const file = formData.get('background') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write the file to the public directory
    await fs.writeFile(FILE_PATH, buffer);

    return NextResponse.json({ message: 'Background uploaded successfully.', filename: BACKGROUND_FILENAME }, { status: 200 });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ message: 'File upload failed.' }, { status: 500 });
  }
}

export async function DELETE() {
  await ensureUploadDir();
  try {
    await fs.unlink(FILE_PATH);
    return NextResponse.json({ message: 'Background removed successfully.' }, { status: 200 });
  } catch (error) {
    // If the file doesn't exist, that's okay.
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ message: 'No background to remove.' }, { status: 200 });
    }
    console.error('Deletion failed:', error);
    return NextResponse.json({ message: 'Failed to remove background.' }, { status: 500 });
  }
}