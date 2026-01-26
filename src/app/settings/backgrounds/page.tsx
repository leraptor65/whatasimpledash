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
                <h3 className="text-lg font-bold mb-4">Wallpaper Modifiers</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {(['none', 'blur', 'vignette', 'pixelate', 'no-wallpaper'] as const).map((modifier) => {
                        const currentModifier = config?.backgrounds?.modifier || 'none';
                        const isActive = currentModifier === modifier;

                        return (
                            <button
                                key={modifier}
                                onClick={() => {
                                    if (!config) return;
                                    handleConfigUpdate({
                                        ...config,
                                        backgrounds: {
                                            ...config.backgrounds,
                                            modifier
                                        }
                                    });
                                }}
                                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${isActive ? 'bg-cyan-500/20 border-cyan-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                <span className="capitalize font-medium text-gray-200">
                                    {modifier === 'no-wallpaper' ? 'No Wallpaper' : modifier}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4">Tips</h3>
                <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm">
                    <li>Upload high-quality images (JPG, PNG, WebP).</li>
                    <li>Files are stored in <code>/public/backgrounds</code>.</li>
                    <li>Images are automatically resized to 1920x1080 (Fill) on upload.</li>
                </ul>
            </div>
        </div>
    );
}
