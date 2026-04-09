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
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closePicker} />
                    {/* Modal */}
                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl flex flex-col gap-5 w-[280px] animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center gap-1">
                            <h3 className="text-lg font-semibold tracking-tight text-white/90">{label}</h3>
                            <div className="h-1 w-12 bg-white/40 rounded-full" />
                        </div>

                        <div className="flex justify-center py-2">
                            <RgbaStringColorPicker color={color} onChange={handleColorChange} />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold ml-1">Color Value (HEX or RGBA)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-white/20 outline-none transition-all placeholder:text-white/20"
                                    placeholder="#000000"
                                />
                                <div
                                    className="w-11 h-11 rounded-xl border border-white/20 shadow-inner flex-shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={closePicker}
                            className="mt-2 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-xl font-bold tracking-wide transition-all active:scale-95 shadow-xl shadow-black/20"
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
