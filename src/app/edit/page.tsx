"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css'; // Editor theme
import yaml from 'js-yaml';
import type { DashboardConfig, ServiceGroup, Service } from '../../types';
import { FaPlus, FaTrash } from 'react-icons/fa';

// --- Form UI Component ---
const FormEditor = ({ configObject, setConfigObject, handleBackgroundUpload, handleBackgroundRemove }: { configObject: DashboardConfig | null, setConfigObject: React.Dispatch<React.SetStateAction<DashboardConfig | null>>, handleBackgroundUpload: (file: File) => void, handleBackgroundRemove: () => void }) => {
  if (!configObject) return <div className="text-red-400">Could not parse YAML. Please fix in Raw Editor.</div>;

  const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setConfigObject(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const [key, subkey] = name.split('.');
      setConfigObject(prev => {
          if (!prev) return null;
          if (subkey) {
            return { ...prev, theme: { ...prev.theme, card: { ...prev.theme.card, [subkey]: value } } };
          }
          // @ts-ignore
          return { ...prev, theme: { ...prev.theme, [key]: value } };
      });
  };

  const handleGroupChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const newGroups = [...(configObject.groups || [])];
      // @ts-ignore
      newGroups[index][name] = name === 'columns' ? parseInt(value) : value;
      setConfigObject(prev => prev ? { ...prev, groups: newGroups } : null);
  };

  const handleServiceChange = (groupIndex: number, serviceIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const newGroups = [...(configObject.groups || [])];
      // @ts-ignore
      newGroups[groupIndex].services[serviceIndex][name] = value;
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
  
  const handleBackgroundUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setConfigObject(prev => {
          if (!prev) return null;
          const { backgroundImage, ...rest } = prev;
          return { ...rest, backgroundImageUrl: value };
      });
  };

  return (
      <div className="space-y-8">
          {/* Global Settings */}
          <section>
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Global Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-400">Dashboard Title</label>
                      <input type="text" name="title" value={configObject.title} onChange={handleGlobalChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-400">Default Columns</label>
                      <input type="number" name="defaultColumns" value={configObject.defaultColumns} min="1" max="6" onChange={e => setConfigObject(prev => prev ? { ...prev, defaultColumns: parseInt(e.target.value) || 4 } : null)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                  </div>
              </div>
          </section>

          {/* Theme Settings */}
          <section>
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Theme Colors</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(configObject.theme).filter(([key]) => typeof configObject.theme[key as keyof typeof configObject.theme] === 'string').map(([key, value]) => (
                      <div key={key}>
                          <label className="block text-sm font-medium text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                          <input type="color" name={key} value={value as string} onChange={handleThemeChange} className="mt-1 block w-full h-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm"/>
                      </div>
                  ))}
                  {Object.entries(configObject.theme.card).map(([key, value]) => (
                       <div key={key}>
                          <label className="block text-sm font-medium text-gray-400 capitalize">Card {key}</label>
                          <input type="color" name={`card.${key}`} value={value} onChange={handleThemeChange} className="mt-1 block w-full h-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm"/>
                      </div>
                  ))}
              </div>
          </section>

          {/* Appearance */}
          <section>
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Appearance</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Custom Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Background Image URL</label>
                        <input type="text" placeholder="https://example.com/image.png" value={configObject.backgroundImageUrl || ''} onChange={handleBackgroundUrlChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500"/>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-400 px-4">OR</span>
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-400">Upload an Image</label>
                            <input type="file" accept="image/png, image/jpeg" className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" onChange={(e) => e.target.files && handleBackgroundUpload(e.target.files[0])} />
                        </div>
                    </div>
                  </div>
                  {(configObject.backgroundImage || configObject.backgroundImageUrl) && (
                    <button onClick={handleBackgroundRemove} className="mt-4 text-sm text-red-500 hover:text-red-400">Remove Background</button>
                  )}
                </div>
              </div>
          </section>

          {/* Groups and Services */}
          <section>
               <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <h2 className="text-2xl font-bold">Service Groups</h2>
                    <button onClick={handleAddGroup} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-3 py-1 rounded-md text-sm">
                        <FaPlus /> Add Group
                    </button>
               </div>
               <div className="space-y-6">
                  {(configObject.groups || []).map((group, groupIndex) => (
                      <div key={groupIndex} className="p-4 border border-gray-700 rounded-lg">
                          <div className="flex justify-between items-center mb-4">
                            <input type="text" name="name" value={group.name} onChange={(e) => handleGroupChange(groupIndex, e)} className="text-xl font-semibold bg-transparent w-full focus:outline-none focus:bg-gray-600 rounded p-1"/>
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
                                      <div className="flex justify-end">
                                        <button onClick={() => handleDeleteService(groupIndex, serviceIndex)} className="text-red-500 hover:text-red-400 p-1 text-xs">
                                            <FaTrash />
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          <input type="text" placeholder="Name" name="name" value={service.name || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="bg-gray-600 rounded p-1"/>
                                          <input type="text" placeholder="URL" name="url" value={service.url || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="bg-gray-600 rounded p-1"/>
                                          <input type="text" placeholder="Subtitle" name="subtitle" value={service.subtitle || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="bg-gray-600 rounded p-1"/>
                                          <input type="text" placeholder="Icon (e.g., FaGithub or icon.png)" name="icon" value={service.icon || ''} onChange={(e) => handleServiceChange(groupIndex, serviceIndex, e)} className="bg-gray-600 rounded p-1"/>
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
                  ))}
               </div>
          </section>
      </div>
  );
};

export default function EditPage() {
  const [configText, setConfigText] = useState('');
  const [configObject, setConfigObject] = useState<DashboardConfig | null>(null);
  const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error' | 'ready'>('loading');
  const [editorMode, setEditorMode] = useState<'raw' | 'form'>('form');
  const [theme, setTheme] = useState({ background: '#111827', text: '#ffffff', button: '#0d6efd', buttonHover: '#0b5ed7' });
  const [buttonHovered, setButtonHovered] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.theme) {
          setTheme({
            background: data.theme.background || '#111827',
            text: data.theme.text || '#ffffff',
            button: data.theme.button || '#0d6efd',
            buttonHover: data.theme.buttonHover || '#0b5ed7'
          });
        }
      });
  }, []);

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
    let yamlString = configText;
    if (editorMode === 'form' && configObject) {
      yamlString = yaml.dump(configObject);
      setConfigText(yamlString); 
    }
    
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/yaml' },
        body: yamlString,
      });

      if (response.ok) {
        setStatus('saved');
        setTimeout(() => setStatus('ready'), 2000);
      } else {
        setStatus('error');
        const errorData = await response.json();
        alert(`Error saving: ${errorData.message}`);
      }
    } catch (error) {
      setStatus('error');
      alert('An unexpected error occurred.');
    }
  };

  const handleBackgroundUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('background', file);
    setStatus('saving');
    try {
      const response = await fetch('/api/upload/background', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      setConfigObject(prev => {
        if (!prev) return null;
        const { backgroundImageUrl, ...rest } = prev;
        return { ...rest, backgroundImage: data.filename };
      });
      setStatus('saved');
      setTimeout(() => setStatus('ready'), 2000);
    } catch (error) {
      alert('Background upload failed!');
      setStatus('error');
    }
  };

  const handleBackgroundRemove = async () => {
    if (!window.confirm("Are you sure you want to remove the background? This will also save your current configuration.")) return;
    setStatus('saving');
    try {
      await fetch('/api/upload/background', { method: 'DELETE' });
      setConfigObject(prev => {
        if (!prev) return null;
        const { backgroundImage, backgroundImageUrl, ...rest } = prev;
        return rest;
      });
      setStatus('saved');
      setTimeout(() => setStatus('ready'), 2000);
    } catch (error) {
      alert('Failed to remove background!');
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen w-full p-4 md:p-8" style={{ backgroundColor: theme.background, color: theme.text }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Configuration</h1>
          <Link href="/" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="flex border border-gray-700 rounded-lg p-1 mb-4 max-w-xs">
            <button onClick={() => setEditorMode('form')} className={`w-1/2 rounded-md py-1 ${editorMode === 'form' ? 'bg-cyan-600' : 'hover:bg-gray-700'}`}>Form</button>
            <button onClick={() => setEditorMode('raw')} className={`w-1/2 rounded-md py-1 ${editorMode === 'raw' ? 'bg-cyan-600' : 'hover:bg-gray-700'}`}>Raw Editor</button>
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
          <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <FormEditor configObject={configObject} setConfigObject={setConfigObject} handleBackgroundUpload={handleBackgroundUpload} handleBackgroundRemove={handleBackgroundRemove} />
          </div>
        )}

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={status === 'saving' || status === 'loading'}
            className="text-white font-bold px-6 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: buttonHovered ? theme.buttonHover : theme.button }}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
          >
            {status === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
          {status === 'saved' && <span className="text-green-400">Configuration saved!</span>}
          {status === 'error' && <span className="text-red-400">Failed to save. Check YAML syntax.</span>}
        </div>
      </div>
    </main>
  );
}