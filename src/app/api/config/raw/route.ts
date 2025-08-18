import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'services.yml');

// This route serves the raw text of the config file for the editor
export async function GET() {
  try {
    const fileContents = await fs.readFile(CONFIG_PATH, 'utf8');
    return new NextResponse(fileContents, {
      status: 200,
      headers: { 'Content-Type': 'text/yaml' },
    });
  } catch (error) {
    console.error("Could not read config file:", error);
    return new NextResponse("Could not load config file.", { status: 500 });
  }
}
