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
                    <div className="relative bg-gray-900 border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 w-[260px] animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-center mb-2">{label}</h3>

                        <div className="flex justify-center">
                            <RgbaStringColorPicker color={color} onChange={handleColorChange} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-medium ml-1">Color Value (HEX or RGBA)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                                <div
                                    className="w-10 h-10 rounded-lg border border-white/10"
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={closePicker}
                            className="mt-2 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
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
