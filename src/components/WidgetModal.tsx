"use client";

import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { WidgetConfig } from '@/types';

interface WidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (widget: WidgetConfig) => void;
    initialWidget?: WidgetConfig;
}

const defaultWidget: WidgetConfig = {
    name: 'New Widget',
    type: 'clock',
    format: '12h',
    timeZone: 'UTC'
};

export function WidgetModal({ isOpen, onClose, onSave, initialWidget }: WidgetModalProps) {
    const [widget, setWidget] = useState<WidgetConfig>(defaultWidget);

    useEffect(() => {
        if (isOpen) {
            setWidget(initialWidget ? { ...defaultWidget, ...initialWidget } : defaultWidget);
        }
    }, [isOpen, initialWidget]);

    const handleChange = (field: keyof WidgetConfig, value: any) => {
        setWidget(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-xl font-bold text-white">
                        {initialWidget ? 'Edit Widget' : 'Add Widget'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Widget Name</label>
                            <input
                                type="text"
                                value={widget.name}
                                onChange={e => handleChange('name', e.target.value)}
                                className="w-full glass-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500/50"
                                placeholder="My Clock"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                            <select
                                value={widget.type}
                                onChange={e => handleChange('type', e.target.value)}
                                className="w-full glass-input px-4 py-3 rounded-lg"
                            >
                                <option value="clock" className="bg-gray-900">Clock</option>
                                <option value="weather" className="bg-gray-900">Weather</option>
                            </select>
                        </div>

                        {widget.type === 'clock' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Format</label>
                                    <select
                                        value={widget.format || '12h'}
                                        onChange={e => handleChange('format', e.target.value)}
                                        className="w-full glass-input px-4 py-3 rounded-lg"
                                    >
                                        <option value="12h" className="bg-gray-900">12 Hour</option>
                                        <option value="24h" className="bg-gray-900">24 Hour</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Time Zone</label>
                                    <input
                                        type="text"
                                        value={widget.timeZone || ''}
                                        onChange={e => handleChange('timeZone', e.target.value)}
                                        className="w-full glass-input px-4 py-3 rounded-lg"
                                        placeholder="America/New_York (optional)"
                                    />
                                </div>
                            </>
                        )}

                        {widget.type === 'weather' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Provider</label>
                                    <select
                                        value={widget.provider || 'openweathermap'}
                                        onChange={e => handleChange('provider', e.target.value)}
                                        className="w-full glass-input px-4 py-3 rounded-lg"
                                    >
                                        <option value="openweathermap" className="bg-gray-900">OpenWeatherMap</option>
                                        <option value="weatherapi" className="bg-gray-900">WeatherAPI</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                                    <input
                                        type="text"
                                        value={widget.apiKey || ''}
                                        onChange={e => handleChange('apiKey', e.target.value)}
                                        className="w-full glass-input px-4 py-3 rounded-lg"
                                        placeholder="Your API Key"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={widget.city || ''}
                                        onChange={e => handleChange('city', e.target.value)}
                                        className="w-full glass-input px-4 py-3 rounded-lg"
                                        placeholder="New York"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Units</label>
                                    <select
                                        value={widget.units || 'metric'}
                                        onChange={e => handleChange('units', e.target.value)}
                                        className="w-full glass-input px-4 py-3 rounded-lg"
                                    >
                                        <option value="metric" className="bg-gray-900">Metric (°C)</option>
                                        <option value="imperial" className="bg-gray-900">Imperial (°F)</option>
                                        <option value="standard" className="bg-gray-900">Standard (K)</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Background Color</label>
                            <input
                                type="color"
                                value={widget.backgroundColor || '#1f2937'}
                                onChange={e => handleChange('backgroundColor', e.target.value)}
                                className="w-full h-12 bg-transparent cursor-pointer rounded-lg border border-white/10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Text Color</label>
                            <input
                                type="color"
                                value={widget.textColor || '#ffffff'}
                                onChange={e => handleChange('textColor', e.target.value)}
                                className="w-full h-12 bg-transparent cursor-pointer rounded-lg border border-white/10"
                            />
                        </div>

                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(widget)}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
                    >
                        Save Widget
                    </button>
                </div>
            </div>
        </div>
    );
}
