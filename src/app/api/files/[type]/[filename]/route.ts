import { NextResponse } from 'next/server';
import { unlink, rename } from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { type: string; filename: string } }
) {
  const { type, filename } = params;

  if (type !== 'icons' && type !== 'backgrounds') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    const filepath = path.join(process.cwd(), 'public', type, filename);
    await unlink(filepath);
    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error("DELETE file error:", error);
    return NextResponse.json({ success: false, error: 'Failed to delete file' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { type: string; filename: string } }
) {
  const { type, filename } = params;

  if (type !== 'icons' && type !== 'backgrounds') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    const { newName } = await request.json();
    if (!newName) {
      return NextResponse.json({ error: 'New name is required' }, { status: 400 });
    }

    const oldPath = path.join(process.cwd(), 'public', type, filename);
    const newPath = path.join(process.cwd(), 'public', type, newName);

    await rename(oldPath, newPath);
    return NextResponse.json({ success: true, message: 'File renamed successfully', filename: newName });
  } catch (error) {
    console.error("PUT file error:", error);
    return NextResponse.json({ success: false, error: 'Failed to rename file' }, { status: 500 });
  }
}
