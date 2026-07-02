"use client";

import React, { useId } from 'react';
import type { BackgroundEffect } from '@/types';
import {
  getEffectFilter,
  getEffectTransform,
  needsVignette,
  getVignetteBackground,
  getPixelateBlock,
} from '@/lib/backgroundEffects';

type WallpaperBackgroundProps = {
  url: string;
  effect?: BackgroundEffect;
  intensity?: number;
  /** Fixed full-viewport layer (dashboard) vs. absolute fill of a positioned parent (preview). */
  fixed?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Renders a wallpaper image layer with an optional single effect applied.
 * Shared between the live dashboard background and the settings preview so the
 * two always look identical.
 */
export function WallpaperBackground({ url, effect = 'none', intensity, fixed = false, className, style }: WallpaperBackgroundProps) {
  const rawId = useId();
  const pixelateId = `wp-px-${rawId.replace(/:/g, '')}`;

  const filter = getEffectFilter(effect, intensity, pixelateId);
  const transform = getEffectTransform(effect);
  const block = getPixelateBlock(intensity);
  const half = Math.max(1, Math.round(block / 2));

  const rootStyle: React.CSSProperties = {
    position: fixed ? 'fixed' : 'absolute',
    inset: 0,
    overflow: 'hidden',
    ...(fixed ? { zIndex: -1 } : {}),
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url("${url}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: filter || undefined,
    transform: transform || undefined,
    transformOrigin: 'center',
  };

  return (
    <div style={rootStyle} className={className} aria-hidden="true">
      {effect === 'pixelate' && (
        <svg style={{ position: 'absolute', width: 0, height: 0 }} focusable="false">
          <filter id={pixelateId} x="0" y="0" primitiveUnits="userSpaceOnUse">
            <feFlood x={half} y={half} width="1" height="1" />
            <feComposite width={block} height={block} />
            <feTile result="a" />
            <feComposite in="SourceGraphic" in2="a" operator="in" />
            <feMorphology operator="dilate" radius={half} />
          </filter>
        </svg>
      )}

      <div style={imageStyle} />

      {needsVignette(effect) && (
        <div style={{ position: 'absolute', inset: 0, background: getVignetteBackground(intensity) }} />
      )}
    </div>
  );
}
