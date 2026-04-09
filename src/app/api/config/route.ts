import { NextResponse } from 'next/server';
import { getConfig, saveConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("GET /api/config error:", error);
    return NextResponse.json({ error: "Failed to read configuration" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text(); // or json() depending on frontend payload
    let configData;
    
    try {
      configData = JSON.parse(body);
    } catch {
      // If not JSON, it might be raw YAML from the editor
      const yaml = require('js-yaml');
      configData = yaml.load(body);
    }

    await saveConfig(configData);
    return NextResponse.json({ message: "Config saved" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/config error:", error);
    return NextResponse.json({ error: "Failed to save configuration", details: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
