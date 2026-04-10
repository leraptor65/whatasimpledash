"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { FaSearch } from 'react-icons/fa';
import { ServiceCard } from '@/components/ServiceCard';
import type { DashboardConfig, Service } from '@/types';
import Fuse, { type FuseResult } from 'fuse.js';

interface CommandPaletteProps {
  config: DashboardConfig;
}

export const CommandPalette = ({ config }: CommandPaletteProps) => {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten and deduplicate all services for search
  const allServices = useMemo(() => {
    const services: Service[] = [];
    const seenUrls = new Set<string>();

    const addUnique = (sList: Service[]) => {
      sList.forEach(s => {
        if (!s.hidden) {
          const uniqueKey = `${s.name}-${s.url}`;
          if (!seenUrls.has(uniqueKey)) {
            seenUrls.add(uniqueKey);
            services.push(s);
          }
        }
      });
    };

    if (config.groups) {
      config.groups.forEach(group => {
        if (group.services) addUnique(group.services);
      });
    }
    if (config.services) {
      addUnique(config.services);
    }

    return services;
  }, [config]);

  const fuse = useMemo(() => new Fuse(allServices, {
    keys: ['name', 'subtitle', 'url'],
    threshold: 0.3,
  }), [allServices]);

    const searchResults = useMemo(() => (
    searchQuery 
      ? fuse.search(searchQuery).map((result: FuseResult<Service>) => result.item) 
      : allServices
  ), [searchQuery, fuse, allServices]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }

      // Close on Escape
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearchQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm" onClick={() => setCommandPaletteOpen(false)}>
      <div 
        className="w-full max-w-2xl bg-gray-900/90 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700/50 relative flex items-center">
          <FaSearch className="text-gray-400 absolute left-8" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search apps, services, or commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white text-xl pl-14 pr-4 py-2 focus:outline-none placeholder-gray-500"
          />
          <div className="absolute right-6 text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded">ESC</div>
        </div>

        <div className="p-4 overflow-y-auto overflow-x-hidden flex-1">
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchResults.map((service, index) => (
                <div key={`${service.name}-${service.url}-${index}`} onClick={() => setCommandPaletteOpen(false)}>
                  <ServiceCard 
                    service={service} 
                    theme={config.theme} 
                    columnCount={1} 
                    showBackground={true} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
