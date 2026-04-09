"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RgbaStringColorPicker } from 'react-colorful';

interface ColorPickerContextType {
    openPicker: (label: string, color: string, onChange: (color: string) => void) => void;
    closePicker: () => void;
}

const ColorPickerContext = createContext<ColorPickerContextType | undefined>(undefined);

export function ColorPickerProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('');
    // Use a ref-like approach for callback to avoid stale closures or state loop issues?
    // Actually, useState is fine if we update it on openPicker.
    const [onChangeCallback, setOnChangeCallback] = useState<(color: string) => void>(() => { });
    const [inputValue, setInputValue] = useState('');

    const openPicker = (lbl: string, clr: string, cb: (c: string) => void) => {
        setLabel(lbl);
        setColor(clr);
        setInputValue(clr);
        setOnChangeCallback(() => cb);
        setIsOpen(true);
    };

    const closePicker = () => setIsOpen(false);

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        setInputValue(newColor);
        onChangeCallback(newColor);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        setColor(val);
        onChangeCallback(val);
    };

    return (
        <ColorPickerContext.Provider value={{ openPicker, closePicker }}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-2xl" onClick={closePicker} />
                    {/* Modal */}
                    <div className="relative bg-[#111111] border border-white/10 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col gap-6 w-[320px] animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center gap-2">
                            <h3 className="text-xl font-bold tracking-tight text-white/95">{label}</h3>
                            <div className="h-1 w-8 bg-white/20 rounded-full" />
                        </div>

                        <div className="flex justify-center py-2 bg-white/[0.02] rounded-2xl border border-white/5 p-4">
                            <RgbaStringColorPicker color={color} onChange={handleColorChange} />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold ml-1">Color Value</label>
                            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    className="flex-1 bg-transparent px-2 py-1 text-sm font-mono focus:outline-none text-white/90 placeholder:text-white/20"
                                    placeholder="#000000"
                                />
                                <div
                                    className="w-8 h-8 rounded-lg border border-white/10 shadow-inner flex-shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={closePicker}
                            className="w-full py-4 bg-white text-black hover:bg-white/90 rounded-2xl font-bold tracking-wide transition-all active:scale-95 shadow-xl shadow-white/5"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </ColorPickerContext.Provider>
    );
}

export const useColorPicker = () => {
    const context = useContext(ColorPickerContext);
    if (!context) throw new Error('useColorPicker must be used within ColorPickerProvider');
    return context;
};
