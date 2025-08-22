"use client";

import { useState, useEffect, type ElementType } from 'react';
import type { DashboardConfig, Service } from '@/types'; // FIX: Changed path to use the '@/' alias
import { FaGlobe } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';

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
const getTextAlignClass = (align: Alignment = 'center') => ({
  left: "text-left", center: "text-center", right: "text-right",
}[align]);

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
  return 'flex-col justify-center items-center';
};


// --- Reusable Service Card with Status ---
export const ServiceCard = ({ service, theme, groupAlign, groupLayout, columnCount }: { service: Service; theme: DashboardConfig['theme'], groupAlign?: Alignment, groupLayout?: Layout, columnCount: number }) => {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [hovered, setHovered] = useState(false);

  const align = service.align || groupAlign || 'center';
  const layout = service.layout || groupLayout || 'vertical';
  const isVertical = (layout || 'vertical') === 'vertical';

  const paddingClass = columnCount <= 3 ? 'px-14' : 'px-4';

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
          body: JSON.stringify({ url: service.ping, method: service.pingMethod }),
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
  }, [service.ping, service.pingMethod]);

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative rounded-xl py-2 ${paddingClass} shadow-lg flex h-24 transition-colors ${getLayoutClass(layout, align)}`}
      style={{
        backgroundColor: hovered ? theme.serviceBackgroundHover : theme.serviceBackground,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {service.ping && (
        <div className="absolute top-3 right-3 h-3 w-3 rounded-full"
          style={{
            backgroundColor: status === 'online' ? theme.serviceOnline : status === 'offline' ? theme.serviceOffline : '#6b7280',
          }}
        />
      )}
      <div className={`flex-shrink-0 ${isVertical ? 'mb-2 text-3xl' : 'mx-3 text-4xl'}`} style={{ color: theme.secondaryText }}>
        <IconComponent icon={service.icon} isVertical={isVertical} />
      </div>
      <div className={getTextAlignClass(align)}>
        <h3 className={`font-semibold ${isVertical ? 'text-md' : 'text-lg'}`} style={{ color: theme.secondaryText }}>{service.name}</h3>
        {service.subtitle && columnCount < 5 && <p className="text-xs" style={{ color: theme.secondaryText, opacity: 0.8 }}>{service.subtitle}</p>}
      </div>
    </a>
  );
};