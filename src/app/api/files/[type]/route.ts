import { NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, unlink } from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  const type = params.type;
  if (type !== 'icons' && type !== 'backgrounds') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    const dir = path.join(process.cwd(), 'public', type);
    await mkdir(dir, { recursive: true });
    
    const files = await readdir(dir);
    // filter to only files (basic check, could be improved)
    return NextResponse.json({ success: true, files: files.filter(f => !f.startsWith('.')) });
  } catch (error) {
    console.error("GET files error:", error);
    return NextResponse.json({ success: false, error: 'Failed to read directory' }, { status: 500 });
  }
}


export async function POST(
  request: Request,
  { params }: { params: { type: string } }
) {
  const type = params.type; // 'icons' or 'backgrounds'

  if (type !== 'icons' && type !== 'backgrounds') {
    return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename to prevent overwrites
    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    
    const uploadDir = path.join(process.cwd(), 'public', type);
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true,
      message: 'File uploaded successfully',
      filename: filename,
      url: `/${type}/${filename}`
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
