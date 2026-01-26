"use client";

import { useEffect, useState } from 'react';
import type { DashboardConfig, Theme } from '@/types';
import { FaSave, FaCheck, FaExclamationCircle, FaUndo } from 'react-icons/fa';
import { ColorInput } from '@/components/ColorInput';

const defaultTheme: Theme = {
    mainBackground: '#111827',
    titleBackground: '',
    text: '#ffffff',
    serviceBackground: '#1f2937',
    serviceBackgroundHover: '#374151'
};

export default function GeneralSettingsPage() {
    const [config, setConfig] = useState<DashboardConfig | null>(null);
    const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error' | 'idle'>('loading');
    const [message, setMessage] = useState('');
    const [theme, setTheme] = useState<Theme>(defaultTheme);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setTheme(data.theme || defaultTheme);
                setStatus('idle');
            })
            .catch(() => setStatus('error'));
    }, []);

    useEffect(() => {
        if (status === 'saved') {
            const timer = setTimeout(() => {
                setStatus('idle');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleChange = (key: string, value: any) => {
        if (!config) return;

        let newConfig = { ...config, theme };

        if (key.includes('.')) {
            const [parent, child] = key.split('.');
            // @ts-ignore
            newConfig[parent] = { ...newConfig[parent], [child]: value };
        } else {
            // @ts-ignore
            newConfig[key] = value;
        }

        setConfig(newConfig);
        saveConfig(newConfig);
    };

    const handleThemeChange = (key: keyof Theme, value: string) => {
        if (!config) return;
        const newTheme = { ...theme, [key]: value };
        setTheme(newTheme);
        // Auto-save or wait? The original general page auto-saves on change. 
        // Theme page had manual save. Let's make it consistent: Auto-save or debounce?
        // General page uses direct saveConfig on change locally but maybe debounce is better?
        // The original code call saveConfig(newConfig) immediately.
        // Let's stick to immediately for consistency, user can see 'Saving...'

        const newConfig = { ...config, theme: newTheme };
        setConfig(newConfig);
        saveConfig(newConfig);
    };

    const handleResetTheme = () => {
        if (window.confirm('Reset theme to defaults? This will apply immediately.')) {
            setTheme(defaultTheme);
            if (config) {
                const newConfig = { ...config, theme: defaultTheme };
                setConfig(newConfig);
                saveConfig(newConfig);
            }
        }
    };

    const saveConfig = async (newConfig: DashboardConfig) => {
        setStatus('saving');
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
            if (res.ok) {
                setStatus('saved');
            } else {
                setStatus('error');
                setMessage('Failed to save');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    if (!config) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">General Settings</h2>
                    <p className="text-gray-400">Configure the basics and theme of your dashboard.</p>
                </div>
                <div className="flex items-center gap-2">
                    {status === 'saving' && <span className="text-yellow-500 animate-pulse flex items-center gap-2"><FaSave /> Saving...</span>}
                    {status === 'saved' && <span className="text-green-500 flex items-center gap-2"><FaCheck /> Saved</span>}
                    {status === 'error' && <span className="text-red-500 flex items-center gap-2"><FaExclamationCircle /> Error</span>}
                </div>
            </header>

            <section className="glass-panel p-6 rounded-2xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Dashboard Title</label>
                    <input
                        type="text"
                        value={config.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full glass-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Default Columns</label>
                        <select
                            value={config.defaultColumns}
                            onChange={(e) => handleChange('defaultColumns', parseInt(e.target.value))}
                            className="w-full glass-input px-4 py-3 rounded-lg"
                        >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                                <option key={num} value={num} className="bg-gray-900">{num} Columns</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="glass-panel p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Theme Settings</h3>
                    <button
                        onClick={handleResetTheme}
                        className="px-3 py-1.5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2 text-sm"
                    >
                        <FaUndo size={10} /> Reset Theme
                    </button>
                </div>

                <div className="space-y-4">
                    <ColorInput
                        label="Main Background"
                        value={theme.mainBackground}
                        onChange={(c) => handleThemeChange('mainBackground', c)}
                        description="The main background color of the entire page."
                    />
                    <ColorInput
                        label="Title Background"
                        value={theme.titleBackground || ''}
                        onChange={(c) => handleThemeChange('titleBackground', c)}
                        description="Background for the header/title section. Leave empty for transparent."
                    />
                    <ColorInput
                        label="Text Color"
                        value={theme.text}
                        onChange={(c) => handleThemeChange('text', c)}
                        description="Primary text color used throughout the dashboard."
                    />
                    <ColorInput
                        label="Service Card Background"
                        value={theme.serviceBackground}
                        onChange={(c) => handleThemeChange('serviceBackground', c)}
                        description="Background color for service cards."
                    />
                    <ColorInput
                        label="Service Card Hover"
                        value={theme.serviceBackgroundHover}
                        onChange={(c) => handleThemeChange('serviceBackgroundHover', c)}
                        description="Background color when hovering over service cards."
                    />
                    <div className="border-t border-white/10 my-4" />
                    <ColorInput
                        label="Default Group Title Background"
                        value={theme.groupTitleBackground || ''}
                        onChange={(c) => handleThemeChange('groupTitleBackground', c)}
                        description="Default background for group titles (if enabled). Leave empty for none."
                    />
                    <ColorInput
                        label="Default Group Title Text"
                        value={theme.groupTitleText || ''}
                        onChange={(c) => handleThemeChange('groupTitleText', c)}
                        description="Default text color for group titles."
                    />
                </div>
            </section>

            <section className="glass-panel p-6 rounded-2xl space-y-6">
                <h3 className="text-xl font-semibold">Display Options</h3>
                <div className="space-y-4">
                    {/* 1. Show Background Wallpaper */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-300">Show Background Wallpaper</span>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${config.settings?.showBackground !== false ? 'bg-cyan-600' : 'bg-gray-700'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${config.settings?.showBackground !== false ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={config.settings?.showBackground !== false}
                                onChange={(e) => {
                                    const enabled = e.target.checked;
                                    let newConfig = { ...config };
                                    if (!newConfig.settings) newConfig.settings = {};
                                    newConfig.settings.showBackground = enabled;

                                    if (enabled) {
                                        // Restore background
                                        if (newConfig.settings.lastActiveBackground) {
                                            if (!newConfig.backgrounds) newConfig.backgrounds = {};
                                            newConfig.backgrounds.active = newConfig.settings.lastActiveBackground;
                                        } else {
                                            if (!newConfig.backgrounds?.active) {
                                                alert('No previous background found. Please select one from the Backgrounds tab.');
                                            }
                                        }
                                    } else {
                                        // Disable background
                                        if (!newConfig.settings) newConfig.settings = {};
                                        // Save current active to history if exists
                                        if (newConfig.backgrounds?.active) {
                                            newConfig.settings.lastActiveBackground = newConfig.backgrounds.active;
                                            newConfig.backgrounds.active = undefined;
                                        }
                                    }
                                    setConfig(newConfig);
                                    saveConfig(newConfig);
                                }}
                            />
                        </label>
                    </div>

                    {/* 2. Show Title Backgrounds */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-300">Show Title Backgrounds</span>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${config.settings?.showTitleBackgrounds ? 'bg-cyan-600' : 'bg-gray-700'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${config.settings?.showTitleBackgrounds ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={config.settings?.showTitleBackgrounds || false}
                                onChange={(e) => handleChange('settings.showTitleBackgrounds', e.target.checked)}
                            />
                        </label>
                    </div>

                    {/* 3. Show Service Card Backgrounds */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-300">Show Service Card Backgrounds</span>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${config.settings?.showServiceBackgrounds !== false ? 'bg-cyan-600' : 'bg-gray-700'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${config.settings?.showServiceBackgrounds !== false ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={config.settings?.showServiceBackgrounds !== false}
                                onChange={(e) => handleChange('settings.showServiceBackgrounds', e.target.checked)}
                            />
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
}
