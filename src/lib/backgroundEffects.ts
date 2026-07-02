import type { BackgroundEffect } from '@/types';

export type EffectMeta = {
  value: BackgroundEffect;
  label: string;
  description: string;
  hasIntensity: boolean;
  defaultIntensity: number;
};

// The set of wallpaper effects offered in the UI. One is active at a time.
export const BACKGROUND_EFFECTS: EffectMeta[] = [
  { value: 'none', label: 'None', description: 'Show the wallpaper untouched.', hasIntensity: false, defaultIntensity: 0 },
  { value: 'blur', label: 'Blur', description: 'Soft frosted-glass blur.', hasIntensity: true, defaultIntensity: 40 },
  { value: 'vignette', label: 'Vignette', description: 'Darkened edges that draw focus to the center.', hasIntensity: true, defaultIntensity: 60 },
  { value: 'darken', label: 'Darken', description: 'Dim the wallpaper for better text contrast.', hasIntensity: true, defaultIntensity: 40 },
  { value: 'grayscale', label: 'Grayscale', description: 'Desaturate to black & white.', hasIntensity: true, defaultIntensity: 100 },
  { value: 'sepia', label: 'Sepia', description: 'Warm, vintage photo tone.', hasIntensity: true, defaultIntensity: 80 },
  { value: 'pixelate', label: 'Pixelate', description: 'Retro blocky pixels.', hasIntensity: true, defaultIntensity: 50 },
];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function effectMeta(effect?: BackgroundEffect): EffectMeta {
  return BACKGROUND_EFFECTS.find(e => e.value === effect) || BACKGROUND_EFFECTS[0];
}

// Resolve intensity to 0..1, falling back to the effect's default when unset.
function normIntensity(effect: BackgroundEffect, intensity?: number): number {
  const meta = effectMeta(effect);
  const raw = typeof intensity === 'number' ? intensity : meta.defaultIntensity;
  return clamp(raw, 0, 100) / 100;
}

/**
 * CSS `filter` value for a given effect. `pixelateFilterId` is the id of the
 * inline SVG filter that the consumer renders for the pixelate effect.
 * Returns '' when no filter applies (none / vignette).
 */
export function getEffectFilter(effect: BackgroundEffect | undefined, intensity: number | undefined, pixelateFilterId: string): string {
  if (!effect || effect === 'none' || effect === 'vignette') return '';
  const t = normIntensity(effect, intensity);
  switch (effect) {
    case 'blur': return `blur(${(t * 40).toFixed(1)}px)`;
    case 'grayscale': return `grayscale(${Math.round(t * 100)}%)`;
    case 'sepia': return `sepia(${Math.round(t * 100)}%)`;
    case 'darken': return `brightness(${(1 - t * 0.7).toFixed(3)})`;
    case 'pixelate': return `url(#${pixelateFilterId})`;
    default: return '';
  }
}

// Blur clips at the layer edge, so we overscan the image slightly to hide gaps.
export function getEffectTransform(effect: BackgroundEffect | undefined): string {
  return effect === 'blur' ? 'scale(1.08)' : '';
}

export function needsVignette(effect?: BackgroundEffect): boolean {
  return effect === 'vignette';
}

// Radial-gradient overlay for the vignette effect.
export function getVignetteBackground(intensity?: number): string {
  const t = normIntensity('vignette', intensity);
  const innerStop = 30 + (1 - t) * 35; // stronger intensity → gradient starts closer to center
  const alpha = (t * 0.9).toFixed(2);
  return `radial-gradient(ellipse at center, rgba(0,0,0,0) ${innerStop.toFixed(0)}%, rgba(0,0,0,${alpha}) 100%)`;
}

// Block size (in px) for the pixelate SVG filter.
export function getPixelateBlock(intensity?: number): number {
  const t = normIntensity('pixelate', intensity);
  return Math.max(2, Math.round(t * 24));
}
