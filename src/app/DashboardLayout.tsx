"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { FaSearch, FaCog, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import type { DashboardConfig, Service, ServiceGroup, Backgrounds } from '../types';
import { ServiceCard } from '@/components/ServiceCard';
import { CommandPalette } from '@/components/CommandPalette';
import { useStore } from '@/store/useStore';

export default function DashboardLayout() {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const isSavingRef = useRef(false);
  const { toggleCommandPalette, isSidebarOpen } = useStore();

  useEffect(() => {
    const fetchConfig = async () => {
      if (isSavingRef.current) return;
      try {
        const configRes = await fetch(`/api/config?t=${Date.now()}`, { cache: 'no-store' });
        if (configRes.ok && !isSavingRef.current) {
          const newConfig = await configRes.json();
          setConfig(newConfig);
        }
      } catch (error) {
        console.error("Failed to fetch config:", error);
      }
    };

    fetchConfig();
    const interval = setInterval(fetchConfig, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredConfig = useMemo(() => {
    if (!config) return null;
    const filterServices = (services: Service[]) => services.filter(service => !service.hidden);
    const newConfig = { ...config };
    if (newConfig.groups) {
      newConfig.groups = newConfig.groups
        .map(group => ({ ...group, services: filterServices(group.services || []) }))
        .filter(group => group.services.length > 0);
    }
    if (newConfig.services) {
      newConfig.services = filterServices(newConfig.services);
    }
    return newConfig;
  }, [config]);

  const toggleGroupCollapse = async (groupName: string) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      groups: config.groups.map(g => 
        g.name === groupName ? { ...g, collapsed: !g.collapsed } : g
      )
    };

    isSavingRef.current = true;
    setConfig(newConfig);
    
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      // Keep isSavingRef true for a short moment after save to let server state settle
      setTimeout(() => {
        isSavingRef.current = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to save collapse state:", err);
      isSavingRef.current = false;
    }
  };

  const getGridColsClass = (cols: number) => {
    switch(cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-3'; // Simpler 3-column stack 3 -> 1
      case 6: return 'grid-cols-3 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6'; // 6 columns stack to 3 then 1
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (!config || !filteredConfig) {
    return <main className="min-h-screen flex items-center justify-center bg-[#0e0e0e] text-white">Loading...</main>;
  }

  const backgroundUrlRaw = config.backgrounds?.active ? `/api/images/backgrounds/${config.backgrounds.active}` : '';
  const backgroundUrl = backgroundUrlRaw;
  const showWallpaper = config.settings?.showBackground !== false && backgroundUrl;

  const finalBgStyle: React.CSSProperties = {
    backgroundImage: `url(${backgroundUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    position: 'fixed',
    zIndex: 0,
    top: 0, left: 0, right: 0, bottom: 0,
  };

  return (
    <>
      <CommandPalette config={filteredConfig} />

      <div 
        className="min-h-screen w-full relative overflow-x-hidden font-sans" 
        style={{ backgroundColor: config.theme.mainBackground, color: config.theme.text }}
      >
        {showWallpaper && <div style={finalBgStyle} />}

        {/* Top bar for Search and Settings */}
        <header className="absolute top-0 w-full p-6 flex justify-between items-center z-20 gap-3">
          <div /> {/* push content to right */}
          <div className={`flex items-center gap-3 transition-all duration-500 ${config.settings?.showGreetingBackground ? 'p-1.5 px-3 rounded-full backdrop-blur-md border border-white/5 shadow-lg' : ''}`}
               style={config.settings?.showGreetingBackground ? {
                 backgroundColor: config.theme.serviceBackground || 'rgba(255,255,255,0.05)',
                 borderRadius: `${config.settings?.greetingRadius || 50}px`
               } : {}}>
            {config.title && (
              <span className="font-semibold text-sm md:text-base text-white/90 drop-shadow-md hidden sm:block px-2">
                {config.title}
              </span>
            )}
            <button 
              onClick={toggleCommandPalette}
              className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all shadow-sm ${config.settings?.showGreetingBackground ? 'hover:bg-white/10' : 'bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10'}`}
            >
              <FaSearch className="opacity-70" />
              <span className="hidden sm:inline font-medium text-white/80">Search</span>
              <kbd className="hidden sm:inline ml-2 text-xs opacity-50 font-mono tracking-widest text-white">Ctrl K</kbd>
            </button>

            <Link 
              href="/settings"
              className={`p-2.5 rounded-full text-sm flex items-center justify-center transition-all shadow-sm text-white/80 hover:text-white group ${config.settings?.showGreetingBackground ? 'hover:bg-white/10' : 'bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10'}`}
              title="Settings"
            >
              <FaCog className="opacity-70 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-300" size={16} />
            </Link>
          </div>
        </header>

        <main className="relative z-10 flex flex-col items-center justify-start min-h-screen pt-[12vh] pb-24 px-4 sm:px-8 w-full max-w-5xl mx-auto">
          
          {!filteredConfig.settings?.hideGreeting && (
            <div className={`text-center mb-16 animate-fade-in-up w-full max-w-2xl mx-auto transition-all duration-500 ${filteredConfig.settings?.showGreetingBackground ? 'p-8 rounded-3xl backdrop-blur-md border border-white/5 shadow-xl' : ''}`}
                 style={filteredConfig.settings?.showGreetingBackground ? {
                   backgroundColor: filteredConfig.theme.serviceBackground || 'rgba(255,255,255,0.05)',
                   borderRadius: `${filteredConfig.settings?.greetingRadius || 24}px`
                 } : {}}>
              <h1 className="text-4xl md:text-6xl font-normal tracking-tight mb-4 drop-shadow-lg">
                {filteredConfig.settings?.customGreeting || `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}`}
              </h1>
              <p className="text-lg md:text-xl opacity-60 font-light">
                {filteredConfig.settings?.customHelpText || 'How can I help you today?'}
              </p>
            </div>
          )}



          <div className="w-full space-y-12">
            {filteredConfig.groups.map((group: ServiceGroup) => (
                <div key={group.name} className="w-full animate-fade-in-up">
                  <h2 
                    onClick={() => toggleGroupCollapse(group.name)}
                    className={`flex items-center gap-2 text-sm font-medium tracking-widest uppercase mb-4 ml-2 cursor-pointer select-none transition-all duration-300 ${config.settings?.showTitleBackgrounds ? 'px-4 py-2.5 rounded-xl shadow-sm border border-white/5 backdrop-blur-md' : 'opacity-60 hover:opacity-100'}`}
                    style={{ 
                      color: group.titleTextColor || config.theme.groupTitleText || config.theme.text,
                      backgroundColor: config.settings?.showTitleBackgrounds ? (group.titleBackgroundColor || config.theme.titleBackground || 'rgba(255,255,255,0.05)') : 'transparent'
                    }}
                  >
                     {group.collapsed ? <FaChevronRight size={12} className="opacity-50" /> : <FaChevronDown size={12} className="opacity-50" />}
                     {group.name}
                  </h2>
                  
                  {!group.collapsed && (
                    <div className={`grid gap-4 ${getGridColsClass(group.columns || config.defaultColumns || 3)}`}>
                      {group.services.map((service: Service) => (
                         <ServiceCard 
                           key={service.name} 
                           service={service} 
                           theme={config.theme} 
                           columnCount={group.columns || config.defaultColumns || 3} 
                           showBackground={config.settings?.showServiceBackgrounds !== false}
                         />
                      ))}
                    </div>
                  )}
               </div>
            ))}

            {filteredConfig.services && filteredConfig.services.length > 0 && (
              <div className="w-full animate-fade-in-up">
                 <div className={`grid gap-4 ${getGridColsClass(config.defaultColumns || 3)}`}>
                   {filteredConfig.services.map((service: Service) => (
                      <ServiceCard 
                        key={service.name} 
                        service={service} 
                        theme={config.theme} 
                        columnCount={config.defaultColumns || 3} 
                        showBackground={config.settings?.showServiceBackgrounds !== false}
                      />
                   ))}
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
