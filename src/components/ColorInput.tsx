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
        <div className="flex items-center justify-between p-4 group transition-all duration-300 hover:bg-white/[0.03]">
            <div className="pr-4 w-2/3">
                <p className="text-sm font-medium text-white/90">{label}</p>
                {description && <p className="text-xs text-white/40 mt-0.5 font-light">{description}</p>}
            </div>

            <div className="flex items-center gap-3 justify-end w-1/3">
                <div className="hidden sm:block text-[10px] font-mono text-white/30 bg-white/5 border border-white/5 px-2 py-1 rounded-md tracking-tighter">
                    {value || 'none'}
                </div>
                <div
                    className="w-9 h-9 rounded-xl border border-white/10 cursor-pointer shadow-lg relative overflow-hidden flex-shrink-0 transition-transform active:scale-90"
                    style={{ backgroundColor: value || 'transparent' }}
                    onClick={() => openPicker(label, value, onChange)}
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {!value && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/20">None</div>}
                </div>
            </div>
        </div>
    );
}
