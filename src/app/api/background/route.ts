import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type { DashboardConfig } from '@/types';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'services.yml');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'backgrounds');

// Helper to read and write YAML config
async function readConfig(): Promise<DashboardConfig> {
  const fileContents = await fs.readFile(CONFIG_PATH, 'utf8');
  return yaml.load(fileContents) as DashboardConfig;
}

async function writeConfig(config: DashboardConfig) {
  const yamlString = yaml.dump(config);
  await fs.writeFile(CONFIG_PATH, yamlString, 'utf8');
}

// PUT: Sets an existing background as active
export async function PUT(request: Request) {
    try {
        const { filename } = await request.json();
        if (!filename) throw new Error('No filename provided.');

        const config = await readConfig();
        if (!config.backgrounds) {
            config.backgrounds = { active: '', history: [] };
        }
        config.backgrounds.active = filename;
        await writeConfig(config);

        return NextResponse.json({ success: true, config });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}


// DELETE: Removes a background from history and the filesystem
export async function DELETE(request: Request) {
    try {
        const { filename } = await request.json();
        if (!filename) throw new Error('No filename provided.');

        // Delete the file
        await fs.unlink(path.join(UPLOAD_DIR, filename));

        // Update the config
        const config = await readConfig();
        if (config.backgrounds) {
            config.backgrounds.history = config.backgrounds.history?.filter(f => f !== filename) || [];
            if (config.backgrounds.active === filename) {
                config.backgrounds.active = config.backgrounds.history[0] || '';
            }
        }
        await writeConfig(config);

        return NextResponse.json({ success: true, config });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}