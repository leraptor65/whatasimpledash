"use client";

import { useEffect, useState } from 'react';
import type { DashboardConfig, Service, ServiceGroup } from '@/types';
import { ServiceModal } from '@/components/ServiceModal';
import { GroupModal } from '@/components/GroupModal';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import * as InitialIcons from 'react-icons/fa'; // Load icons for display

const allIcons: any = InitialIcons;

export default function ServicesPage() {
    const [config, setConfig] = useState<DashboardConfig | null>(null);
    const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error' | 'idle'>('loading');
    const [draggedItem, setDraggedItem] = useState<{ groupIndex: number, serviceIndex: number } | null>(null);

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

    const handleDeleteService = async (groupIndex: number, serviceIndex?: number) => {
        // Confirmation is done in modal now usually, but if called directly we might want it.
        // Modal logic wraps confirm, so here we just execute? 
        // Wait, GroupModal does confirm. ServiceModal does NOT do confirm in my previous code!
        // GroupModal code: `if (window.confirm...) onDelete()`.
        // ServiceModal code: Just `onClick={() => onDelete(...)}`.
        // So `handleDeleteService` MUST confirm.
        if (!config || !window.confirm('Delete this service?')) return;
        const newGroups = [...config.groups];
        if (typeof serviceIndex !== 'number' || serviceIndex < 0) return; // Safety

        newGroups[groupIndex].services.splice(serviceIndex, 1);
        const success = await saveConfig({ ...config, groups: newGroups });
        if (success) {
            alert('Service deleted successfully!');
            setIsServiceModalOpen(false);
            setEditingService(null);
        } else {
            alert('Failed to delete service.');
        }
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
                collapsed: groupData.collapsed,
                titleAlign: groupData.titleAlign,
                titleBackgroundColor: groupData.titleBackgroundColor,
                titleTextColor: groupData.titleTextColor
            };
        } else {
            // Add new
            newGroups.push({
                name: groupData.name!,
                columns: groupData.columns || 3,
                services: [],
                collapsed: groupData.collapsed,
                titleAlign: groupData.titleAlign,
                titleBackgroundColor: groupData.titleBackgroundColor,
                titleTextColor: groupData.titleTextColor
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
        // Confirmation done in GroupModal? Yes. 
        // BUT wait, GroupModal calls `onDelete` which is THIS function. 
        // IF GroupModal has confirm, we don't need double confirm here. 
        // GroupModal: `if (window.confirm('Delete this group...')) onDelete()`.
        // So we can remove confirm here, OR rely on it. 
        // Let's remove confirm here if it's annoying, or keeping it is safer. 
        // Actually double alert is bad.
        // Let's assume passed callback is "action" only.
        // BUT wait. If I click Delete in modal, it confirms, then calls this. 
        // This calls `!window.confirm` -> double confirm. 
        // I should remove confirm here OR remove it from modal.
        // I already edited GroupModal to have confirm. I will remove it here.
        // ServiceModal did NOT have confirm in my modification. So I keep confirm here for service.

        if (!config) return;
        const newGroups = [...config.groups];
        newGroups.splice(index, 1);
        const success = await saveConfig({ ...config, groups: newGroups });
        if (success) {
            alert('Group deleted successfully!');
            setIsGroupModalOpen(false);
            setEditingGroupIndex(null);
        } else {
            alert('Failed to delete group.');
        }
    };


    const handleMoveService = async (groupIndex: number, serviceIndex: number, direction: 'up' | 'down') => {
        if (!config) return;
        const newGroups = [...config.groups];
        const group = newGroups[groupIndex];
        const services = group.services;

        if (direction === 'up') {
            if (serviceIndex === 0) return;
            [services[serviceIndex], services[serviceIndex - 1]] = [services[serviceIndex - 1], services[serviceIndex]];
        } else {
            if (serviceIndex === services.length - 1) return;
            [services[serviceIndex], services[serviceIndex + 1]] = [services[serviceIndex + 1], services[serviceIndex]];
        }

        await saveConfig({ ...config, groups: newGroups });
    };

    // --- DnD Handlers ---
    const handleDragStart = (e: React.DragEvent, groupIndex: number, serviceIndex: number) => {
        setDraggedItem({ groupIndex, serviceIndex });
        e.dataTransfer.effectAllowed = 'move';
        // Make ghost image look cleaner if possible, or just default
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetGroupIndex: number, targetServiceIndex: number) => {
        e.preventDefault();
        if (!config || !draggedItem) return;

        // Only allow reordering within the SAME group for simplicity (user asked for reorganizer, usually implies sort)
        // If user wants to move between groups, we can support that, but let's start with safe reorder.
        // Actually, user just said "for services in groups", implying reordering. Moving between groups is nice but maybe complex?
        // Let's support same-group reordering first to avoid data loss edge cases.

        if (draggedItem.groupIndex !== targetGroupIndex) return;
        if (draggedItem.serviceIndex === targetServiceIndex) return;

        const newGroups = [...config.groups];
        const group = newGroups[targetGroupIndex];
        const services = [...group.services];

        const [removed] = services.splice(draggedItem.serviceIndex, 1);
        services.splice(targetServiceIndex, 0, removed);

        newGroups[targetGroupIndex].services = services;

        setDraggedItem(null);
        await saveConfig({ ...config, groups: newGroups });
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

                        <div className="space-y-2">
                            {(group.services || []).map((service: Service, serviceIndex: number) => {
                                const iconName = service.icon;
                                let IconElement;

                                if (iconName && (iconName.endsWith('.png') || iconName.endsWith('.svg') || iconName.endsWith('.jpg') || iconName.endsWith('.webp'))) {
                                    IconElement = <img src={`/icons/${iconName}`} alt="" className="w-full h-full object-contain" />;
                                } else {
                                    const Icon = (iconName && allIcons[iconName]) ? allIcons[iconName] : allIcons.FaGlobe;
                                    IconElement = <Icon />;
                                }

                                const isFirst = serviceIndex === 0;
                                const isLast = serviceIndex === (group.services || []).length - 1;

                                return (
                                    <div
                                        key={serviceIndex}
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, groupIndex, serviceIndex)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, groupIndex, serviceIndex)}
                                        className={`glass-card px-4 py-3 rounded-xl flex items-center gap-4 group relative transition-all ${service.hidden ? 'opacity-50 grayscale' : ''} ${draggedItem?.groupIndex === groupIndex && draggedItem?.serviceIndex === serviceIndex ? 'opacity-50 border-2 border-dashed border-cyan-500' : 'hover:border-white/20'}`}
                                        style={{ cursor: 'grab' }}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 text-lg overflow-hidden p-1">
                                            {IconElement}
                                        </div>
                                        <div className="flex-1 min-w-0 flex items-center gap-4">
                                            <div>
                                                <h4 className="font-semibold truncate text-sm">{service.name}</h4>
                                                <p className="text-xs text-gray-500 truncate">{service.url}</p>
                                            </div>
                                            {(service.layout || service.align || service.showIcon === false) && (
                                                <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/10">Custom Style</span>
                                            )}
                                        </div>
                                        {service.hidden && <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Hidden</span>}

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Reorder Controls */}
                                            <div className="flex flex-col gap-0.5">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMoveService(groupIndex, serviceIndex, 'up'); }}
                                                    disabled={isFirst}
                                                    className={`p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors`}
                                                    title="Move Up"
                                                >
                                                    <FaChevronUp size={10} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMoveService(groupIndex, serviceIndex, 'down'); }}
                                                    disabled={isLast}
                                                    className={`p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors`}
                                                    title="Move Down"
                                                >
                                                    <FaChevronDown size={10} />
                                                </button>
                                            </div>

                                            <div className="w-px bg-white/10 mx-1"></div>

                                            <div className="flex gap-1 items-center">
                                                <button
                                                    onClick={() => {
                                                        setEditingService({ service, groupIndex, serviceIndex });
                                                        setIsServiceModalOpen(true);
                                                    }}
                                                    className="p-1.5 bg-blue-600/20 text-blue-400 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                onClick={() => {
                                    setEditingService({ service: { name: '', url: '', icon: 'FaPlus' }, groupIndex, serviceIndex: -1 });
                                    setIsServiceModalOpen(true);
                                }}
                                className="w-full glass-card border-dashed border-white/20 p-3 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-white/5"
                            >
                                <FaPlus size={12} />
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
                onDelete={handleDeleteService}
                initialService={editingService?.service}
                groupIndex={editingService?.groupIndex}
                serviceIndex={editingService?.serviceIndex}
                groups={config.groups}
            />

            <GroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onSave={handleSaveGroup}
                onDelete={() => editingGroupIndex !== null && handleDeleteGroup(editingGroupIndex)}
                initialGroup={editingGroupIndex !== null ? config.groups[editingGroupIndex] : undefined}
            />
        </div>
    );
}
