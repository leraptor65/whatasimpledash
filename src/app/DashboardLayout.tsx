"use client";

import { useState, useEffect, type ElementType } from 'react';
import { FaDocker, FaGlobe } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import type { DashboardConfig, Service, ServiceGroup, DockerService } from '../types';

// --- Type Definitions ---
type Alignment = 'left' | 'center' | 'right';
type Layout = 'vertical' | 'horizontal' | 'horizontal-reverse';

// --- Icon Handling ---
const AllIcons: Record<string, ElementType> = { ...FaIcons, ...SiIcons };

const IconComponent = ({ icon, isVertical }: { icon?: string, isVertical: boolean }) => {
  if (!icon) return <FaGlobe />;
  const iconSize = isVertical ? "h-8 w-8" : "h-10 w-10";
  if (icon.endsWith('.png') || icon.endsWith('.svg')) {
    return <img src={`/icons/${icon}`} alt="" className={iconSize} />;
  }
  const Icon = AllIcons[icon];
  return Icon ? <Icon /> : <FaGlobe />;
};

// --- Helper Functions ---
const getGridColsClass = (cols: number) => ({
  1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3",
  4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6",
}[cols] || "md:grid-cols-4");

const getAlignmentClass = (align: Alignment = 'center') => ({
  left: "items-start text-left", center: "items-center text-center", right: "items-end text-right",
}[align]);

const getLayoutClass = (layout: Layout = 'vertical') => ({
  vertical: "flex-col justify-center", horizontal: "flex-row items-center",
  'horizontal-reverse': "flex-row-reverse items-center justify-end",
}[layout]);


// --- Main Layout Component (with auto-refresh) ---
export default function DashboardLayout({ initialConfig, initialDockerServices }: { initialConfig: DashboardConfig, initialDockerServices: DockerService[] }) {
  const [config, setConfig] = useState(initialConfig);
  const [dockerServices, setDockerServices] = useState(initialDockerServices);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const configRes = await fetch('/api/config');
        const dockerRes = await fetch('/api/services');
        
        if (configRes.ok) {
          const newConfig = await configRes.json();
          // A simple check to see if the config has actually changed
          if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
            setConfig(newConfig);
          }
        }
        if (dockerRes.ok) {
          const newDockerServices = await dockerRes.json();
          setDockerServices(newDockerServices);
        }
      } catch (error) {
        console.error("Failed to refresh dashboard data:", error);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval); // Clean up on component unmount
  }, [config]); // Re-run the effect if config changes, to reset the interval if needed

  const ServiceCard = ({ service, groupAlign, groupLayout }: { service: Service, groupAlign?: Alignment, groupLayout?: Layout }) => {
    const align = service.align || groupAlign;
    const layout = service.layout || groupLayout;
    const isVertical = (layout || 'vertical') === 'vertical';

    return (
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`rounded-lg p-4 shadow-lg flex h-full transition-colors ${getAlignmentClass(align)} ${getLayoutClass(layout)}`}
        style={{
          backgroundColor: hoveredCard === service.name ? config.theme.card.hover : config.theme.card.background,
        }}
        onMouseEnter={() => setHoveredCard(service.name)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className={`flex-shrink-0 ${isVertical ? 'mb-2 text-3xl' : 'mx-3 text-4xl'}`} style={{color: config.theme.text}}>
          <IconComponent icon={service.icon} isVertical={isVertical} />
        </div>
        <div>
          <h3 className={`font-semibold ${isVertical ? 'text-md' : 'text-lg'}`}>{service.name}</h3>
          {service.subtitle && <p className="text-xs" style={{color: config.theme.group}}>{service.subtitle}</p>}
        </div>
      </a>
    );
  };
  
  const DockerCard = ({ service }: { service: DockerService }) => (
    <div className="rounded-lg p-4 shadow-lg text-left h-full" style={{backgroundColor: config.theme.card.background}}>
      <div className="flex items-center mb-2">
        <FaDocker className="mr-3 flex-shrink-0" size={20} style={{color: "#0db7ed"}}/>
        <h3 className="text-lg font-semibold truncate">{service.name}</h3>
      </div>
      <p className="text-xs mt-1 break-all" style={{color: config.theme.group}}>{service.image}</p>
      <div className="mt-3 inline-block px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300">
        {service.state}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen w-full p-4 md:p-8" style={{ backgroundColor: config.theme.background, color: config.theme.text }}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{ color: config.theme.title }}>{config.title}</h1>
      {config.groups.map((group: ServiceGroup) => (
        <div key={group.name} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 pl-2" style={{ color: config.theme.group }}>{group.name}</h2>
          <div className={`grid grid-cols-2 ${getGridColsClass(group.columns)} gap-4`}>
            {group.services.map((service: Service) => (
              <ServiceCard key={service.name} service={service} groupAlign={group.align} groupLayout={group.layout} />
            ))}
          </div>
        </div>
      ))}
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