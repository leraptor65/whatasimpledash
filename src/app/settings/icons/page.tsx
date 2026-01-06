"use client";

import { useState, useEffect, useRef } from 'react';
import { FaTrash, FaUpload, FaSearch, FaExclamationCircle, FaCheck } from 'react-icons/fa';

export default function IconsPage() {
    const [icons, setIcons] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchIcons = async () => {
        try {
            const res = await fetch('/api/files/icons');
            const data = await res.json();
            if (data.success) {
                setIcons(data.files);
            }
        } catch (e) {
            console.error('Failed to fetch icons', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIcons();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/files/icons', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                await fetchIcons();
                alert('Icon uploaded successfully!');
            } else {
                alert('Upload failed');
            }
        } catch (e) {
            console.error(e);
            alert('Upload error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;

        try {
            const res = await fetch(`/api/files/icons/${encodeURIComponent(fileName)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setIcons(icons.filter(i => i !== fileName));
            } else {
                alert('Failed to delete icon');
            }
        } catch (e) {
            console.error(e);
            alert('Delete error');
        }
    };

    const filteredIcons = icons.filter(icon => icon.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="p-8">Loading icons...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Icon Management</h2>
                    <p className="text-gray-400">Upload and manage your custom icons.</p>
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                        accept=".svg,.png,.jpg,.jpeg,.webp"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                    >
                        {uploading ? 'Uploading...' : <><FaUpload /> Upload New Icon</>}
                    </button>
                </div>
            </header>

            <div className="glass-panel p-6 rounded-2xl">
                <div className="relative mb-6">
                    <FaSearch className="absolute left-4 top-3.5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search icons..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full glass-input pl-12 pr-4 py-3 rounded-xl"
                    />
                </div>

                {filteredIcons.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        {search ? 'No icons match your search.' : 'No icons found. Upload one to get started!'}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredIcons.map((icon, idx) => (
                            <div key={idx} className="glass-card p-4 rounded-xl flex flex-col items-center gap-3 relative group">
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <img src={`/icons/${icon}`} alt={icon} className="max-w-full max-h-full object-contain" />
                                </div>
                                <span className="text-xs text-gray-400 truncate w-full text-center" title={icon}>
                                    {icon}
                                </span>
                                <button
                                    onClick={() => handleDelete(icon)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-600 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                    title="Delete Icon"
                                >
                                    <FaTrash size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
