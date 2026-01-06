"use client";

import { useState } from 'react';
import { SketchPicker, ColorResult } from 'react-color';

interface ColorInputProps {
    label: string;
    description?: string;
    value: string;
    onChange: (color: string) => void;
}

export function ColorInput({ label, description, value, onChange }: ColorInputProps) {
    const [displayPicker, setDisplayPicker] = useState(false);

    const handleClick = () => {
        setDisplayPicker(!displayPicker);
    };

    const handleClose = () => {
        setDisplayPicker(false);
    };

    const handleChange = (color: ColorResult) => {
        // Use HEX if alpha is 1, otherwise RGBA
        if (color.rgb.a === 1) {
            onChange(color.hex);
        } else {
            onChange(`rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`);
        }
    };

    return (
        <div className={`glass-card p-6 rounded-xl flex items-center justify-between group ${displayPicker ? 'relative z-[50]' : ''}`}>
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
                    onClick={handleClick}
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {displayPicker && (
                    <div className="absolute top-14 right-0 z-[100]">
                        <div className="absolute z-50 mt-2">
                            <div className="fixed inset-0 z-40" onClick={() => setDisplayPicker(false)} />
                            <div className="absolute z-50 mt-2">
                                <div className="fixed inset-0 z-40" onClick={() => setDisplayPicker(false)} />
                                <div className="relative z-50">
                                    <SketchPicker
                                        color={value}
                                        onChange={handleChange}
                                        disableAlpha={false}
                                        presetColors={[]}
                                        styles={{
                                            default: {
                                                picker: {
                                                    background: '#18181b', // zinc-900
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    color: '#e4e4e7', // zinc-200
                                                    borderRadius: '12px',
                                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
                                                },
                                                controls: {
                                                    paddingBottom: '10px',
                                                },
                                                saturation: {
                                                    borderRadius: '12px 12px 0 0',
                                                },
                                                // @ts-ignore
                                                input: {
                                                    color: '#000000',
                                                }
                                            }
                                        } as any}
                                    />
                                    {/* Hack to hide HEX input if possible via adjacent css or just leave it since library limits */}
                                    <style jsx global>{`
                                        .sketch-picker > div:last-child > div:first-child > div:first-child {
                                             display: none !important;
                                        }
                                        .sketch-picker > div:last-child > div:first-child > div:nth-child(2) {
                                             flex: 4 !important; /* Expand RGBA fields to fill space */
                                        }
                                    `}</style>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
