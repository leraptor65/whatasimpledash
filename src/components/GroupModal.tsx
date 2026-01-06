"use client";

import { useEffect, useState } from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';
import type { ServiceGroup } from '@/types';

interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (group: Partial<ServiceGroup>) => void;
    onDelete?: () => void;
    initialGroup?: ServiceGroup;
}

export function GroupModal({ isOpen, onClose, onSave, onDelete, initialGroup }: GroupModalProps) {
    const [name, setName] = useState('');
    const [columns, setColumns] = useState(3);
    const [collapsed, setCollapsed] = useState(false);
    const [titleAlign, setTitleAlign] = useState<'left' | 'center' | 'right'>('left');
    const [titleBackgroundColor, setTitleBackgroundColor] = useState('');
    const [titleTextColor, setTitleTextColor] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(initialGroup?.name || '');
            setColumns(initialGroup?.columns || 3);
            setCollapsed(initialGroup?.collapsed || false);
            setTitleAlign(initialGroup?.titleAlign || 'left');
            setTitleBackgroundColor(initialGroup?.titleBackgroundColor || '');
            setTitleTextColor(initialGroup?.titleTextColor || '');
        }
    }, [isOpen, initialGroup]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({
            name,
            columns,
            collapsed,
            titleAlign,
            titleBackgroundColor: titleBackgroundColor || undefined,
            titleTextColor: titleTextColor || undefined
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-xl font-bold text-white">
                        {initialGroup ? 'Edit Group' : 'New Group'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Group Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            className="w-full glass-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500/50"
                            placeholder="My Services"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Columns</label>
                        <select
                            value={columns}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setColumns(parseInt(e.target.value))}
                            className="w-full glass-input px-4 py-3 rounded-lg"
                        >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                                <option key={num} value={num} className="bg-gray-900">{num} Columns</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Title Alignment</label>
                        <select
                            value={titleAlign}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTitleAlign(e.target.value as any)}
                            className="w-full glass-input px-4 py-3 rounded-lg"
                        >
                            <option value="left" className="bg-gray-900">Left</option>
                            <option value="center" className="bg-gray-900">Center</option>
                            <option value="right" className="bg-gray-900">Right</option>
                        </select>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <h4 className="text-sm font-semibold text-gray-300 mb-4">Custom Title Styling</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Background</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={titleBackgroundColor}
                                        onChange={(e) => setTitleBackgroundColor(e.target.value)}
                                        className="flex-1 glass-input px-3 py-2 rounded-lg text-sm"
                                        placeholder="Hex/RGBA"
                                    />
                                    <div
                                        className="w-9 h-9 rounded-lg border border-white/10"
                                        style={{ backgroundColor: titleBackgroundColor || 'transparent' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Text Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={titleTextColor}
                                        onChange={(e) => setTitleTextColor(e.target.value)}
                                        className="flex-1 glass-input px-3 py-2 rounded-lg text-sm"
                                        placeholder="Hex/RGBA"
                                    />
                                    <div
                                        className="w-9 h-9 rounded-lg border border-white/10"
                                        style={{ backgroundColor: titleTextColor || 'transparent' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${collapsed ? 'bg-cyan-600' : 'bg-gray-700'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${collapsed ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={collapsed}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCollapsed(e.target.checked)}
                            />
                            <span className="text-gray-300 group-hover:text-white transition-colors">Collapsed by Default</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Services in this group will be hidden until expanded.</p>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between gap-3">
                    {initialGroup && onDelete ? (
                        <button
                            onClick={() => {
                                if (window.confirm('Delete this group and all its services?')) {
                                    onDelete();
                                }
                            }}
                            className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
                        >
                            <FaTrash size={14} /> Delete Group
                        </button>
                    ) : (
                        <div></div>
                    )}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
                        >
                            Save Group
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
}
