import DashboardLayout from './DashboardLayout';
import type { DashboardConfig } from '../types';

async function getDashboardConfig(): Promise<DashboardConfig | null> {
  try {
    const res = await fetch('http://localhost:3000/api/config', { cache: 'no-store' });
    return res.ok ? res.json() : null;
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
