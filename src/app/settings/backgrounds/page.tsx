"use client";

import { useState, useEffect } from 'react';
import { GlassFileManager } from '@/components/GlassFileManager';
import { WallpaperBackground } from '@/components/WallpaperBackground';
import { BACKGROUND_EFFECTS, effectMeta } from '@/lib/backgroundEffects';
import type { DashboardConfig, BackgroundEffect } from '@/types';

export default function BackgroundsPage() {
    const [config, setConfig] = useState<DashboardConfig | null>(null);

    useEffect(() => {
        fetch(`/api/config?t=${Date.now()}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => setConfig(data));
    }, []);

    const saveConfig = async (newConfig: DashboardConfig) => {
        const previous = config;
        setConfig(newConfig);
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
            if (!res.ok) throw new Error('Save failed');
        } catch {
            // Roll back so the UI doesn't diverge from what's persisted.
            setConfig(previous);
            alert('Failed to save. Please try again.');
        }
    };

    const activeFile = config?.backgrounds?.active;
    const effect = (config?.backgrounds?.effect as BackgroundEffect) || 'none';
    const intensity = config?.backgrounds?.effectIntensity ?? effectMeta(effect).defaultIntensity;
    const currentMeta = effectMeta(effect);

    const setEffect = (next: BackgroundEffect) => {
        if (!config) return;
        saveConfig({
            ...config,
            backgrounds: {
                ...config.backgrounds,
                effect: next,
                // Reset intensity to the new effect's sensible default when switching.
                effectIntensity: effectMeta(next).defaultIntensity,
            },
        });
    };

    const setIntensity = (value: number) => {
        if (!config) return;
        saveConfig({
            ...config,
            backgrounds: { ...config.backgrounds, effect, effectIntensity: value },
        });
    };

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Backgrounds</h2>
                <p className="text-gray-400">Manage your dashboard&apos;s background images.</p>
            </header>

            <GlassFileManager
                type="backgrounds"
                activeFile={activeFile}
                onConfigUpdate={saveConfig}
                currentConfig={config || undefined}
            />

            {/* Wallpaper Effect */}
            <div className="glass-panel p-6 rounded-2xl space-y-6">
                <div>
                    <h3 className="text-lg font-bold">Wallpaper Effect</h3>
                    <p className="text-gray-400 text-sm mt-1">Apply one effect at a time to your active wallpaper.</p>
                </div>

                {/* Live preview */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    {activeFile ? (
                        <WallpaperBackground
                            key={`${activeFile}-${effect}-${intensity}`}
                            url={`/api/images/backgrounds/${encodeURIComponent(activeFile)}`}
                            effect={effect}
                            intensity={intensity}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                            Select an active wallpaper above to preview effects.
                        </div>
                    )}
                    <div className="absolute bottom-2 left-3 z-10 text-xs font-medium text-white/70 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                        Preview
                    </div>
                </div>

                {/* Effect chooser */}
                <div className="flex flex-wrap gap-2">
                    {BACKGROUND_EFFECTS.map(e => (
                        <button
                            key={e.value}
                            onClick={() => setEffect(e.value)}
                            title={e.description}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                effect === e.value
                                    ? 'bg-white/20 border-white/40 text-white shadow-lg'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {e.label}
                        </button>
                    ))}
                </div>

                <p className="text-xs text-gray-500 -mt-2">{currentMeta.description}</p>

                {/* Intensity */}
                {currentMeta.hasIntensity && (
                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-white/80">Intensity</label>
                            <span className="text-xs font-mono text-white/90 bg-white/10 px-2 py-1 rounded-md">{intensity}%</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={intensity}
                            onChange={e => setIntensity(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/60"
                        />
                    </div>
                )}
            </div>

            <div className="mt-8 glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4">Tips</h3>
                <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm">
                    <li>Upload high-quality images (JPG, PNG, WebP, GIF).</li>
                    <li>Files are stored as-is in <code>/public/backgrounds</code> — optimize large images before uploading for faster loads.</li>
                    <li>Effects are rendered live in your browser and never modify the original file.</li>
                </ul>
            </div>
        </div>
    );
}
