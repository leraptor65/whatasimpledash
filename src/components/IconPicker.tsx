"use client";

import { useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';

const allIcons = { ...FaIcons, ...SiIcons };
const iconNames = Object.keys(allIcons);

export function IconPicker({ value, onChange }: { value: string, onChange: (icon: string) => void }) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredIcons = iconNames.filter(name =>
        name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 100); // Limit to 100 for performance

    const SelectedIcon = allIcons[value as keyof typeof allIcons] || FaIcons.FaQuestion;

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 glass-input px-4 py-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
            >
                <SelectedIcon className="text-xl text-cyan-400" />
                <span className="text-gray-300">{value || 'Select an icon...'}</span>
            </div>

            {isOpen && (
                <div className="absolute z-50 top-full mt-2 left-0 w-full glass-panel rounded-xl max-h-80 flex flex-col p-4">
                    <input
                        type="text"
                        placeholder="Search icons (e.g., github, server)..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-lg mb-4 text-sm"
                        autoFocus
                    />
                    <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
                        {filteredIcons.map(name => {
                            const Icon = allIcons[name as keyof typeof allIcons];
                            return (
                                <button
                                    key={name}
                                    onClick={() => { onChange(name); setIsOpen(false); }}
                                    className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-cyan-500/20 transition-colors ${value === name ? 'bg-cyan-500/30 ring-1 ring-cyan-500' : ''}`}
                                    title={name}
                                >
                                    <Icon className="text-xl" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
        </div>
    );
}
