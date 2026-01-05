"use client";

import { useState, useEffect } from 'react';
import { FaTrash, FaUpload, FaDownload, FaEdit, FaImage } from 'react-icons/fa';
import type { DashboardConfig } from '@/types';

type FileManagerProps = {
    type: 'backgrounds' | 'icons';
    onConfigUpdate?: (newConfig: DashboardConfig) => void;
};

export const GlassFileManager = ({ type, onConfigUpdate }: FileManagerProps) => {
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
            if (data.config && onConfigUpdate) {
                onConfigUpdate(data.config);
            }
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
            if (data.config && onConfigUpdate) {
                onConfigUpdate(data.config);
            }
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
            if (data.config && onConfigUpdate) {
                onConfigUpdate(data.config);
            }
        } else {
            alert(`Error: ${data.error}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <FaImage size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg capitalize">{type}</h3>
                        <p className="text-xs text-gray-400">{files.length} files</p>
                    </div>
                </div>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isUploading ? 'bg-gray-700 cursor-wait' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 cursor-pointer text-white shadow-lg shadow-cyan-500/20'}`}>
                    <FaUpload /> {isUploading ? 'Uploading...' : 'Upload New'}
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
                {files.map(file => (
                    <div
                        key={file}
                        onClick={() => { setSelectedFile(file); setNewName(file); }}
                        className="group relative aspect-square glass-card rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all"
                    >
                        <img
                            src={`/api/images/${type}/${file}`}
                            alt={file}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <span className="text-xs font-medium truncate">{file}</span>
                        </div>
                    </div>
                ))}
            </div>

            {selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="text-lg font-bold truncate pr-4">{selectedFile}</h3>
                            <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white">Close</button>
                        </div>
                        <div className="p-6 flex-1 overflow-auto flex flex-col items-center justify-center bg-black/40">
                            <img src={`/api/images/${type}/${selectedFile}`} alt="Preview" className="max-w-full max-h-[60vh] rounded-lg shadow-2xl" />
                        </div>
                        <div className="p-6 border-t border-white/10 bg-white/5 space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="flex-1 glass-input px-3 py-2 rounded-lg"
                                />
                                <button onClick={handleRename} className="px-4 py-2 bg-purple-600/80 hover:bg-purple-500 rounded-lg text-white flex items-center gap-2">
                                    <FaEdit /> Rename
                                </button>
                            </div>
                            <div className="flex justify-between">
                                <a href={`/api/images/${type}/${selectedFile}`} download className="px-4 py-2 bg-green-600/80 hover:bg-green-500 rounded-lg text-white flex items-center gap-2">
                                    <FaDownload /> Download
                                </a>
                                <button onClick={handleDelete} className="px-4 py-2 bg-red-600/80 hover:bg-red-500 rounded-lg text-white flex items-center gap-2">
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
