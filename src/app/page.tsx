import type { ElementType } from 'react';
import { FaDocker, FaGlobe } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import type { DashboardConfig, Service, ServiceGroup } from './api/config/route';

// --- Icon Handling ---
const AllIcons: Record<string, ElementType> = { ...FaIcons, ...SiIcons };

const IconComponent = ({ icon }: { icon?: string }) => {
  if (!icon) return <FaGlobe />;

  // If it's a PNG/SVG, treat it as a custom image
  if (icon.endsWith('.png') || icon.endsWith('.svg')) {
    // Adjusted size for custom icons
    return <img src={`/icons/${icon}`} alt="" className="h-10 w-10" />;
  }

  // Otherwise, treat it as a react-icon
  const Icon = AllIcons[icon];
  if (!Icon) return <FaGlobe />;
  return <Icon />;
};

// --- Data Fetching ---
type DockerService = { id: string; name: string; image: string; state: string };

async function getDockerServices(): Promise<DockerService[]> {
  try {
    const res = await fetch('http://localhost:3000/api/services', { cache: 'no-store' });
    return res.ok ? res.json() : [];
  } catch { return []; }
}

async function getDashboardConfig(): Promise<DashboardConfig | null> {
  try {
    const res = await fetch('http://localhost:3000/api/config', { cache: 'no-store' });
    return res.ok ? res.json() : null;
  } catch { return null; }
}

// --- Reusable Components ---
const ServiceCard = ({ service }: { service: Service }) => (
  <a
    href={service.url}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col items-center justify-center text-center hover:bg-gray-700 transition-colors"
  >
    {/* Adjusted icon size and spacing */}
    <div className="text-4xl text-cyan-400 mb-2">
      <IconComponent icon={service.icon} />
    </div>
    <h3 className="text-md font-semibold">{service.name}</h3>
  </a>
);

const DockerCard = ({ service }: { service: DockerService }) => (
  <div className="bg-gray-800 rounded-lg p-4 shadow-lg text-left">
    <div className="flex items-center mb-2">
      <FaDocker className="text-cyan-400 mr-3 flex-shrink-0" size={20} />
      <h3 className="text-lg font-semibold truncate">{service.name}</h3>
    </div>
    <p className="text-xs text-gray-400 mt-1 break-all">{service.image}</p>
    <div className="mt-3 inline-block px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300">
      {service.state}
    </div>
  </div>
);

// --- Grid Column Helper ---
// This function now returns full, static class names that Tailwind can detect.
const getGridColsClass = (cols: number) => {
  switch (cols) {
    case 1: return "md:grid-cols-1";
    case 2: return "md:grid-cols-2";
    case 3: return "md:grid-cols-3";
    case 4: return "md:grid-cols-4";
    case 5: return "md:grid-cols-5";
    case 6: return "md:grid-cols-6";
    default: return "md:grid-cols-4"; // Default fallback
  }
};

// --- Main Page ---
export default async function HomePage() {
  const [config, dockerServices] = await Promise.all([
    getDashboardConfig(),
    getDockerServices(),
  ]);

  if (!config) {
    return <main className="min-h-screen p-8 bg-gray-900 text-red-400">Failed to load dashboard configuration.</main>;
  }

  return (
    <main className="min-h-screen w-full p-4 md:p-8 bg-gray-900 text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">{config.title}</h1>

      {/* Render Groups */}
      {config.groups.map((group: ServiceGroup) => (
        <div key={group.name} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 pl-2">{group.name}</h2>
          <div className={`grid grid-cols-2 ${getGridColsClass(group.columns)} gap-4`}>
            {group.services.map((service: Service) => <ServiceCard key={service.name} service={service} />)}
          </div>
        </div>
      ))}

      {/* Render Ungrouped Services and Widgets */}
      <div className={`grid grid-cols-2 ${getGridColsClass(config.defaultColumns)} gap-4`}>
        {config.services.map((service: Service) => {
          if (service.widget === 'docker') {
            return dockerServices.map(ds => <DockerCard key={ds.id} service={ds} />);
          }
          return <ServiceCard key={service.name} service={service} />;
        })}
      </div>
    </main>
  );
}