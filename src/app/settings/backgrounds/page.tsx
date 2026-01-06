"use client";

import { useState, useEffect } from 'react';
import { GlassFileManager } from '@/components/GlassFileManager';
import type { DashboardConfig } from '@/types';

export default function BackgroundsPage() {
    const [config, setConfig] = useState<DashboardConfig | null>(null);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => setConfig(data));
    }, []);

    const handleConfigUpdate = (newConfig: DashboardConfig) => {
        setConfig(newConfig);
        // Also save to server
        fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConfig)
        });
    };

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Backgrounds</h2>
                <p className="text-gray-400">Manage your dashboard's background images.</p>
            </header>

            <GlassFileManager
                type="backgrounds"
                activeFile={config?.backgrounds?.active}
                onConfigUpdate={handleConfigUpdate}
                currentConfig={config || undefined}
            />

            <div className="mt-8 glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4">Tips</h3>
                <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm">
                    <li>Upload high-quality images (JPG, PNG, WebP).</li>
                    <li>Files are stored in <code>/public/backgrounds</code>.</li>
                    <li>Select "None" to use your theme's background color instead.</li>
                </ul>
            </div>
        </div>
    );
}
