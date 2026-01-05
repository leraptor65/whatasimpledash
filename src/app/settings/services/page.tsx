"use client";

import { useEffect, useState } from 'react';
import type { DashboardConfig, Service, ServiceGroup } from '@/types';
import { ServiceModal } from '@/components/ServiceModal';
import { GroupModal } from '@/components/GroupModal';
import { FaPlus, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import * as InitialIcons from 'react-icons/fa'; // Load icons for display

const allIcons: any = InitialIcons;

export default function ServicesPage() {
    const [config, setConfig] = useState<DashboardConfig | null>(null);
    const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error'>('loading');

    // modal states
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    const [editingService, setEditingService] = useState<{ service: Service, groupIndex: number, serviceIndex: number } | null>(null);
    const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (!data.groups) data.groups = [];
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

    // --- Service Handlers ---

    const handleSaveService = async (service: Service, groupIndex: number) => {
        if (!config) return;
        const newGroups = [...config.groups];

        // If editing, remove from old location first
        if (editingService) {
            const oldGroup = newGroups[editingService.groupIndex];
            oldGroup.services.splice(editingService.serviceIndex, 1);
        }

        // Add to new location (or same location if group didn't change)
        if (!newGroups[groupIndex]) {
            // Should not happen if select is correct
            return;
        }

        if (!newGroups[groupIndex].services) newGroups[groupIndex].services = [];
        newGroups[groupIndex].services.push(service);

        const success = await saveConfig({ ...config, groups: newGroups });
        if (success) {
            setIsServiceModalOpen(false);
            setEditingService(null);
            alert('Service saved successfully!');
        } else {
            alert('Failed to save service.');
        }
    };

    const handleDeleteService = async (groupIndex: number, serviceIndex: number) => {
        if (!config || !window.confirm('Delete this service?')) return;
        const newGroups = [...config.groups];
        newGroups[groupIndex].services.splice(serviceIndex, 1);
        const success = await saveConfig({ ...config, groups: newGroups });
        if (success) alert('Service deleted successfully!');
        else alert('Failed to delete service.');
    };

    // --- Group Handlers ---

    const handleSaveGroup = async (groupData: Partial<ServiceGroup>) => {
        if (!config) return;
        const newGroups = [...config.groups];

        if (editingGroupIndex !== null) {
            // Edit existing
            newGroups[editingGroupIndex] = {
                ...newGroups[editingGroupIndex],
                name: groupData.name!,
                columns: groupData.columns!,
                collapsed: groupData.collapsed
            };
        } else {
            // Add new
            newGroups.push({
                name: groupData.name!,
                columns: groupData.columns || 3,
                services: [],
                collapsed: groupData.collapsed
            });
        }

        const success = await saveConfig({ ...config, groups: newGroups });
        if (success) {
            setIsGroupModalOpen(false);
            setEditingGroupIndex(null);
            alert('Group saved successfully!');
        } else {
            alert('Failed to save group.');
        }
    };

    const handleDeleteGroup = async (index: number) => {
        if (!config || !window.confirm('Delete this group and all its services?')) return;
        const newGroups = [...config.groups];
        newGroups.splice(index, 1);
        const success = await saveConfig({ ...config, groups: newGroups });
        if (success) alert('Group deleted successfully!');
        else alert('Failed to delete group.');
    };


    if (!config) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Services</h2>
                    <p className="text-gray-400">Manage your apps and links.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setEditingService(null); setIsServiceModalOpen(true); }}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                        <FaPlus /> Add New Service
                    </button>
                    {status === 'saving' && <span className="text-yellow-500 animate-pulse flex items-center gap-2"><FaCheck /> Saving...</span>}
                    {status === 'saved' && <span className="text-green-500 flex items-center gap-2"><FaCheck /> Saved</span>}
                </div>
            </header>

            <div className="space-y-8">
                {config.groups.map((group: ServiceGroup, groupIndex: number) => (
                    <section key={groupIndex} className="glass-panel p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-gray-200">{group.name}</h3>
                                {group.collapsed && (
                                    <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">Collapsed</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingGroupIndex(groupIndex);
                                        setIsGroupModalOpen(true);
                                    }}
                                    className="text-gray-400 hover:text-cyan-400 p-2 text-sm flex items-center gap-1 transition-colors"
                                >
                                    <FaEdit /> Edit Group
                                </button>
                                <button
                                    onClick={() => handleDeleteGroup(groupIndex)}
                                    className="text-gray-400 hover:text-red-400 p-2 text-sm flex items-center gap-1 transition-colors"
                                >
                                    <FaTrash /> Delete Group
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {(group.services || []).map((service: Service, serviceIndex: number) => {
                                const Icon = allIcons[service.icon as keyof typeof allIcons] || allIcons.FaGlobe;
                                return (
                                    <div key={serviceIndex} className={`glass-card p-4 rounded-xl flex items-center gap-4 group relative ${service.hidden ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 text-xl">
                                            <Icon />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate">{service.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">{service.url}</p>
                                            {service.hidden && <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Hidden</span>}
                                        </div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingService({ service, groupIndex, serviceIndex });
                                                    setIsServiceModalOpen(true);
                                                }}
                                                className="p-1.5 bg-blue-600 rounded-md text-white hover:bg-blue-500"
                                            >
                                                <FaEdit size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteService(groupIndex, serviceIndex)}
                                                className="p-1.5 bg-red-600 rounded-md text-white hover:bg-red-500"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                onClick={() => {
                                    setEditingService({ service: { name: '', url: '', icon: 'FaPlus' }, groupIndex, serviceIndex: -1 });
                                    setIsServiceModalOpen(true);
                                }}
                                className="glass-card border-dashed border-white/20 p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 cursor-pointer min-h-[88px]"
                            >
                                <FaPlus />
                                <span className="text-sm">Add Service</span>
                            </button>
                        </div>
                    </section>
                ))}

                <button
                    onClick={() => {
                        setEditingGroupIndex(null);
                        setIsGroupModalOpen(true);
                    }}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all font-medium flex items-center justify-center gap-2"
                >
                    <FaPlus /> Create New Group
                </button>
            </div>

            <ServiceModal
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                onSave={handleSaveService}
                initialService={editingService?.service}
                groupIndex={editingService?.groupIndex}
                groups={config.groups}
            />

            <GroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onSave={handleSaveGroup}
                initialGroup={editingGroupIndex !== null ? config.groups[editingGroupIndex] : undefined}
            />
        </div>
    );
}
