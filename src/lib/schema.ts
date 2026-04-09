
import { z } from 'zod';

export const themeSchema = z.object({
    mainBackground: z.string().default('#111827'),
    titleBackground: z.string().optional(),
    text: z.string().default('#ffffff'),
    serviceBackground: z.string().default('#1f2937'),
    serviceBackgroundHover: z.string().default('#374151'),
});

export const serviceSchema = z.object({
    name: z.string(),
    subtitle: z.string().optional(),
    url: z.string().optional(),
    icon: z.string().optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    layout: z.enum(['vertical', 'horizontal', 'horizontal-reverse']).optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    hidden: z.boolean().optional(),
});

export const serviceGroupSchema = z.object({
    name: z.string(),
    columns: z.number().optional(),
    services: z.array(serviceSchema),
    align: z.enum(['left', 'center', 'right']).optional(),
    layout: z.enum(['vertical', 'horizontal', 'horizontal-reverse']).optional(),
    collapsed: z.boolean().optional(),
});


export const backgroundsSchema = z.object({
    active: z.string().optional(),
    history: z.array(z.string()).optional(),
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
});

export const dashboardConfigSchema = z.object({
    title: z.string().default('My Dashboard'),
    defaultColumns: z.number().default(4),
    theme: themeSchema.default({}),
    backgrounds: backgroundsSchema.optional(),
    groups: z.array(serviceGroupSchema).default([]),
    services: z.array(serviceSchema).optional(),
    settings: settingsSchema.optional(),
});

export type DashboardConfig = z.infer<typeof dashboardConfigSchema>;
