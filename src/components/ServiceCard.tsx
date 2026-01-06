"use client";

import { useState, useEffect, type ElementType } from 'react';
import type { DashboardConfig, Service } from '@/types';
import { FaGlobe } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';

// --- Type Definitions ---
type Alignment = 'left' | 'center' | 'right';
type Layout = 'vertical' | 'horizontal' | 'horizontal-reverse' | 'vertical-reverse';

// --- Icon Handling ---
const AllIcons: Record<string, ElementType> = { ...FaIcons, ...SiIcons };
const IconComponent = ({ icon, isVertical, textColor }: { icon?: string, isVertical: boolean, textColor?: string }) => {
  if (!icon) return <FaGlobe style={{ color: textColor }} />;
  const iconSize = isVertical ? "h-8 w-8" : "h-10 w-10";
  if (icon.endsWith('.png') || icon.endsWith('.svg') || icon.endsWith('.jpg') || icon.endsWith('.webp')) {
    return <img src={`/icons/${icon}`} alt="" className={iconSize} />;
  }
  const Icon = AllIcons[icon];
  return Icon ? <Icon style={{ color: textColor }} /> : <FaGlobe style={{ color: textColor }} />;
};

// --- Helper Functions ---
const getTextAlignClass = (align: Alignment = 'center') => ({
  left: "text-left", center: "text-center", right: "text-right",
}[align]);

const getLayoutClass = (layout: Layout = 'vertical', align: Alignment = 'center') => {
  const alignmentClass = {
    left: "items-start",
    center: "items-center",
    right: "items-end"
  }[align];

  const justifyContentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end"
  }[align];

  if (layout === 'vertical') {
    return `flex-col justify-center ${alignmentClass}`;
  }
  if (layout === 'vertical-reverse') {
    return `flex-col-reverse justify-center ${alignmentClass}`;
  }
  if (layout === 'horizontal') {
    return `flex-row items-center ${justifyContentClass}`;
  }
  if (layout === 'horizontal-reverse') {
    return `flex-row-reverse items-center ${justifyContentClass}`;
  }
  return 'flex-col justify-center items-center';
};


// --- Reusable Service Card with Status ---
export const ServiceCard = ({ service, theme, groupAlign, groupLayout, columnCount, showBackground = true }: { service: Service; theme: DashboardConfig['theme'], groupAlign?: Alignment, groupLayout?: Layout, columnCount: number, showBackground?: boolean }) => {
  const [hovered, setHovered] = useState(false);

  // Defaults
  const align = service.align || groupAlign || 'center';
  const layout = service.layout || groupLayout || 'vertical';
  const showIcon = service.showIcon !== false; // Default true

  const isVertical = layout === 'vertical' || layout === 'vertical-reverse';

  const paddingClass = columnCount <= 3 ? 'px-14' : 'px-4';

  const backgroundColor = showBackground
    ? (hovered
      ? service.backgroundColor
        ? service.backgroundColor
        : theme.serviceBackgroundHover
      : service.backgroundColor || theme.serviceBackground)
    : 'transparent';

  const textColor = service.textColor || theme.text;
  const shadowClass = showBackground ? 'shadow-lg' : '';

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative rounded-xl py-2 ${paddingClass} ${shadowClass} flex h-24 transition-colors ${getLayoutClass(layout, align)} gap-2`}
      style={{
        backgroundColor,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {showIcon && (
        <div className={`flex-shrink-0 ${isVertical ? 'text-3xl' : 'text-4xl'}`}>
          <IconComponent icon={service.icon} isVertical={isVertical} textColor={textColor} />
        </div>
      )}
      <div className={getTextAlignClass(align)}>
        <h3 className={`font-semibold ${isVertical ? 'text-md' : 'text-lg'} leading-tight`} style={{ color: textColor }}>{service.name}</h3>
        {service.subtitle && columnCount < 5 && <p className="text-xs" style={{ color: textColor, opacity: 0.8 }}>{service.subtitle}</p>}
      </div>
    </a>
  );
};