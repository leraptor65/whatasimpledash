"use client";

import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { Service, ServiceGroup } from '@/types';
import { IconPicker } from './IconPicker';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Service, groupIndex: number) => void;
    initialService?: Service;
    groupIndex?: number;
    groups: ServiceGroup[];
}

const defaultService: Service = {
    name: '',
    url: '',
    icon: 'FaGlobe',
    subtitle: '',
    hidden: false
};

export function ServiceModal({ isOpen, onClose, onSave, initialService, groupIndex = 0, groups }: ServiceModalProps) {
    const [service, setService] = useState<Service>(defaultService);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(groupIndex);

    useEffect(() => {
        if (isOpen) {
            setService(initialService ? { ...defaultService, ...initialService } : defaultService);
            setSelectedGroupIndex(groupIndex);
        }
    }, [isOpen, initialService, groupIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                        {initialService ? 'Edit Service' : 'Add New Service'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Group</label>
                            <select
                                value={selectedGroupIndex}
                                onChange={e => setSelectedGroupIndex(parseInt(e.target.value))}
                                className="w-full glass-input px-4 py-3 rounded-lg"
                            >
                                {groups.map((g, i) => (
                                    <option key={i} value={i} className="bg-gray-900">{g.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Service Name</label>
                            <input
                                type="text"
                                value={service.name}
                                onChange={e => setService({ ...service, name: e.target.value })}
                                className="w-full glass-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500/50"
                                placeholder="My Awesome App"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">URL</label>
                            <input
                                type="text"
                                value={service.url}
                                onChange={e => setService({ ...service, url: e.target.value })}
                                className="w-full glass-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500/50"
                                placeholder="https://app.example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Subtitle (Optional)</label>
                            <input
                                type="text"
                                value={service.subtitle || ''}
                                onChange={e => setService({ ...service, subtitle: e.target.value })}
                                className="w-full glass-input px-4 py-3 rounded-lg"
                                placeholder="Dashboard"
                            />
                        </div>

                        <div>
                            <IconPicker value={service.icon || 'FaGlobe'} onChange={icon => setService({ ...service, icon })} />
                        </div>

                        <div className="col-span-1 md:col-span-2 border-t border-white/10 pt-4 mt-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${service.hidden ? 'bg-red-500' : 'bg-gray-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${service.hidden ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={service.hidden || false}
                                    onChange={(e) => setService({ ...service, hidden: e.target.checked })}
                                />
                                <span className="text-gray-300 group-hover:text-white transition-colors">Hidden (Draft Mode)</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-2">Hidden services are saved but not visible on the main dashboard.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(service, selectedGroupIndex)}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
                    >
                        Save Service
                    </button>
                </div>
            </div>
        </div>
    );
}
