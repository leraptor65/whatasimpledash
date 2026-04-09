import { NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, unlink, access } from 'fs/promises';
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

    // Use original filename as requested
    const filename = file.name;
    const uploadDir = path.join(process.cwd(), 'public', type);
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = path.join(uploadDir, filename);

    // Check if exists
    try {
      await access(filepath);
      return NextResponse.json({ error: `File '${filename}' already exists.` }, { status: 409 });
    } catch {
      // file doesn't exist, proceed
    }
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
