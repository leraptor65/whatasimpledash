"use client";

import { useState, useEffect, type ElementType } from 'react';
import Link from 'next/link';
import { FaGlobe, FaCog } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import type { DashboardConfig, Service, ServiceGroup } from '../types';

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

// This helper now ONLY handles text alignment
const getTextAlignClass = (align: Alignment = 'center') => ({
  left: "text-left", center: "text-center", right: "text-right",
}[align]);

// This helper now handles all flexbox layout and container alignment properties
const getLayoutClass = (layout: Layout = 'vertical', align: Alignment = 'center') => {
  if (layout === 'vertical') {
    const alignmentClass = {
      left: "items-start",
      center: "items-center",
      right: "items-end"
    }[align];
    return `flex-col justify-center ${alignmentClass}`;
  }

  const justifyContentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end"
  }[align];

  if (layout === 'horizontal') {
    return `flex-row items-center ${justifyContentClass}`;
  }
  if (layout === 'horizontal-reverse') {
    return `flex-row-reverse items-center ${justifyContentClass}`;
  }

  return 'flex-col justify-center items-center'; // Default fallback
};


// --- Reusable Service Card with Status ---
const ServiceCard = ({ service, theme, groupAlign, groupLayout }: { service: Service; theme: DashboardConfig['theme'], groupAlign?: Alignment, groupLayout?: Layout }) => {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [hovered, setHovered] = useState(false);

  const align = service.align || groupAlign || 'center';
  const layout = service.layout || groupLayout || 'vertical';
  const isVertical = (layout || 'vertical') === 'vertical';

  useEffect(() => {
    if (!service.ping) {
      setStatus('online');
      return;
    }
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: service.ping }),
        });
        const data = await res.json();
        setStatus(data.status);
      } catch (error) {
        setStatus('offline');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [service.ping]);

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative bg-gray-800 rounded-xl py-2 px-14 shadow-lg flex h-24 transition-colors ${getLayoutClass(layout, align)}`}
      style={{
        backgroundColor: hovered ? theme.card.hover : theme.card.background,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {service.ping && (
        <div className="absolute top-3 right-3 h-3 w-3 rounded-full"
          style={{
            backgroundColor: status === 'online' ? theme.card.online : status === 'offline' ? theme.card.offline : '#6b7280',
          }}
        />
      )}
      <div className={`flex-shrink-0 ${isVertical ? 'mb-2 text-3xl' : 'mx-3 text-4xl'}`} style={{ color: theme.text }}>
        <IconComponent icon={service.icon} isVertical={isVertical} />
      </div>
      <div className={getTextAlignClass(align)}>
        <h3 className={`font-semibold ${isVertical ? 'text-md' : 'text-lg'}`}>{service.name}</h3>
        {service.subtitle && <p className="text-xs" style={{ color: theme.group }}>{service.subtitle}</p>}
      </div>
    </a>
  );
};

// --- Main Layout Component ---
export default function DashboardLayout({ initialConfig }: { initialConfig: DashboardConfig }) {
  const [config, setConfig] = useState(initialConfig);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const configRes = await fetch('/api/config');
        
        if (configRes.ok) {
          const newConfig = await configRes.json();
          if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
            setConfig(newConfig);
          }
        }
      } catch (error) {
        console.error("Failed to refresh data:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [config]);

  if (!config) {
    return <main className="min-h-screen p-8" style={{backgroundColor: '#111827', color: '#ef4444'}}>Loading configuration...</main>;
  }

  return (
    <main className="min-h-screen w-full p-4 md:p-8" style={{ backgroundColor: config.theme.background, color: config.theme.text }}>
      
      <div className="max-w-5xl mx-auto relative">
        <Link href="/edit" className="absolute top-0 right-0 text-gray-400 hover:text-white transition-colors" title="Edit Configuration">
          <FaCog size={24} />
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{ color: config.theme.title }}>{config.title}</h1>
        
        {config.groups.map((group: ServiceGroup) => (
          <div key={group.name} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 pl-2" style={{ color: config.theme.group }}>{group.name}</h2>
            <div className={`grid grid-cols-1 ${getGridColsClass(group.columns || config.defaultColumns)} gap-4`}>
              {group.services.map((service: Service) => {
                  return <ServiceCard key={service.name} service={service} theme={config.theme} groupAlign={group.align} groupLayout={group.layout} />;
              })}
            </div>
          </div>
        ))}
        
        {/* This section is for ungrouped services */}
        {config.services && config.services.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 pl-2" style={{ color: config.theme.group }}>Services</h2>
            <div className={`grid grid-cols-1 ${getGridColsClass(config.defaultColumns)} gap-4`}>
              {config.services.map((service: Service) => {
                return <ServiceCard key={service.name} service={service} theme={config.theme} />;
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
