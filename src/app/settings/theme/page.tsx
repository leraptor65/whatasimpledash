"use client";

import { useEffect, useState } from 'react';
import type { DashboardConfig, Theme } from '@/types';
import { FaCheck, FaUndo, FaSave } from 'react-icons/fa';
import { ColorInput } from '@/components/ColorInput';

const defaultTheme: Theme = {
    mainBackground: '#111827',
    titleBackground: '',
    text: '#ffffff',
    serviceBackground: '#1f2937',
    serviceBackgroundHover: '#374151'
};

export default function ThemePage() {
    const [config, setConfig] = useState<DashboardConfig | null>(null);
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error' | 'unsaved'>('loading');

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setTheme(data.theme || defaultTheme);
                setStatus('saved');
            })
            .catch(() => setStatus('error'));
    }, []);

    const handleSave = async () => {
        if (!config) return;

        // Confirmation
        if (!window.confirm("Do you want to apply and save these theme changes?")) {
            return;
        }

        setStatus('saving');

        const newConfig = { ...config, theme };
        setConfig(newConfig);

        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
            if (res.ok) {
                setStatus('saved');
                alert("Theme saved successfully!");
            } else {
                setStatus('error');
                alert("Failed to save theme.");
            }
        } catch (e) {
            setStatus('error');
            alert("Error saving theme: " + e);
        }
    };

    const handleChange = (key: keyof Theme, value: string) => {
        setTheme(prev => ({ ...prev, [key]: value }));
        setStatus('unsaved');
    };

    const handleReset = () => {
        if (window.confirm('Reset theme to defaults? This will apply immediately and save.')) {
            setTheme(defaultTheme);
            setConfig(prev => prev ? ({ ...prev, theme: defaultTheme }) : null);
            // We can trigger save immediately or just set unsaved. User expects "Reset" to usually just reset local state?
            // "Reset to default theme" implies action. Let's set it and let user save preferably?
            // "This will apply immediately and save" -> I wrote that in confirm text.
            // Let's force save for Reset action.

            // Helper to save immediately
            (async () => {
                if (!config) return;
                setStatus('saving');
                try {
                    const newConfig = { ...config, theme: defaultTheme };
                    await fetch('/api/config', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newConfig)
                    });
                    setStatus('saved');
                } catch { setStatus('error'); }
            })();
        }
    };

    if (!config) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Theme Settings</h2>
                    <p className="text-gray-400">Customize the look and feel of your dashboard.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
                    >
                        <FaUndo size={12} /> Reset
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={status === 'saved' || status === 'loading'}
                        className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg ${status === 'saved' ? 'bg-green-600/20 text-green-500 cursor-default' :
                                'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white hover:scale-105 shadow-cyan-500/20'
                            }`}
                    >
                        {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : 'Save Changes'}
                        {status === 'saved' ? <FaCheck /> : <FaSave />}
                    </button>
                </div>
            </header>

            <div className="space-y-4 max-w-4xl">
                <ColorInput
                    label="Main Background"
                    value={theme.mainBackground}
                    onChange={(c) => handleChange('mainBackground', c)}
                    description="The main background color of the entire page."
                />
                <ColorInput
                    label="Title Background"
                    value={theme.titleBackground || ''}
                    onChange={(c) => handleChange('titleBackground', c)}
                    description="Background for the header/title section. Leave empty for transparent."
                />
                <ColorInput
                    label="Text Color"
                    value={theme.text}
                    onChange={(c) => handleChange('text', c)}
                    description="Primary text color used throughout the dashboard."
                />
                <ColorInput
                    label="Service Card Background"
                    value={theme.serviceBackground}
                    onChange={(c) => handleChange('serviceBackground', c)}
                    description="Background color for service cards."
                />
                <ColorInput
                    label="Service Card Hover"
                    value={theme.serviceBackgroundHover}
                    onChange={(c) => handleChange('serviceBackgroundHover', c)}
                    description="Background color when hovering over service cards."
                />
            </div>
        </div>
    );
}
