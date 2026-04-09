import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { type: string; filename: string } }
) {
  const { type, filename } = params;

  if (type !== 'icons' && type !== 'backgrounds') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    const filepath = path.join(process.cwd(), 'public', type, filename);
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
