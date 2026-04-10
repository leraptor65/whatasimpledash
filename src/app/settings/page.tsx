"use client";

import { useEffect, useState } from 'react';
import type { DashboardConfig, Theme } from '@/types';
import { FaSave, FaCheck, FaExclamationCircle, FaUndo, FaSpinner } from 'react-icons/fa';
import { ColorInput } from '@/components/ColorInput';

const defaultTheme: Theme = {
    mainBackground: '#0e0e0e',
    titleBackground: '',
    text: '#e3e3e3',
    serviceBackground: 'rgba(255,255,255,0.05)',
    serviceBackgroundHover: 'rgba(255,255,255,0.1)'
};

export default function GeneralSettingsPage() {
    const [config, setConfig] = useState<DashboardConfig | null>(null);
    const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error' | 'idle'>('loading');
    const [theme, setTheme] = useState<Theme>(defaultTheme);

    useEffect(() => {
        fetch(`/api/config?t=${Date.now()}`, { cache: 'no-store' })
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
            const timer = setTimeout(() => setStatus('idle'), 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleChange = (key: string, value: any) => {
        if (!config) return;
        let newConfig = { ...config };
        
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
            }
        } catch (e) {
            setStatus('error');
        }
    };

    if (!config) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FaSpinner className="animate-spin text-white/40" size={32} />
            <p className="text-white/40 font-medium">Loading settings...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-24">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 gap-4 md:gap-0">
                <div>
                    <h2 className="text-3xl font-medium tracking-tight mb-2">General</h2>
                    <p className="text-white/50 font-light">Customize your dashboard's appearance and basic behavior.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5 w-full md:w-auto justify-center md:justify-start">
                    {status === 'saving' && <span className="text-white/80 text-sm flex items-center gap-2 animate-pulse font-medium"><FaSpinner className="animate-spin" /> Saving...</span>}
                    {status === 'saved' && <span className="text-green-400 text-sm flex items-center gap-2 font-medium"><FaCheck /> All changes saved</span>}
                    {status === 'error' && <span className="text-red-400 text-sm flex items-center gap-2 font-medium"><FaExclamationCircle /> Failed to save</span>}
                    {status === 'idle' && <span className="text-white/30 text-sm font-medium">Autosave enabled</span>}
                </div>
            </header>

            {/* Core Settings */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white/90">Core Settings</h3>
                    <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5 shadow-2xl">
                    <div className="flex items-center justify-between p-6 transition-all duration-300 hover:bg-white/[0.03]">
                        <div className="pr-4 w-2/3">
                            <p className="text-sm font-bold text-white uppercase tracking-wider opacity-90">Dashboard Title</p>
                            <p className="text-xs text-white/40 mt-1 font-light">The main heading displayed at the top of your dashboard.</p>
                        </div>
                        <div className="flex justify-end w-1/3">
                            <input
                                type="text"
                                value={config.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className="w-full max-w-[240px] bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-white/20 outline-none text-sm text-white/90 transition-all placeholder:text-white/20"
                                placeholder="Enter title..."
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-6 transition-all duration-300 hover:bg-white/[0.03]">
                        <div className="pr-4 w-2/3">
                            <p className="text-sm font-bold text-white uppercase tracking-wider opacity-90">Custom Greeting</p>
                            <p className="text-xs text-white/40 mt-1 font-light">Override the default "Good morning/afternoon" text.</p>
                        </div>
                        <div className="flex justify-end w-1/3">
                            <input
                                type="text"
                                value={config.settings?.customGreeting || ''}
                                onChange={(e) => handleChange('settings.customGreeting', e.target.value)}
                                className="w-full max-w-[240px] bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-white/20 outline-none text-sm text-white/90 transition-all placeholder:text-white/20"
                                placeholder="Enter greeting..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 transition-all duration-300 hover:bg-white/[0.03]">
                        <div className="pr-4 w-2/3">
                            <p className="text-sm font-bold text-white uppercase tracking-wider opacity-90">Greeting Background</p>
                            <p className="text-xs text-white/40 mt-1 font-light">Add a soft glass panel effect to the dashboard header.</p>
                        </div>
                        <div className="flex justify-end w-1/3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={config.settings?.showGreetingBackground || false}
                                    onChange={e => handleChange('settings.showGreetingBackground', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/40"></div>
                            </label>
                        </div>
                    </div>

                    {config.settings?.showGreetingBackground && (
                        <div className="p-6 space-y-4 bg-white/[0.02]">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-white uppercase tracking-wider opacity-90">Corner Radius</p>
                                    <p className="text-xs text-white/40 mt-1 font-light">Adjust the softness of the background edges.</p>
                                </div>
                                <span className="text-xs font-mono text-white/90 bg-white/10 px-2 py-1 rounded-md">{config.settings?.greetingRadius || 24}px</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={config.settings?.greetingRadius || 24}
                                onChange={e => handleChange('settings.greetingRadius', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/60"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between p-6 transition-all duration-300 hover:bg-white/[0.03]">
                        <div className="pr-4 w-2/3">
                            <p className="text-sm font-bold text-white uppercase tracking-wider opacity-90">Hide Greeting</p>
                            <p className="text-xs text-white/40 mt-1 font-light">Remove the greeting section from the main view.</p>
                        </div>
                        <div className="flex justify-end w-1/3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={config.settings?.hideGreeting || false}
                                    onChange={e => handleChange('settings.hideGreeting', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/40"></div>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 transition-all duration-300 hover:bg-white/[0.03]">
                        <div className="pr-4 w-2/3">
                            <p className="text-sm font-bold text-white uppercase tracking-wider opacity-90">Custom Help Text</p>
                            <p className="text-xs text-white/40 mt-1 font-light">Overrides the sub-greeting text.</p>
                        </div>
                        <div className="flex justify-end w-1/3">
                            <input
                                type="text"
                                value={config.settings?.customHelpText || ''}
                                onChange={(e) => handleChange('settings.customHelpText', e.target.value)}
                                className="w-full max-w-[240px] bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-white/20 outline-none text-sm text-white/90 transition-all placeholder:text-white/20"
                                placeholder="How can I help you today?"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 transition-all duration-300 hover:bg-white/[0.03]">
                        <div className="pr-4 w-2/3">
                            <p className="text-sm font-bold text-white uppercase tracking-wider opacity-90">Layout Columns</p>
                            <p className="text-xs text-white/40 mt-1 font-light">The default number of columns for services grid.</p>
                        </div>
                        <div className="flex justify-end w-1/3">
                            <select
                                value={config.defaultColumns}
                                onChange={(e) => handleChange('defaultColumns', parseInt(e.target.value))}
                                className="w-auto min-w-[140px] bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-white/20 outline-none text-sm text-white/90 transition-all appearance-none cursor-pointer"
                            >
                                {[1, 2, 3, 6].map(num => (
                                    <option key={num} value={num} className="bg-[#111]">{num} Columns</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Theme Section */}
            <section className="space-y-6 pt-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-1">
                        <h3 className="text-xl font-bold text-white/90">Theme & Colors</h3>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <button
                        onClick={handleResetTheme}
                        className="ml-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 text-white/60 hover:text-white"
                    >
                        Reset Defaults
                    </button>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5 shadow-2xl">
                    <ColorInput
                        label="Background"
                        value={theme.mainBackground}
                        onChange={(c) => handleThemeChange('mainBackground', c)}
                        description="The primary background color of your dashboard."
                    />
                    <ColorInput
                        label="Text Primary"
                        value={theme.text}
                        onChange={(c) => handleThemeChange('text', c)}
                        description="Main text color used for headings and descriptions."
                    />
                    <ColorInput
                        label="Group Title Background"
                        value={theme.titleBackground || ''}
                        onChange={(c) => handleThemeChange('titleBackground', c)}
                        description="Background color for group titles when 'Highlight Headers' is enabled."
                    />
                    <ColorInput
                        label="Group Title Text"
                        value={theme.groupTitleText || ''}
                        onChange={(c) => handleThemeChange('groupTitleText', c)}
                        description="Text color specifically for group titles."
                    />
                    <ColorInput
                        label="Service Card Text"
                        value={theme.serviceText || ''}
                        onChange={(c) => handleThemeChange('serviceText', c)}
                        description="Text color for the services displayed on cards."
                    />
                    <ColorInput
                        label="Card Background"
                        value={theme.serviceBackground}
                        onChange={(c) => handleThemeChange('serviceBackground', c)}
                        description="Default color for service and widget cards."
                    />
                    <ColorInput
                        label="Card Hover State"
                        value={theme.serviceBackgroundHover}
                        onChange={(c) => handleThemeChange('serviceBackgroundHover', c)}
                        description="Color when hovering over interactive cards."
                    />
                </div>
            </section>

            {/* Preferences Section */}
            <section className="space-y-6 pt-6">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white/90">Preferences</h3>
                    <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5 shadow-2xl">
                   {[
                     { label: 'Show Greeting', key: 'settings.hideGreeting', current: config.settings?.hideGreeting !== true, text: "Enable or disable the greeting at the top of the dashboard.", invert: true },
                     { label: 'Show Wallpaper', key: 'settings.showBackground', current: config.settings?.showBackground !== false, text: "Enable or disable the dashboard's background image." },
                     { label: 'Highlight Headers', key: 'settings.showTitleBackgrounds', current: config.settings?.showTitleBackgrounds || false, text: "Add a subtle background to service group headers." },
                     { label: 'Elevated Cards', key: 'settings.showServiceBackgrounds', current: config.settings?.showServiceBackgrounds !== false, text: "Show distinct background cards for services." },
                     { label: 'Smooth Scrolling', key: 'settings.smoothScroll', current: config.settings?.smoothScroll || false, text: "Enable premium smooth momentum scrolling." },

                    ].map((opt) => (
                    <div key={opt.key} className="flex items-center justify-between p-6 transition-all duration-300 hover:bg-white/[0.03]">
                        <div className="pr-4 w-5/6">
                            <p className="text-sm font-bold text-white uppercase tracking-wider opacity-90">{opt.label}</p>
                            <p className="text-xs text-white/40 mt-1 font-light">{opt.text}</p>
                        </div>
                        <div className="flex justify-end w-1/6">
                            <div 
                                className={`w-6 h-6 rounded-lg border cursor-pointer flex items-center justify-center transition-all ${opt.current ? 'bg-white/20 border-white/40 shadow-lg shadow-white/5' : 'bg-white/5 border-white/10'}`}
                                onClick={() => handleChange(opt.key, opt.invert ? opt.current : !opt.current)}
                            >
                                {opt.current && <FaCheck className="text-white text-[10px]" />}
                            </div>
                        </div>
                    </div>
                   ))}
                </div>

                {config.settings?.smoothScroll && (
                    <div className="mt-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider opacity-90">Scroll Intensity</p>
                                <p className="text-xs text-white/40 mt-1 font-light">Adjust the speed/friction of the smooth scroll.</p>
                            </div>
                            <span className="text-xs font-mono text-white/90 bg-white/10 px-2 py-1 rounded-md">{config.settings?.smoothScrollSpeed || 100}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="50" 
                            max="300" 
                            step="10"
                            value={config.settings?.smoothScrollSpeed || 100}
                            onChange={e => handleChange('settings.smoothScrollSpeed', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/60"
                        />
                    </div>
                )}
            </section>
        </div>
    );
}
