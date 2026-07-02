import { NextResponse } from 'next/server';
import { unlink, rename } from 'fs/promises';
import { hasAllowedImageExtension, resolveSafeFilePath } from '@/lib/safePath';

export async function DELETE(
  request: Request,
  { params }: { params: { type: string; filename: string } }
) {
  const { type, filename } = params;

  const filepath = resolveSafeFilePath(type, filename);
  if (!filepath) {
    return NextResponse.json({ error: 'Invalid type or filename' }, { status: 400 });
  }

  try {
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

  const oldPath = resolveSafeFilePath(type, filename);
  if (!oldPath) {
    return NextResponse.json({ error: 'Invalid type or filename' }, { status: 400 });
  }

  try {
    const { newName } = await request.json();
    if (!newName) {
      return NextResponse.json({ error: 'New name is required' }, { status: 400 });
    }

    if (!hasAllowedImageExtension(newName)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const newPath = resolveSafeFilePath(type, newName);
    if (!newPath) {
      return NextResponse.json({ error: 'Invalid new filename' }, { status: 400 });
    }

    await rename(oldPath, newPath);
    return NextResponse.json({ success: true, message: 'File renamed successfully', filename: newName });
  } catch (error) {
    console.error("PUT file error:", error);
    return NextResponse.json({ success: false, error: 'Failed to rename file' }, { status: 500 });
  }
}
