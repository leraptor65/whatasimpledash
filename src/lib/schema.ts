
import { z } from 'zod';

export const themeSchema = z.object({
    mainBackground: z.string().default('#111827'),
    titleBackground: z.string().optional(),
    text: z.string().default('#ffffff'),
    serviceBackground: z.string().default('#1f2937'),
    serviceBackgroundHover: z.string().default('#374151'),
    groupTitleBackground: z.string().optional(),
    groupTitleText: z.string().optional(),
    serviceText: z.string().optional(),
});

export const cardAppearanceSchema = z.object({
    layout: z.enum(['icon-left', 'icon-right', 'icon-top', 'icon-only', 'text-only']).optional(),
    textSize: z.enum(['xs', 'sm', 'base', 'lg', 'xl']).optional(),
    fontFamily: z.string().optional(),
});

export const serviceSchema = z.object({
    name: z.string(),
    subtitle: z.string().optional(),
    url: z.string().optional(),
    icon: z.string().optional(),
    showIcon: z.boolean().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    hidden: z.boolean().optional(),
    appearance: cardAppearanceSchema.optional(),
});

export const serviceGroupSchema = z.object({
    name: z.string(),
    columns: z.number().optional(),
    services: z.array(serviceSchema),
    titleBackgroundColor: z.string().optional(),
    titleTextColor: z.string().optional(),
    collapsed: z.boolean().optional(),
    appearance: cardAppearanceSchema.optional(),
});


export const backgroundsSchema = z.object({
    active: z.string().optional(),
    // A single wallpaper effect, applied one at a time. `intensity` is 0-100
    // and its meaning depends on the effect (blur px, darken amount, etc.).
    effect: z.enum(['none', 'blur', 'vignette', 'darken', 'grayscale', 'sepia', 'pixelate']).optional(),
    effectIntensity: z.number().min(0).max(100).optional(),
});

export const settingsSchema = z.object({
    showTitleBackgrounds: z.boolean().optional(),
    showServiceBackgrounds: z.boolean().optional(),
    showBackground: z.boolean().optional(),
    localIp: z.string().optional(),
    customGreeting: z.string().optional(),
    customHelpText: z.string().optional(),
    hideGreeting: z.boolean().optional(),
    showGreetingBackground: z.boolean().optional(),
    greetingRadius: z.number().optional(),
    smoothScroll: z.boolean().optional(),
    smoothScrollSpeed: z.number().optional(),
});

export const dashboardConfigSchema = z.object({
    title: z.string().default('My Dashboard'),
    defaultColumns: z.number().default(4),
    theme: themeSchema.default({}),
    backgrounds: backgroundsSchema.optional(),
    appearance: cardAppearanceSchema.optional(),
    groups: z.array(serviceGroupSchema).default([]),
    services: z.array(serviceSchema).optional(),
    settings: settingsSchema.optional(),
});

export type DashboardConfig = z.infer<typeof dashboardConfigSchema>;
