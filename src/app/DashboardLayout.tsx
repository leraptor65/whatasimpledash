"use client";

import { useState, useEffect, useMemo, useRef, type ElementType } from 'react';
import Link from 'next/link';
import { FaCog, FaSearch } from 'react-icons/fa';
import type { DashboardConfig, Service, ServiceGroup } from '../types';
import Fuse from 'fuse.js';
import { ServiceCard } from '@/components/ServiceCard';

// --- Helper function for grid columns ---
const getGridColsClass = (cols: number) => ({
  1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3",
  4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6",
}[cols] || "md:grid-cols-4");

// --- Main Layout Component ---
export default function DashboardLayout({ initialConfig }: { initialConfig: DashboardConfig }) {
  const [config, setConfig] = useState(initialConfig);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allServices = useMemo(() => {
    const services: Service[] = [];
    if (config.groups) {
      for (const group of config.groups) {
        if (group.services) {
          services.push(...group.services);
        }
      }
    }
    if (config.services) {
      services.push(...config.services);
    }
    return services;
  }, [config]);

  const fuse = useMemo(() => new Fuse(allServices, {
    keys: ['name', 'subtitle', 'url'],
    threshold: 0.3,
  }), [allServices]);

  const searchResults = searchQuery ? fuse.search(searchQuery).map(result => result.item) : allServices;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.getAttribute('role') === 'textbox';

      if (event.key === 'Escape') {
        setIsSearching(false);
        setSearchQuery('');
        (activeElement as HTMLElement)?.blur(); // Unfocus any active element
        return;
      }
      
      if (isTyping) return;

      if (/^[a-zA-Z0-9]$/.test(event.key)) {
        setIsSearching(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  useEffect(() => {
      if (isSearching) {
          setTimeout(() => searchInputRef.current?.focus(), 0);
      }
  }, [isSearching]);

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
  
  const backgroundUrl = config.backgroundImageUrl || (config.backgroundImage ? `/${config.backgroundImage}` : '');
  const mainStyle: React.CSSProperties = {
    backgroundColor: config.theme.mainBackground,
    color: config.theme.primaryText,
  };
  if (backgroundUrl) {
    mainStyle.backgroundImage = `url(${backgroundUrl})`;
  }
  
  const titleBackgroundStyle: React.CSSProperties = {};
  if (config.settings?.showTitleBackgrounds && config.theme.titleBackground) {
    titleBackgroundStyle.backgroundColor = config.theme.titleBackground;
  }

  return (
    <>
      {isSearching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center p-4 pt-[20vh] bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg">
            <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search for a service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
          <p className="mt-2 text-xs text-gray-400">Press Esc to close</p>
          <div className="mt-4 w-full max-w-5xl overflow-y-auto">
            <div className={`grid grid-cols-1 ${getGridColsClass(config.defaultColumns)} gap-4 p-4`}>
                {searchResults.length > 0 ? (
                    searchResults.map((service) => (
                        <ServiceCard key={service.name} service={service} theme={config.theme} columnCount={config.defaultColumns} />
                    ))
                ) : (
                    <p className="col-span-full text-center" style={{ color: config.theme.secondaryText }}>No services found.</p>
                )}
            </div>
          </div>
        </div>
      )}

      <main
        className={`min-h-screen w-full p-4 md:p-8 relative ${backgroundUrl ? 'bg-cover bg-center bg-fixed' : ''}`}
        style={mainStyle}
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/edit" className="absolute top-0 right-0 text-gray-400 hover:text-white transition-colors" title="Edit Configuration">
            <FaCog size={24} />
          </Link>
          
          <div className="text-center mb-8">
              {config.settings?.showTitleBackgrounds ? (
                  <div className="p-2 rounded-lg inline-block" style={titleBackgroundStyle}>
                      <h1 className="text-3xl md:text-4xl font-bold" style={{ color: config.theme.primaryText }}>{config.title}</h1>
                  </div>
              ) : (
                  <h1 className="text-3xl md:text-4xl font-bold" style={{ color: config.theme.primaryText }}>{config.title}</h1>
              )}
          </div>
          
          {config.groups.map((group: ServiceGroup) => {
            const columnCount = group.columns || config.defaultColumns;
            return (
              <div key={group.name} className="mb-8">
                {config.settings?.showTitleBackgrounds ? (
                  <div className="p-2 rounded-lg mb-4" style={titleBackgroundStyle}>
                    <h2 className="text-2xl font-semibold" style={{ color: config.theme.primaryText }}>{group.name}</h2>
                  </div>
                ) : (
                  <h2 className="text-2xl font-semibold mb-4" style={{ color: config.theme.primaryText }}>{group.name}</h2>
                )}
                <div className={`grid grid-cols-1 ${getGridColsClass(columnCount)} gap-4`}>
                  {group.services.map((service: Service) => {
                      return <ServiceCard key={service.name} service={service} theme={config.theme} groupAlign={group.align} groupLayout={group.layout} columnCount={columnCount} />;
                  })}
                </div>
              </div>
            );
          })}
          
          {config.services && config.services.length > 0 && (
            <div>
              {config.settings?.showTitleBackgrounds ? (
                <div className="p-2 rounded-lg mb-4" style={titleBackgroundStyle}>
                  <h2 className="text-2xl font-semibold" style={{ color: config.theme.primaryText }}>Services</h2>
                </div>
              ) : (
                <h2 className="text-2xl font-semibold mb-4" style={{ color: config.theme.primaryText }}>Services</h2>
              )}
              <div className={`grid grid-cols-1 ${getGridColsClass(config.defaultColumns)} gap-4`}>
                {config.services.map((service: Service) => {
                  return <ServiceCard key={service.name} service={service} theme={config.theme} columnCount={config.defaultColumns} />;
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}