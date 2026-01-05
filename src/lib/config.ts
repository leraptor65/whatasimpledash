
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { dashboardConfigSchema, type DashboardConfig } from './schema';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'services.yml');

// Default backup config in case of failure/empty
const DEFAULT_CONFIG: DashboardConfig = {
    title: "My Dashboard",
    defaultColumns: 4,
    theme: {
        mainBackground: "#111827",
        serviceBackground: "#1f2937",
        serviceBackgroundHover: "#374151",
        text: "#ffffff"
    },
    groups: [],
    services: []
};

export async function getConfig(): Promise<DashboardConfig> {
    try {
        // Check if file exists first
        try {
            await fs.access(CONFIG_PATH);
        } catch {
            // Create default if not exists
            await saveConfig(DEFAULT_CONFIG);
            return DEFAULT_CONFIG;
        }

        const fileContents = await fs.readFile(CONFIG_PATH, 'utf8');
        const rawData = yaml.load(fileContents);

        const result = dashboardConfigSchema.safeParse(rawData);

        if (!result.success) {
            console.error("Config validation error:", result.error);
            // Return default config or throw? 
            // For now, let's return a config with an error message in a special service so dashboard still loads
            return {
                ...DEFAULT_CONFIG,
                title: "Configuration Error",
                services: [{ name: "Invalid Config - check logs" }]
            };
        }

        return result.data;
    } catch (error) {
        console.error("Failed to load config:", error);
        return DEFAULT_CONFIG;
    }
}

export async function saveConfig(config: DashboardConfig | unknown): Promise<void> {
    // Validate before saving to prevent writing bad config
    const result = dashboardConfigSchema.safeParse(config);
    if (!result.success) {
        throw new Error(`Invalid configuration: ${result.error.message}`);
    }

    const yamlString = yaml.dump(result.data);
    await fs.writeFile(CONFIG_PATH, yamlString, 'utf8');
}
