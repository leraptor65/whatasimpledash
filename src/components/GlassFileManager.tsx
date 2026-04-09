"use client";

import { useState, useEffect } from 'react';
import { FaTrash, FaUpload, FaDownload, FaEdit, FaImage } from 'react-icons/fa';
import type { DashboardConfig } from '@/types';

type FileManagerProps = {
    type: 'backgrounds' | 'icons';
    onConfigUpdate?: (newConfig: DashboardConfig) => void;
    currentConfig?: DashboardConfig;
    activeFile?: string;
};

export const GlassFileManager = ({ type, onConfigUpdate, currentConfig, activeFile }: FileManagerProps) => {
    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const fetchFiles = async () => {
        const res = await fetch(`/api/files/${type}`);
        const data = await res.json();
        if (data.success) {
            setFiles(data.files);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [type]);

    const handleFileChange = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`/api/files/${type}`, { method: 'POST', body: formData });
        const data = await res.json();
        setIsUploading(false);

        if (data.success) {
            fetchFiles();
        } else {
            alert(`Error: ${data.error}`);
        }
    };

    const handleDelete = async () => {
        if (!selectedFile) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedFile}?`)) return;

        const res = await fetch(`/api/files/${type}/${selectedFile}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            fetchFiles();
            setSelectedFile(null);
        } else {
            alert(`Error: ${data.error}`);
        }
    };

    const handleRename = async () => {
        if (!selectedFile || !newName) return;

        const res = await fetch(`/api/files/${type}/${selectedFile}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newName }),
        });
        const data = await res.json();
        if (data.success) {
            fetchFiles();
            setSelectedFile(newName);
        } else {
            alert(`Error: ${data.error}`);
        }
    };

    const handleSetActive = (filename: string | null) => {
        if (!currentConfig || type !== 'backgrounds' || !onConfigUpdate) return;

        const newConfig = { ...currentConfig };
        if (!newConfig.backgrounds) newConfig.backgrounds = {};

        newConfig.backgrounds.active = filename || undefined;
        onConfigUpdate(newConfig);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/80">
                        <FaImage size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg capitalize">{type}</h3>
                        <p className="text-xs text-gray-400">{files.length} files</p>
                    </div>
                </div>
                <label className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 ${isUploading ? 'bg-white/10 text-white/40 cursor-wait' : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-xl shadow-black/20 cursor-pointer'}`}>
                    <FaUpload className={isUploading ? 'animate-bounce' : ''} /> {isUploading ? 'Uploading...' : 'Upload New'}
                    <input
                        type="file"
                        className="hidden"
                        accept={type === 'backgrounds' ? 'image/png, image/jpeg, image/webp' : 'image/png, image/svg+xml'}
                        disabled={isUploading}
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                handleFileChange(e.target.files[0]);
                            }
                            e.target.value = '';
                        }}
                    />
                </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* None Option for Backgrounds */}
                {type === 'backgrounds' && (
                    <div
                        onClick={() => handleSetActive(null)}
                        className={`group relative aspect-square glass-card rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-white/40 transition-all flex items-center justify-center bg-black/20 ${!activeFile ? 'ring-2 ring-white/60' : ''}`}
                    >
                        <span className="text-gray-400 font-medium group-hover:text-white">None</span>
                        {!activeFile && (
                            <div className="absolute top-2 right-2 bg-white text-black text-[10px] px-2 py-0.5 rounded-full shadow-lg">
                                Active
                            </div>
                        )}
                    </div>
                )}

                {files.map(file => {
                    const isActive = activeFile === file;
                    return (
                        <div
                            key={file}
                            onClick={() => { setSelectedFile(file); setNewName(file); }}
                            className={`group relative aspect-square glass-card rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-white/40 transition-all ${isActive ? 'ring-2 ring-white/60' : ''}`}
                        >
                            <img
                                src={`/api/images/${type}/${file}`}
                                alt={file}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <span className="text-xs font-medium truncate">{file}</span>
                            </div>
                            {isActive && (
                                <div className="absolute top-2 right-2 bg-white text-black text-[10px] px-2 py-0.5 rounded-full shadow-lg">
                                    Active
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setSelectedFile(null)}>
                    <div className="bg-white/5 backdrop-blur-2xl w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/10 animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="text-lg font-bold truncate pr-4 text-white/90">{selectedFile}</h3>
                            <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-auto flex flex-col items-center justify-center bg-black/40">
                            <img src={`/api/images/${type}/${selectedFile}`} alt="Preview" className="max-w-full max-h-[60vh] rounded-lg shadow-2xl" />
                        </div>
                        <div className="p-6 border-t border-white/10 bg-white/5 space-y-4">
                            {type === 'backgrounds' && (
                                <button
                                    onClick={() => { handleSetActive(selectedFile); setSelectedFile(null); }}
                                    className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bold shadow-xl shadow-black/20 mb-4 transition-all active:scale-[0.98]"
                                >
                                    Set as Active Background
                                </button>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-white/20 outline-none transition-all"
                                />
                                <button onClick={handleRename} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-medium flex items-center gap-2 transition-all active:scale-95">
                                    <FaEdit className="text-white/60" /> Rename
                                </button>
                            </div>
                            <div className="flex justify-between gap-4 pt-2">
                                <a href={`/api/images/${type}/${selectedFile}`} download className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-medium flex items-center gap-2 transition-all active:scale-95">
                                    <FaDownload className="text-green-400" /> Download
                                </a>
                                <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl text-red-500 font-medium flex items-center gap-2 transition-all active:scale-95">
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
