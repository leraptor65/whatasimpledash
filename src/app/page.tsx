import DashboardLayout from './DashboardLayout';
import type { DashboardConfig } from '../types';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

async function getDashboardConfig(): Promise<DashboardConfig | null> {
  try {
    const configPath = path.join(process.cwd(), 'config', 'services.yml');
    const fileContents = await fs.readFile(configPath, 'utf8');
    return yaml.load(fileContents) as DashboardConfig;
  } catch {
    console.error("Failed to fetch dashboard config during server-side rendering.");
    return null;
  }
}

export default async function HomePage() {
  const config = await getDashboardConfig();

  if (!config) {
    return <main className="min-h-screen p-8 bg-gray-900 text-red-400">Failed to load dashboard configuration.</main>;
  }

  return <DashboardLayout initialConfig={config} />;
}