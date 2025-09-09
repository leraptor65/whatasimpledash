"use client";

import { useState, useEffect } from 'react';
import { FaTrash, FaUpload, FaDownload, FaEdit } from 'react-icons/fa';
import type { DashboardConfig } from '@/types';

type FileManagerProps = {
    type: 'backgrounds' | 'icons';
    onConfigUpdate: (newConfig: DashboardConfig) => void;
};

export const FileManager = ({ type, onConfigUpdate }: FileManagerProps) => {
    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [newName, setNewName] = useState("");

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
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`/api/files/${type}`, { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
            fetchFiles();
            if (data.config) {
                onConfigUpdate(data.config);
            }
            alert(`${file.name} uploaded successfully!`);
        } else {
            alert(`Error: ${data.error}`);
        }
    };

    const handleDelete = async () => {
        if (!selectedFile) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedFile}? This cannot be undone.`)) return;

        const res = await fetch(`/api/files/${type}/${selectedFile}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            fetchFiles();
            setSelectedFile(null);
            if (data.config) {
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
            if (data.config) {
                onConfigUpdate(data.config);
            }
        } else {
            alert(`Error: ${data.error}`);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold capitalize">{type}</h3>
                <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-md text-sm cursor-pointer">
                    <FaUpload /> Upload
                    <input
                        type="file"
                        className="hidden"
                        accept={type === 'backgrounds' ? 'image/png, image/jpeg' : 'image/png, image/svg+xml'}
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                handleFileChange(e.target.files[0]);
                            }
                            e.target.value = '';
                        }}
                    />
                </label>
            </div>
            <ul className={`space-y-2 ${files.length > 10 ? 'max-h-60 overflow-y-auto' : ''}`}>
                {files.map(file => (
                    <li key={file} onClick={() => { setSelectedFile(file); setNewName(file); }} className="cursor-pointer flex justify-between items-center bg-gray-800 p-2 rounded-md hover:bg-gray-700">
                        <span className="text-sm">{file}</span>
                    </li>
                ))}
            </ul>

            {selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 break-all">{selectedFile}</h3>
                        <div className="mb-4 max-h-64 overflow-auto">
                            <img src={`/api/images/${type}/${selectedFile}`} alt="Preview" className="max-w-full h-auto mx-auto" />
                        </div>
                        <div className="flex gap-2 mb-4">
                            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3"/>
                            <button onClick={handleRename} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-md text-sm">
                                <FaEdit /> Rename
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <a href={`/api/images/${type}/${selectedFile}`} download className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md text-sm">
                                <FaDownload /> Download
                            </a>
                            <button onClick={handleDelete} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md text-sm">
                                <FaTrash /> Delete
                            </button>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="w-full mt-4 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md text-sm">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};