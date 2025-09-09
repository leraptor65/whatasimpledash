"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css';
import yaml from 'js-yaml';
import type { DashboardConfig, ServiceGroup, Service } from '../../types';
import { FaPlus, FaTrash, FaChevronDown, FaUndo, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { SketchPicker, type ColorResult } from 'react-color';
import { FileManager } from '@/components/FileManager';

// --- Default Theme for Reset ---
const defaultTheme = {
  mainBackground: 'rgba(20, 20, 20, 1)',
  titleBackground: 'rgba(0, 0, 0, 0.4)',
  text: 'rgba(255, 255, 255, 1)',
  serviceBackground: 'rgba(22, 27, 34, 1)',
  serviceBackgroundHover: 'rgba(33, 38, 45, 1)',
};

// --- Color Picker with Manual Input ---
const ColorPicker = ({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [displayColorPicker, setDisplayColorPicker] = useState(false);

    const handleClick = () => setDisplayColorPicker(!displayColorPicker);
    const handleClose = () => setDisplayColorPicker(false);

    const handleChangeComplete = (color: ColorResult) => {
        const { r, g, b, a } = color.rgb;
        const rgbaString = `rgba(${r}, ${g}, ${b}, ${a})`;
        const event = { target: { name, value: rgbaString } } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 capitalize">{label}</label>
            <div className="mt-1 flex items-center bg-gray-700 border border-gray-600 rounded-md shadow-sm h-11">
                <div
                    className="w-10 h-full rounded-l-md cursor-pointer border-r border-gray-600"
                    style={{ backgroundColor: value }}
                    onClick={handleClick}
                />
                <input
                  type="text"
                  name={name}
                  value={value}
                  onChange={onChange}
                  className="w-full h-full bg-transparent px-2 focus:outline-none"
                />
            </div>
            {displayColorPicker && (
                <div className="absolute z-10">
                    <div className="fixed inset-0" onClick={handleClose} />
                    <SketchPicker color={value} onChangeComplete={handleChangeComplete} />
                </div>
            )}
        </div>
    );
};

// --- Collapsible Section Component ---
const CollapsibleSection = ({ title, children, startOpen = false, isNested = false }: { title: string, children: React.ReactNode, startOpen?: boolean, isNested?: boolean }) => {
    const [isOpen, setIsOpen] = useState(startOpen);
    return (
        <section className={`${isNested ? 'border-none' : 'border border-gray-700 rounded-lg'}`}>
            <button
                type="button"
                className={`w-full flex justify-between items-center p-4 ${isNested ? 'bg-gray-900/50 hover:bg-gray-900' : 'bg-gray-800 hover:bg-gray-700 rounded-t-lg'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <h2 className={`font-bold ${isNested ? 'text-lg' : 'text-xl'}`}>{title}</h2>
                <FaChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className={`${isNested ? 'p-4 border-l border-r border-b border-gray-800' : 'p-4'}`}>
                    {children}
                </div>
            )}
        </section>
    );
};

// --- Form UI Component ---
const FormEditor = ({ configObject, setConfigObject, onConfigUpdate }: { configObject: DashboardConfig | null, setConfigObject: React.Dispatch<React.SetStateAction<DashboardConfig | null>>, onConfigUpdate: (newConfig: DashboardConfig) => void }) => {
  if (!configObject) return <div className="text-red-400">Could not parse YAML. Please fix in Raw Editor.</div>;

  const [url, setUrl] = useState('');

  const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setConfigObject(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setConfigObject(prev => {
          if (!prev) return null;
          return { ...prev, settings: { ...prev.settings, [name]: value } };
      });
  };

  const handleGetIp = async () => {
    try {
        const res = await fetch('/api/ip');
        const data = await res.json();
        if (data.ip) {
            setConfigObject(prev => {
                if (!prev) return null;
                return { ...prev, settings: { ...prev.settings, localIp: data.ip } };
            });
        }
    } catch (error) {
        alert('Could not retrieve IP address.');
    }
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setConfigObject(prev => {
          if (!prev) return null;
          return { ...prev, theme: { ...prev.theme, [name as keyof typeof prev.theme]: value } };
      });
  };

  const handleResetTheme = () => {
    if (window.confirm('Are you sure you want to reset all colors to their default values?')) {
      setConfigObject(prev => prev ? { ...prev, theme: defaultTheme } : null);
    }
  }

  const handleGroupChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const newGroups = [...(configObject.groups || [])];
      // @ts-ignore
      newGroups[index][name] = name === 'columns' ? parseInt(value) : value;
      setConfigObject(prev => prev ? { ...prev, groups: newGroups } : null);
  };

  const handleServiceChange = (groupIndex: number, serviceIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newGroups = [...(configObject.groups || [])];
      // @ts-ignore
      const isCheckbox = type === 'checkbox';
      // @ts-ignore
      newGroups[groupIndex].services[serviceIndex][name] = isCheckbox ? e.target.checked : value;
      setConfigObject(prev => prev ? { ...prev, groups: newGroups } : null);
  };

  const handleAddGroup = () => {
    const newGroup: ServiceGroup = { name: "New Group", columns: 3, services: [] };
    setConfigObject(prev => prev ? { ...prev, groups: [...(prev.groups || []), newGroup] } : null);
  };

  const handleDeleteGroup = (groupIndex: number) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
        const newGroups = [...(configObject.groups || [])].filter((_, i) => i !== groupIndex);
        setConfigObject(prev => prev ? { ...prev, groups: newGroups } : null);
    }
  };

  const handleAddService = (groupIndex: number) => {
    const newService: Service = { name: "New Service", url: "" };
    const newGroups = [...(configObject.groups || [])];
    if (!newGroups[groupIndex].services) {
        newGroups[groupIndex].services = [];
    }
    newGroups[groupIndex].services.push(newService);
    setConfigObject(prev => prev ? { ...prev, groups: newGroups } : null);
  };

  const handleDeleteService = (groupIndex: number, serviceIndex: number) => {
    const newGroups = [...(configObject.groups || [])];
    newGroups[groupIndex].services = newGroups[groupIndex].services.filter((_, i) => i !== serviceIndex);
    setConfigObject(prev => prev ? { ...prev, groups: newGroups } : null);
  };

  const handleToggleTitleBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = e.target;
      setConfigObject(prev => {
          if (!prev) return null;
          return { ...prev, settings: { ...prev.settings, showTitleBackgrounds: checked } };
      });
  };

  const handleBlurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setConfigObject(prev => {
          if (!prev) return null;
          return { ...prev, settings: { ...prev.settings, backgroundBlur: parseInt(value) } };
      });
  };

  const handleUrlDownload = async () => {
    if (!url) return;
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    if(data.success && data.config) {
      onConfigUpdate(data.config);
      setUrl('');
      alert('Background downloaded successfully!');
    } else {
        alert(`Error: ${data.error}`);
    }
  };

  const handleSetActive = async (filename: string) => {
    const response = await fetch('/api/background', { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ filename }) });
    const data = await response.json();
    if(data.success) {
      onConfigUpdate(data.config);
      if (filename === '') {
        alert('Background image removed. The main background color will now be used.');
      }
    }
  };

  const handleBackgroundRemove = async (filename: string) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}? This cannot be undone.`)) return;
    const response = await fetch('/api/background', { method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ filename }) });
    const data = await response.json();
    if(data.success) onConfigUpdate(data.config);
  };

  const moveGroup = (index: number, direction: 'up' | 'down') => {
    const newGroups = [...(configObject.groups || [])];
    const group = newGroups[index];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newGroups.length) return;
    newGroups.splice(index, 1);
    newGroups.splice(newIndex, 0, group);
    setConfigObject(prev => prev ? { ...prev, groups: newGroups } : null);
  };

  const moveService = (groupIndex: number, serviceIndex: number, direction: 'up' | 'down') => {
    const newGroups = [...(configObject.groups || [])];
    const services = [...(newGroups[groupIndex].services || [])];
    const service = services[serviceIndex];
    const newIndex = direction === 'up' ? serviceIndex - 1 : serviceIndex + 1;
    if (newIndex < 0 || newIndex >= services.length) return;
    services.splice(serviceIndex, 1);
    services.splice(newIndex, 0, service);
    newGroups[groupIndex].services = services;
    setConfigObject(prev => prev ? { ...prev, groups: newGroups } : null);
  };


  const themeColorMap = [
      { key: 'mainBackground', label: 'Main Background' },
      { key: 'titleBackground', label: 'Title Background' },
      { key: 'text', label: 'Text' },
      { key: 'serviceBackground', label: 'Service Background' },
      { key: 'serviceBackgroundHover', label: 'Service Background Hover' },
  ];

  return (
      <div className="space-y-4">
          <CollapsibleSection title="Dashboard Settings" startOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 mb-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-400">Dashboard Title</label>
                      <input type="text" name="title" value={configObject.title} onChange={handleGlobalChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-400">Default Columns</label>
                      <input type="number" name="defaultColumns" value={configObject.defaultColumns} min="1" max="6" onChange={e => setConfigObject(prev => prev ? { ...prev, defaultColumns: parseInt(e.target.value) || 4 } : null)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400">Local IP Address</label>
                    <div className="flex gap-2">
                        <input type="text" name="localIp" value={configObject.settings?.localIp || ''} onChange={handleSettingsChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3"/>
                        <button onClick={handleGetIp} className="bg-cyan-600 hover:bg-cyan-500 px-4 rounded-md text-sm">Get</button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Services marked as "local" will only appear when accessed from this IP.</p>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                      <input
                          type="checkbox"
                          id="showTitleBackgrounds"
                          checked={configObject.settings?.showTitleBackgrounds || false}
                          onChange={handleToggleTitleBackground}
                          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500"
                      />
                      <label htmlFor="showTitleBackgrounds" className="text-sm font-medium text-gray-300">Show Title Backgrounds</label>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400">Background Blur: {configObject.settings?.backgroundBlur || 0}px</label>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            value={configObject.settings?.backgroundBlur || 0}
                            onChange={handleBlurChange}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                  </div>
              </div>

              <div className="space-y-4">
                <CollapsibleSection title="Theme Colors" isNested={true}>
                    <div className="flex justify-end mb-4">
                        <button onClick={handleResetTheme} className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300">
                            <FaUndo /> Reset to Default
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {themeColorMap.map(({ key, label }) => (
                            <ColorPicker key={key} label={label} name={key} value={configObject.theme[key as keyof typeof configObject.theme]} onChange={handleThemeChange} />
                        ))}
                    </div>
                </CollapsibleSection>
                <CollapsibleSection title="Backgrounds" isNested={true}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Download from URL</label>
                        <div className="flex gap-2">
                            <input type="text" placeholder="https://example.com/image.png" value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3"/>
                            <button onClick={handleUrlDownload} className="bg-cyan-600 hover:bg-cyan-500 px-4 rounded-md">Add</button>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-400 px-4">OR</span>
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-400">Upload an Image</label>
                            <input type="file" accept="image/png, image/jpeg" className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" onChange={(e) => { if (e.target.files) { const file = e.target.files[0]; const formData = new FormData(); formData.append('file', file); formData.append('type', 'background'); fetch('/api/upload', { method: 'POST', body: formData }).then(res => res.json()).then(data => { if (data.success && data.config) { onConfigUpdate(data.config); } else { alert(`Error: ${data.error}`); } }); } e.target.value = ''; }} />
                        </div>
                    </div>
                  </div>
                  <div className="flex justify-end mb-4">
                      <button onClick={() => handleSetActive('')} className="text-sm text-cyan-400 hover:text-cyan-300">
                          Use Main Background Color
                      </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Available Backgrounds</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {(configObject.backgrounds?.history || []).map(filename => (
                        <div key={filename} className="relative group">
                          <button onClick={() => handleSetActive(filename)} className={`w-full h-24 bg-transparent rounded-lg bg-cover bg-center focus:outline-none focus:ring-4 ${configObject.backgrounds?.active === filename ? 'ring-cyan-500' : 'ring-gray-700 hover:ring-cyan-600'}`} style={{backgroundImage: `url(/api/images/backgrounds/${filename})`}} />
                          <button onClick={() => handleBackgroundRemove(filename)} className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <FaTrash size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleSection>
                <CollapsibleSection title="Assets" isNested={true}>
                    <div className="space-y-6">
                        <FileManager type="backgrounds" onConfigUpdate={onConfigUpdate} />
                        <div className="border-t border-gray-700 pt-6">
                            <FileManager type="icons" onConfigUpdate={onConfigUpdate} />
                        </div>
                    </div>
                </CollapsibleSection>
              </div>
          </CollapsibleSection>

          <CollapsibleSection title="Service Groups" startOpen={true}>
             <div className="flex justify-end items-center mb-4">
                  <button onClick={handleAddGroup} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-3 py-1 rounded-md text-sm">
                      <FaPlus /> Add Group
                  </button>
             </div>
             <div className="space-y-6">
                {(configObject.groups || []).map((group, groupIndex) => (
                    <CollapsibleSection key={groupIndex} title={group.name || "New Group"}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <button onClick={() => moveGroup(groupIndex, 'up')} className="p-1 text-gray-400 hover:text-white"><FaArrowUp /></button>
                                <button onClick={() => moveGroup(groupIndex, 'down')} className="p-1 text-gray-400 hover:text-white"><FaArrowDown /></button>
                                <input type="text" name="name" value={group.name} onChange={(e) => handleGroupChange(groupIndex, e)} className="text-xl font-semibold bg-transparent w-full focus:outline-none focus:bg-gray-600 rounded p-1"/>
                              </div>
                              <button onClick={() => handleDeleteGroup(groupIndex)} className="text-red-500 hover:text-red-400 p-1">
                                  <FaTrash />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Columns</label>
                                    <input type="number" name="columns" value={group.columns} min="1" max="6" onChange={(e) => handleGroupChange(groupIndex, e)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Layout</label>
                                    <select name="layout" value={group.layout || 'vertical'} onChange={(e) => handleGroupChange(groupIndex, e)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3">
                                        <option value="vertical">Vertical</option>
                                        <option value="horizontal">Horizontal</option>
                                        <option value="horizontal-reverse">Horizontal Reverse</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Alignment</label>
                                    <select name="align" value={group.align || 'center'} onChange={(e) => handleGroupChange(groupIndex, e)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3">
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-lg font-semibold text-gray-300">Services in this group</h3>
                                  <button onClick={() => handleAddService(groupIndex)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-md text-xs">
                                      <FaPlus /> Add Service
                                  </button>
                                </div>
                                {(group.services || []).map((service, serviceIndex) => (
                                    <div key={serviceIndex} className="p-2 border-t border-gray-700 space-y-2">
                                        <div className="flex justify-end items-center">
                                            <input type="checkbox" name="local" id={`local-${groupIndex}-${serviceIndex}`} checked={service.local || false} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500 mr-2"/>
                                            <label htmlFor={`local-${groupIndex}-${serviceIndex}`} className="text-sm text-gray-400 mr-auto">Local</label>
                                            <button onClick={() => moveService(groupIndex, serviceIndex, 'up')} className="p-1 text-gray-400 hover:text-white"><FaArrowUp /></button>
                                            <button onClick={() => moveService(groupIndex, serviceIndex, 'down')} className="p-1 text-gray-400 hover:text-white"><FaArrowDown /></button>
                                            <button onClick={() => handleDeleteService(groupIndex, serviceIndex)} className="text-red-500 hover:text-red-400 p-1 text-xs">
                                                <FaTrash />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <input type="text" placeholder="Name" name="name" value={service.name || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="bg-gray-600 rounded p-1"/>
                                            <input type="text" placeholder="URL" name="url" value={service.url || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="bg-gray-600 rounded p-1"/>
                                            <input type="text" placeholder="Subtitle" name="subtitle" value={service.subtitle || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="bg-gray-600 rounded p-1"/>
                                            <input type="text" placeholder="Icon (e.g., FaGithub or icon.png)" name="icon" value={service.icon || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="bg-gray-600 rounded p-1"/>
                                            <ColorPicker label="Background Color (optional)" name="backgroundColor" value={service.backgroundColor || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} />
                                            <ColorPicker label="Text Color (optional)" name="textColor" value={service.textColor || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-400">Ping URL (optional)</label>
                                                <input type="text" placeholder="Ping URL" name="ping" value={service.ping || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md shadow-sm py-1 px-2 text-sm"/>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">Ping Method</label>
                                                <select name="pingMethod" value={service.pingMethod || 'HEAD'} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md shadow-sm py-1 px-2 text-sm">
                                                    <option value="HEAD">HEAD</option>
                                                    <option value="GET">GET</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">Layout (optional)</label>
                                                <select name="layout" value={service.layout || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md shadow-sm py-1 px-2 text-sm">
                                                    <option value="">Inherit from group</option>
                                                    <option value="vertical">Vertical</option>
                                                    <option value="horizontal">Horizontal</option>
                                                    <option value="horizontal-reverse">Horizontal Reverse</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">Alignment (optional)</label>
                                                <select name="align" value={service.align || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md shadow-sm py-1 px-2 text-sm">
                                                    <option value="">Inherit from group</option>
                                                    <option value="left">Left</option>
                                                    <option value="center">Center</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleSection>
                ))}
             </div>
          </CollapsibleSection>
      </div>
  );
};

// --- Cleanup function to remove empty/default values and unknown properties ---
const cleanupConfig = (config: any): DashboardConfig => {
  const cleanedConfig: any = {};

  // Define allowed keys for each level
  const allowedKeys: { [key: string]: string[] } = {
    root: ['title', 'defaultColumns', 'theme', 'backgrounds', 'groups', 'services', 'settings'],
    theme: ['mainBackground', 'titleBackground', 'text', 'serviceBackground', 'serviceBackgroundHover'],
    backgrounds: ['active', 'history'],
    settings: ['showTitleBackgrounds', 'backgroundBlur', 'localIp'],
    group: ['name', 'columns', 'services', 'align', 'layout'],
    service: ['name', 'subtitle', 'url', 'icon', 'ping', 'pingMethod', 'align', 'layout', 'backgroundColor', 'textColor', 'local']
  };

  // Clean root level
  for (const key of allowedKeys.root) {
    if (config[key] !== undefined && config[key] !== null) {
      cleanedConfig[key] = config[key];
    }
  }

  // Clean theme
  if (cleanedConfig.theme) {
    const cleanedTheme: any = {};
    for (const key of allowedKeys.theme) {
      if (cleanedConfig.theme[key]) {
        cleanedTheme[key] = cleanedConfig.theme[key];
      }
    }
    cleanedConfig.theme = cleanedTheme;
  }
  
  // Clean backgrounds
  if (cleanedConfig.backgrounds) {
    const cleanedBackgrounds: any = {};
    for (const key of allowedKeys.backgrounds) {
      if (cleanedConfig.backgrounds[key] && cleanedConfig.backgrounds[key].length > 0) {
        cleanedBackgrounds[key] = cleanedConfig.backgrounds[key];
      }
    }
    if (Object.keys(cleanedBackgrounds).length === 0) {
        delete cleanedConfig.backgrounds;
    } else {
        cleanedConfig.backgrounds = cleanedBackgrounds;
    }
  }

  // Clean settings
  if (cleanedConfig.settings) {
    const cleanedSettings: any = {};
    for (const key of allowedKeys.settings) {
      if (cleanedConfig.settings[key]) {
        cleanedSettings[key] = cleanedConfig.settings[key];
      }
    }
    if (Object.keys(cleanedSettings).length === 0) {
        delete cleanedConfig.settings;
    } else {
        cleanedConfig.settings = cleanedSettings;
    }
  }

  // Clean groups and services
  if (cleanedConfig.groups) {
    cleanedConfig.groups = cleanedConfig.groups.map((group: any) => {
      const cleanedGroup: any = {};
      for (const key of allowedKeys.group) {
        if (group[key] !== undefined && group[key] !== null) {
          cleanedGroup[key] = group[key];
        }
      }
      if (cleanedGroup.services) {
        cleanedGroup.services = cleanedGroup.services.map((service: any) => {
          const cleanedService: any = {};
          for (const key of allowedKeys.service) {
            if (service[key]) {
              cleanedService[key] = service[key];
            }
          }
          return cleanedService;
        });
      }
      return cleanedGroup;
    });
  }
  
  // Clean root services
  if (cleanedConfig.services) {
    cleanedConfig.services = cleanedConfig.services.map((service: any) => {
        const cleanedService: any = {};
        for (const key of allowedKeys.service) {
            if (service[key]) {
                cleanedService[key] = service[key];
            }
        }
        return cleanedService;
    });
    if (cleanedConfig.services.length === 0) {
        delete cleanedConfig.services;
    }
  }


  return cleanedConfig as DashboardConfig;
};


export default function EditPage() {
  const [configText, setConfigText] = useState('');
  const [configObject, setConfigObject] = useState<DashboardConfig | null>(null);
  const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error' | 'ready'>('loading');
  const [editorMode, setEditorMode] = useState<'raw' | 'form'>('form');

  const handleConfigUpdate = (newConfig: DashboardConfig) => {
    setConfigObject(newConfig);
    setConfigText(yaml.dump(newConfig));
  };

  useEffect(() => {
    fetch('/api/config/raw')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch config');
        return res.text();
      })
      .then(text => {
        setConfigText(text);
        try {
          const parsedYaml = yaml.load(text) as DashboardConfig;
          if (!parsedYaml.groups) parsedYaml.groups = [];
          if (!parsedYaml.services) parsedYaml.services = [];
          setConfigObject(parsedYaml);
          setStatus('ready');
        } catch (e) {
          setStatus('error');
        }
      })
      .catch(err => {
        console.error(err);
        setConfigText("# Could not load config/services.yml.\n# Please check file permissions or server logs.");
        setStatus('error');
      });
  }, []);

  const handleSave = async () => {
    setStatus('saving');
    let configToSave: DashboardConfig | null = null;
  
    if (editorMode === 'form' && configObject) {
      configToSave = configObject;
    } else {
      try {
        configToSave = yaml.load(configText) as DashboardConfig;
      } catch (error) {
        alert('Invalid YAML syntax.');
        setStatus('error');
        return;
      }
    }
  
    if (!configToSave) {
      alert('Could not save empty configuration.');
      setStatus('error');
      return;
    }

    const cleanedConfig = cleanupConfig(configToSave);
    const yamlString = yaml.dump(cleanedConfig);
  
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/yaml' },
        body: yamlString,
      });
  
      if (response.ok) {
        setConfigText(yamlString);
        setConfigObject(cleanedConfig);
        setStatus('saved');
        setTimeout(() => setStatus('ready'), 2000);
      } else {
        const errorData = await response.json();
        alert(`Error saving: ${errorData.message}`);
        setStatus('error');
      }
    } catch (error) {
      alert('Failed to save. Check server connection.');
      setStatus('error');
    }
  };

  const SaveButton = () => (
    <button
      onClick={handleSave}
      disabled={status === 'saving' || status === 'loading'}
      className="text-white font-bold px-6 py-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-500"
    >
      {status === 'saving' ? 'Saving...' : 'Save Changes'}
    </button>
  );

  return (
    <main className="min-h-screen w-full p-4 md:p-8" style={{ backgroundColor: 'rgba(20,20,20,1)', color: '#fff' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Configuration</h1>
          <Link href="/" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-4">
            <div className="flex border border-gray-700 rounded-lg p-1 max-w-xs">
                <button onClick={() => setEditorMode('form')} className={`w-1/2 rounded-md py-1 px-4 ${editorMode === 'form' ? 'bg-cyan-600' : 'hover:bg-gray-700'}`}>Form</button>
                <button onClick={() => setEditorMode('raw')} className={`w-1/2 rounded-md py-1 px-4 ${editorMode === 'raw' ? 'bg-cyan-600' : 'hover:bg-gray-700'}`}>Raw</button>
            </div>
            <div className="flex items-center gap-4">
                <SaveButton />
                {status === 'saved' && <span className="text-green-400">Saved!</span>}
                {status === 'error' && <span className="text-red-400">Error.</span>}
            </div>
        </div>

        {editorMode === 'raw' ? (
          <div className="editor-container bg-gray-800 border border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-cyan-500">
            <Editor
              value={configText}
              onValueChange={text => setConfigText(text)}
              highlight={code => highlight(code, languages.yaml, 'yaml')}
              padding={16}
              className="font-mono"
              style={{
                minHeight: '60vh',
                backgroundColor: '#1f2937',
                color: '#d1d5db',
              }}
            />
          </div>
        ) : (
          <FormEditor configObject={configObject} setConfigObject={setConfigObject} onConfigUpdate={handleConfigUpdate} />
        )}

        <div className="mt-4 flex items-center gap-4">
          <SaveButton />
          {status === 'saved' && <span className="text-green-400">Configuration saved!</span>}
          {status === 'error' && <span className="text-red-400">Failed to save. Check YAML syntax.</span>}
        </div>
      </div>
      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>What A Simple Dash - Version {process.env.NEXT_PUBLIC_APP_VERSION}</p>
      </footer>
    </main>
  );
}