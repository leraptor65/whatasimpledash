"use client";

import { useState, type ElementType } from 'react';
import type { DashboardConfig, Service } from '@/types';
import { FaGlobe } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import { DEFAULT_APPEARANCE, TEXT_SIZE_MAP, fontStack, type ResolvedAppearance } from '@/lib/appearance';

const AllIcons: Record<string, ElementType> = { ...FaIcons, ...SiIcons };

const IconComponent = ({ icon, textColor }: { icon?: string, textColor?: string }) => {
  if (!icon) return <FaGlobe style={{ color: textColor }} size={24} />;

  // Backward compatibility check for old paths
  let iconUrl = icon;
  if (icon.startsWith('/api/images/icons/')) {
    iconUrl = icon.replace('/api/images/icons/', '/icons/');
  } else if (icon.startsWith('/icons/')) {
     // Already has prefix, do nothing
  } else if (icon.endsWith('.png') || icon.endsWith('.svg') || icon.endsWith('.jpg') || icon.endsWith('.webp')) {
    iconUrl = `/icons/${icon}`;
  }

  if (iconUrl.startsWith('/') && (iconUrl.endsWith('.png') || iconUrl.endsWith('.svg') || iconUrl.endsWith('.jpg') || iconUrl.endsWith('.webp'))) {
    const finalSrc = iconUrl.startsWith('/icons/') ? iconUrl.replace('/icons/', '/api/images/icons/') : iconUrl;
    return <img src={finalSrc} alt="" className="h-8 w-8 object-contain" />;
  }
  const Icon = AllIcons[icon];
  return Icon ? <Icon style={{ color: textColor }} size={24} /> : <FaGlobe style={{ color: textColor }} size={24} />;
};

export const ServiceCard = ({
  service,
  theme,
  columnCount,
  showBackground = true,
  appearance = DEFAULT_APPEARANCE,
}: {
  service: Service;
  theme: DashboardConfig['theme'],
  columnCount: number,
  showBackground?: boolean,
  appearance?: ResolvedAppearance,
}) => {
  const [hovered, setHovered] = useState(false);

  const backgroundColor = showBackground
    ? (hovered
      ? service.backgroundColor || theme.serviceBackgroundHover || 'rgba(255,255,255,0.1)'
      : service.backgroundColor || theme.serviceBackground || 'rgba(255,255,255,0.05)')
    : 'transparent';

  const textColor = service.textColor || theme.serviceText || theme.text;

  // Compact 6-column grids default to icon-only unless the layout was customized.
  const layout = (columnCount === 6 && appearance.layout === 'icon-left') ? 'icon-only' : appearance.layout;

  const iconAllowed = service.showIcon !== false;
  const showIcon = iconAllowed && layout !== 'text-only';
  const showText = layout !== 'icon-only';
  const sizes = TEXT_SIZE_MAP[appearance.textSize] || TEXT_SIZE_MAP.base;
  const fontFamily = fontStack(appearance.fontFamily);

  const directionClass =
    layout === 'icon-top' ? 'flex-col items-center text-center gap-2'
    : layout === 'icon-right' ? 'flex-row-reverse items-center gap-4'
    : layout === 'icon-only' ? 'justify-center'
    : 'flex-row items-center gap-4'; // icon-left, text-only

  const paddingClass = layout === 'icon-only' ? 'p-2 rounded-xl' : 'p-4 rounded-2xl';

  const iconBoxSize = layout === 'icon-only' ? 'w-10 h-10' : 'w-12 h-12';

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden border border-white/5 backdrop-blur-md ${directionClass} ${paddingClass}`}
      style={{ backgroundColor, fontFamily }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={!showText ? service.name : ''}
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />

      {showIcon && (
        <div className={`flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner ${iconBoxSize}`}>
          <IconComponent icon={service.icon} textColor={textColor} />
        </div>
      )}

      {showText && (
        <div className={`flex flex-col overflow-hidden ${layout === 'icon-top' ? 'text-center items-center' : 'text-left'} ${layout === 'icon-right' ? 'flex-1' : ''}`}>
          <h3 className="font-medium truncate max-w-full" style={{ color: textColor, fontSize: `${sizes.title}rem` }}>
            {service.name}
          </h3>
          {service.subtitle && (
            <p className="truncate mt-0.5 opacity-60 font-light max-w-full" style={{ color: textColor, fontSize: `${sizes.subtitle}rem` }}>
              {service.subtitle}
            </p>
          )}
        </div>
      )}
    </a>
  );
};
