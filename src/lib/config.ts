
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { dashboardConfigSchema, type DashboardConfig } from './schema';

const PROD_CONFIG_PATH = path.join(process.cwd(), 'config', 'services.yml');

// Helper to determine which config path to use
async function getActiveConfigPath(): Promise<string> {
    // If an explicit path is provided via environment variable, use it
    if (process.env.CONFIG_PATH) {
        return process.env.CONFIG_PATH;
    }

    return PROD_CONFIG_PATH;
}

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
        // Ensure necessary directories exist
        const dirs = [
            path.join(process.cwd(), 'config'),
            path.join(process.cwd(), 'public', 'icons'),
            path.join(process.cwd(), 'public', 'backgrounds'),
            path.join(process.cwd(), 'public', 'uploads')
        ];
        
        for (const dir of dirs) {
            try {
                await fs.access(dir);
            } catch {
                await fs.mkdir(dir, { recursive: true });
            }
        }

        // Check if file exists first
        const configPath = await getActiveConfigPath();
        try {
            await fs.access(configPath);
        } catch {
            // Create default if not exists
            await saveConfig(DEFAULT_CONFIG);
            return DEFAULT_CONFIG;
        }

        const fileContents = await fs.readFile(configPath, 'utf8');
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

    const configPath = await getActiveConfigPath();
    const yamlString = yaml.dump(result.data, { indent: 2 });
    await fs.writeFile(configPath, yamlString, 'utf8');
}
