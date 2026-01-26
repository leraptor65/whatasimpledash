"use client";

import { useState, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa';
import { FaSearch, FaImage } from 'react-icons/fa';

// Fallback if network fails, though we primarily want to use local icons now.
const fallbackIcon = 'FaGlobe';

export function IconPicker({ value, onChange }: { value: string, onChange: (icon: string) => void }) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [localIcons, setLocalIcons] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetch('/api/icons')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setLocalIcons(data.icons || []);
                    }
                })
                .catch(console.error);
        }
    }, [isOpen]);

    const filteredIcons = localIcons.filter(name =>
        name.toLowerCase().includes(search.toLowerCase())
    );

    // Helper to determine if the current value is a local file or a react-icon (legacy support)
    const isLocalFile = value && (value.endsWith('.png') || value.endsWith('.svg') || value.endsWith('.jpg') || value.endsWith('.webp') || value.includes('.'));
    const SelectedIconComp = !isLocalFile ? (FaIcons[value as keyof typeof FaIcons] || FaIcons.FaGlobe) : null;

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 glass-input px-4 py-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
            >
                {isLocalFile ? (
                    <img src={`/icons/${value}`} alt="Selected" className="w-6 h-6 object-contain" />
                ) : (
                    SelectedIconComp ? <SelectedIconComp className="text-xl text-cyan-400" /> : <FaImage className="text-xl text-gray-500" />
                )}
                <span className="text-gray-300 truncate">{value || 'Select an icon...'}</span>
            </div>

            {isOpen && (
                <div className="absolute z-50 top-full mt-2 left-0 w-full glass-panel rounded-xl max-h-80 flex flex-col p-4 shadow-2xl border border-white/10">
                    <div className="relative mb-4">
                        <FaSearch className="absolute left-3 top-3 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search icons..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full glass-input pl-10 pr-3 py-2 rounded-lg text-sm"
                            autoFocus
                        />
                    </div>

                    {localIcons.length === 0 ? (
                        <div className="text-center text-gray-500 py-4 text-sm">
                            No icons found in /public/icons
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
                            {filteredIcons.map(name => (
                                <button
                                    key={name}
                                    onClick={() => { onChange(name); setIsOpen(false); }}
                                    className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-cyan-500/20 transition-colors border border-transparent ${value === name ? 'bg-cyan-500/30 border-cyan-500/50' : ''}`}
                                    title={name}
                                >
                                    <img src={`/icons/${name}`} alt={name} className="w-8 h-8 object-contain" />
                                    <span className="text-[10px] text-gray-400 truncate w-full text-center">{name.substring(0, 8)}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-white/10 text-center">
                        <span className="text-xs text-gray-500">Go to Settings &gt; Icons to manage files</span>
                    </div>
                </div>
            )}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        </div>
    );
}
