"use client";

import { GlassFileManager } from '@/components/GlassFileManager';

export default function BackgroundsPage() {
    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Backgrounds</h2>
                <p className="text-gray-400">Manage your dashboard's background images.</p>
            </header>

            <GlassFileManager type="backgrounds" />

            <div className="mt-8 glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4">Tips</h3>
                <ul className="list-disc list-inside text-gray-400 space-y-2 text-sm">
                    <li>Upload high-quality images (JPG, PNG, WebP).</li>
                    <li>Files are stored in <code>/public/backgrounds</code>.</li>
                    <li>You can set custom backgrounds for each service group in the Raw Editor.</li>
                </ul>
            </div>
        </div>
    );
}
