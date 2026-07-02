import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { resolveSafeFilePath } from '@/lib/safePath';

export async function GET(
  request: Request,
  { params }: { params: { type: string; filename: string } }
) {
  const { type, filename } = params;

  const filepath = resolveSafeFilePath(type, filename);
  if (!filepath) {
    return NextResponse.json({ error: 'Invalid type or filename' }, { status: 400 });
  }

  try {
    const buffer = await readFile(filepath);
    
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error("GET image error:", error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
