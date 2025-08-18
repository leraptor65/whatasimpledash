import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type { DashboardConfig } from '../../../types';

export const dynamic = 'force-dynamic';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'services.yml');

// GET function serves the parsed JSON data for the dashboard
export async function GET() {
  try {
    const fileContents = await fs.readFile(CONFIG_PATH, 'utf8');
    const data = yaml.load(fileContents) as DashboardConfig;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Could not read or parse config file:", error);
    return NextResponse.json(
      {
        title: "Dashboard Error",
        defaultColumns: 1,
        theme: {
          background: "#111827",
          text: "#ffffff",
          title: "#ffffff",
          group: "#9ca3af",
          card: { background: "#1f2937", hover: "#374151", online: "#22c55e", offline: "#ef4444" }
        },
        groups: [],
        services: [{ name: "Could not load config.yml" }],
      },
      { status: 500 }
    );
  }
}

// POST function saves the updated config file from the editor
export async function POST(request: Request) {
  try {
    const newConfigString = await request.text();

    // Basic validation to ensure the content is valid YAML before writing
    yaml.load(newConfigString);

    await fs.writeFile(CONFIG_PATH, newConfigString, 'utf8');

    return NextResponse.json({ message: 'Configuration saved successfully' }, { status: 200 });
  } catch (error) {
    console.error("Failed to save config file:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ message: `Invalid YAML or failed to save file: ${errorMessage}` }, { status: 400 });
  }
}
