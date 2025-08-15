import DashboardLayout from './DashboardLayout';
import type { DashboardConfig } from './api/config/route';
import type { DockerService } from '../types';

// --- Data Fetching ---
async function getDockerServices(): Promise<DockerService[]> {
  try {
    // The fetch URL must be the full localhost address for server-side fetching
    const res = await fetch('http://localhost:3000/api/services', { cache: 'no-store' });
    return res.ok ? res.json() : [];
  } catch { 
    console.error("Failed to fetch Docker services during server-side rendering.");
    return []; 
  }
}

async function getDashboardConfig(): Promise<DashboardConfig | null> {
  try {
    // The fetch URL must be the full localhost address for server-side fetching
    const res = await fetch('http://localhost:3000/api/config', { cache: 'no-store' });
    return res.ok ? res.json() : null;
  } catch { 
    console.error("Failed to fetch dashboard config during server-side rendering.");
    return null; 
  }
}

// --- Main Page (Server Component) ---
export default async function HomePage() {
  // Fetch both sets of data in parallel
  const [config, dockerServices] = await Promise.all([
    getDashboardConfig(),
    getDockerServices(),
  ]);

  // Handle case where the configuration couldn't be loaded
  if (!config) {
    return <main className="min-h-screen p-8 bg-gray-900 text-red-400">Failed to load dashboard configuration. Check server logs.</main>;
  }

  // Render the Client Component and pass the fetched data as initial props
  return <DashboardLayout initialConfig={config} initialDockerServices={dockerServices} />;
}