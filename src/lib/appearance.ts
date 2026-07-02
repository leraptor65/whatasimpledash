import type { CardAppearance, CardLayout, TextSize } from '@/types';

export type ResolvedAppearance = Required<CardAppearance>;

export const DEFAULT_APPEARANCE: ResolvedAppearance = {
  layout: 'icon-left',
  textSize: 'base',
  fontFamily: 'inter',
};

export const LAYOUT_OPTIONS: { value: CardLayout; label: string; description: string }[] = [
  { value: 'icon-left', label: 'Icon Left', description: 'Icon beside the title (default).' },
  { value: 'icon-right', label: 'Icon Right', description: 'Title with the icon on the right.' },
  { value: 'icon-top', label: 'Icon Top', description: 'Centered icon with the title below.' },
  { value: 'icon-only', label: 'Icon Only', description: 'Just the icon, no text.' },
  { value: 'text-only', label: 'Text Only', description: 'Just the text, no icon.' },
];

export const TEXT_SIZE_OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Default' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'XL' },
];

// rem sizes for the title and subtitle at each step.
export const TEXT_SIZE_MAP: Record<TextSize, { title: number; subtitle: number }> = {
  xs: { title: 0.8, subtitle: 0.7 },
  sm: { title: 0.9, subtitle: 0.78 },
  base: { title: 1.0, subtitle: 0.875 },
  lg: { title: 1.175, subtitle: 0.95 },
  xl: { title: 1.375, subtitle: 1.05 },
};

// Curated open-source fonts (all OFL-1.1 or Apache-2.0). `stack` references the
// CSS variables emitted by next/font in the root layout, so no font import is
// needed here — this module stays safe to import from client components.
// Keep keys/vars in sync with lib/fonts.ts.
export type FontCategory = 'System' | 'Sans-serif' | 'Serif' | 'Monospace';
export type FontOption = { key: string; label: string; stack: string; license: string; category: FontCategory };

const SANS = 'sans-serif';
const SERIF = 'serif';
const MONO = 'monospace';

export const FONT_OPTIONS: FontOption[] = [
  { key: 'system', label: 'System Default', stack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', license: 'System', category: 'System' },

  { key: 'inter', label: 'Inter', stack: `var(--font-inter), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'roboto', label: 'Roboto', stack: `var(--font-roboto), ${SANS}`, license: 'Apache-2.0', category: 'Sans-serif' },
  { key: 'open-sans', label: 'Open Sans', stack: `var(--font-open-sans), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'lato', label: 'Lato', stack: `var(--font-lato), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'montserrat', label: 'Montserrat', stack: `var(--font-montserrat), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'poppins', label: 'Poppins', stack: `var(--font-poppins), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'raleway', label: 'Raleway', stack: `var(--font-raleway), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'nunito', label: 'Nunito', stack: `var(--font-nunito), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'work-sans', label: 'Work Sans', stack: `var(--font-work-sans), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'rubik', label: 'Rubik', stack: `var(--font-rubik), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'dm-sans', label: 'DM Sans', stack: `var(--font-dm-sans), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'manrope', label: 'Manrope', stack: `var(--font-manrope), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'mulish', label: 'Mulish', stack: `var(--font-mulish), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'josefin-sans', label: 'Josefin Sans', stack: `var(--font-josefin-sans), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'quicksand', label: 'Quicksand', stack: `var(--font-quicksand), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'kanit', label: 'Kanit', stack: `var(--font-kanit), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'barlow', label: 'Barlow', stack: `var(--font-barlow), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },
  { key: 'karla', label: 'Karla', stack: `var(--font-karla), ${SANS}`, license: 'OFL-1.1', category: 'Sans-serif' },

  { key: 'lora', label: 'Lora', stack: `var(--font-lora), ${SERIF}`, license: 'OFL-1.1', category: 'Serif' },
  { key: 'merriweather', label: 'Merriweather', stack: `var(--font-merriweather), ${SERIF}`, license: 'OFL-1.1', category: 'Serif' },
  { key: 'playfair', label: 'Playfair Display', stack: `var(--font-playfair), ${SERIF}`, license: 'OFL-1.1', category: 'Serif' },
  { key: 'pt-serif', label: 'PT Serif', stack: `var(--font-pt-serif), ${SERIF}`, license: 'OFL-1.1', category: 'Serif' },
  { key: 'bitter', label: 'Bitter', stack: `var(--font-bitter), ${SERIF}`, license: 'OFL-1.1', category: 'Serif' },
  { key: 'eb-garamond', label: 'EB Garamond', stack: `var(--font-eb-garamond), ${SERIF}`, license: 'OFL-1.1', category: 'Serif' },
  { key: 'source-serif', label: 'Source Serif 4', stack: `var(--font-source-serif), ${SERIF}`, license: 'OFL-1.1', category: 'Serif' },

  { key: 'jetbrains', label: 'JetBrains Mono', stack: `var(--font-jetbrains), ${MONO}`, license: 'OFL-1.1', category: 'Monospace' },
  { key: 'roboto-mono', label: 'Roboto Mono', stack: `var(--font-roboto-mono), ${MONO}`, license: 'Apache-2.0', category: 'Monospace' },
  { key: 'fira-code', label: 'Fira Code', stack: `var(--font-fira-code), ${MONO}`, license: 'OFL-1.1', category: 'Monospace' },
  { key: 'source-code', label: 'Source Code Pro', stack: `var(--font-source-code), ${MONO}`, license: 'OFL-1.1', category: 'Monospace' },
  { key: 'ibm-plex-mono', label: 'IBM Plex Mono', stack: `var(--font-ibm-plex-mono), ${MONO}`, license: 'OFL-1.1', category: 'Monospace' },
  { key: 'space-mono', label: 'Space Mono', stack: `var(--font-space-mono), ${MONO}`, license: 'OFL-1.1', category: 'Monospace' },
];

// Unset/unknown falls back to Inter — the normalized project default.
export function fontStack(key?: string): string {
  const found = FONT_OPTIONS.find(f => f.key === key);
  if (found) return found.stack;
  return FONT_OPTIONS.find(f => f.key === 'inter')!.stack;
}

/**
 * Merge appearance layers with later layers winning per-field. Pass them in
 * cascade order, e.g. resolveAppearance(global, group, service). Unset fields
 * fall back to DEFAULT_APPEARANCE.
 */
export function resolveAppearance(...layers: (CardAppearance | undefined)[]): ResolvedAppearance {
  const out: ResolvedAppearance = { ...DEFAULT_APPEARANCE };
  for (const layer of layers) {
    if (!layer) continue;
    if (layer.layout) out.layout = layer.layout;
    if (layer.textSize) out.textSize = layer.textSize;
    if (layer.fontFamily) out.fontFamily = layer.fontFamily;
  }
  return out;
}

// True when the appearance object has no overrides set (used to show/hide reset).
export function isEmptyAppearance(a?: CardAppearance): boolean {
  return !a || (!a.layout && !a.textSize && !a.fontFamily);
}
