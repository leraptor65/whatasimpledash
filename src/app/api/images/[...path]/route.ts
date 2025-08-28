import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { lookup } from 'mime-types';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  // Reconstruct the file path from the URL
  const filePath = path.join(PUBLIC_DIR, ...params.path);

  try {
    // Security check: ensure the path is within the public directory
    if (!filePath.startsWith(PUBLIC_DIR)) {
      throw new Error('Invalid path');
    }

    await fs.access(filePath);
    const fileBuffer = await fs.readFile(filePath);
    const contentType = lookup(filePath) || 'application/octet-stream';

    // Create a new Uint8Array from the Buffer. This is a standard type
    // that the Response constructor will always accept.
    const uint8Array = new Uint8Array(fileBuffer);

    // Use the standard Response object with the Uint8Array
    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}