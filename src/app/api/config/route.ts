import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

// Define the new, more detailed types for our config structure
export type Service = {
  name: string;
  url?: string;
  icon?: string;
  widget?: 'docker'; // For special widgets
};

export type ServiceGroup = {
  name: string;
  columns: number;
  services: Service[];
};

export type DashboardConfig = {
  title: string;
  defaultColumns: number;
  groups: ServiceGroup[];
  services: Service[]; // Ungrouped services
};

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
        groups: [],
        services: [{ name: "Could not load config.yml" }],
      },
      { status: 500 }
    );
  }
}