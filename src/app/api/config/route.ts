import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

// --- Type Definitions for the YAML structure ---
// By adding 'export', we make these types available to other files.
export type Service = {
  name: string;
  subtitle?: string;
  url?: string;
  icon?: string;
  widget?: 'docker';
  align?: 'left' | 'center' | 'right';
  layout?: 'vertical' | 'horizontal' | 'horizontal-reverse';
};

export type ServiceGroup = {
  name: string;
  columns: number;
  services: Service[];
  align?: 'left' | 'center' | 'right';
  layout?: 'vertical' | 'horizontal' | 'horizontal-reverse';
};

export type Theme = {
  background: string;
  text: string;
  title: string;
  group: string;
  card: {
    background: string;
    hover: string;
  };
};

export type DashboardConfig = {
  title: string;
  defaultColumns: number;
  theme: Theme;
  groups: ServiceGroup[];
  services: Service[];
};


// This forces the route to be dynamic and re-read the file on every request.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'config', 'services.yml');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = yaml.load(fileContents) as DashboardConfig;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Could not read or parse config file:", error);
    // Return a default/empty config structure on error
    return NextResponse.json(
      {
        title: "Dashboard Error",
        defaultColumns: 1,
        theme: {
          background: "#111827",
          text: "#ffffff",
          title: "#ffffff",
          group: "#9ca3af",
          card: { background: "#1f2937", hover: "#374151" }
        },
        groups: [],
        services: [{ name: "Could not load config.yml" }],
      },
      { status: 500 }
    );
  }
}