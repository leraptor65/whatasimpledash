import { NextResponse } from 'next/server';
import { getConfig, saveConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

// GET function serves the parsed JSON data for the dashboard
export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}

// POST function saves the updated config file from the editor
export async function POST(request: Request) {
  try {
    // The client sends the config as a JSON object
    const newConfig = await request.json();

    // Validate and save the config (saveConfig handles validation via Zod)
    await saveConfig(newConfig);

    return NextResponse.json({ message: 'Configuration saved successfully' }, { status: 200 });
  } catch (error) {
    console.error("Failed to save config file:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ message: `Invalid configuration or failed to save file: ${errorMessage}` }, { status: 400 });
  }
}
