"use client";

import { useColorPicker } from '@/contexts/ColorPickerContext';

interface ColorInputProps {
    label: string;
    description?: string;
    value: string;
    onChange: (color: string) => void;
}

export function ColorInput({ label, description, value, onChange }: ColorInputProps) {
    const { openPicker } = useColorPicker();

    return (
        <div className="glass-card p-6 rounded-xl flex items-center justify-between group">
            <div className="flex-1">
                <h3 className="font-semibold text-gray-200">{label}</h3>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                <div className="mt-2 text-xs font-mono text-cyan-200 bg-black/40 border border-white/10 inline-block px-2 py-1 rounded">
                    {value}
                </div>
            </div>

            <div className="ml-6 relative">
                <div
                    className="w-12 h-12 rounded-lg border border-white/20 cursor-pointer shadow-lg relative overflow-hidden"
                    style={{ backgroundColor: value }}
                    onClick={() => openPicker(label, value, onChange)}
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </div>
    );
}
