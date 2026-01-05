"use client";

import { useEffect, useState } from 'react';
import type { DashboardConfig, WidgetConfig } from '@/types';
import { WidgetModal } from '@/components/WidgetModal';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaClock, FaCloudSun } from 'react-icons/fa';

export default function WidgetsPage() {
    const [config, setConfig] = useState<DashboardConfig | null>(null);
    const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error'>('loading');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setStatus('saved');
            })
            .catch(() => setStatus('error'));
    }, []);

    const saveConfig = async (newConfig: DashboardConfig) => {
        setStatus('saving');
        setConfig(newConfig);
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
            if (res.ok) {
                setStatus('saved');
                return true;
            } else {
                setStatus('error');
                return false;
            }
        } catch (e) {
            setStatus('error');
            return false;
        }
    };

    const handleSaveWidget = async (widget: WidgetConfig) => {
        if (!config) return;

        let newItems = [...(config.widgets?.items || [])];

        if (editingIndex !== null) {
            newItems[editingIndex] = widget;
        } else {
            newItems.push(widget);
        }

        const newWidgets = {
            columns: config.widgets?.columns || 3,
            items: newItems
        };

        const success = await saveConfig({ ...config, widgets: newWidgets });
        if (success) {
            setIsModalOpen(false);
            setEditingIndex(null);
            alert('Widget saved successfully!');
        } else {
            alert('Failed to save widget.');
        }
    };

    const handleDeleteWidget = async (index: number) => {
        if (!config || !window.confirm('Delete this widget?')) return;
        const newItems = [...(config.widgets?.items || [])];
        newItems.splice(index, 1);

        const newWidgets = {
            columns: config.widgets?.columns || 3,
            items: newItems
        };

        const success = await saveConfig({ ...config, widgets: newWidgets });
        if (success) alert('Widget deleted successfully!');
        else alert('Failed to delete widget.');
    };

    if (!config) return <div className="p-8">Loading...</div>;

    const widgets = config.widgets?.items || [];

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Widgets</h2>
                    <p className="text-gray-400">Add useful widgets like clocks and weather.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setEditingIndex(null); setIsModalOpen(true); }}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                        <FaPlus /> Add New Widget
                    </button>
                    {status === 'saving' && <span className="text-yellow-500 animate-pulse flex items-center gap-2"><FaCheck /> Saving...</span>}
                    {status === 'saved' && <span className="text-green-500 flex items-center gap-2"><FaCheck /> Saved</span>}
                </div>
            </header>

            <div className="glass-panel p-6 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {widgets.map((widget, index) => (
                        <div key={index} className="glass-card p-4 rounded-xl flex items-center gap-4 group relative">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 text-xl">
                                {widget.type === 'clock' ? <FaClock /> : <FaCloudSun />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{widget.name || 'Widget'}</h4>
                                <p className="text-xs text-gray-500 truncate capitalize">{widget.type} {widget.type === 'weather' ? `(${widget.city})` : ''}</p>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingIndex(index);
                                        setIsModalOpen(true);
                                    }}
                                    className="p-1.5 bg-blue-600 rounded-md text-white hover:bg-blue-500"
                                >
                                    <FaEdit size={12} />
                                </button>
                                <button
                                    onClick={() => handleDeleteWidget(index)}
                                    className="p-1.5 bg-red-600 rounded-md text-white hover:bg-red-500"
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => {
                            setEditingIndex(null);
                            setIsModalOpen(true);
                        }}
                        className="glass-card border-dashed border-white/20 p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 cursor-pointer min-h-[88px]"
                    >
                        <FaPlus />
                        <span className="text-sm">Add Widget</span>
                    </button>
                </div>
            </div>

            <WidgetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveWidget}
                initialWidget={editingIndex !== null ? widgets[editingIndex] : undefined}
            />
        </div>
    );
}
