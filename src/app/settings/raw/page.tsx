"use client";

import { useEffect, useState } from 'react';
import { FaSave, FaCheck, FaExclamationCircle, FaCopy } from 'react-icons/fa';
import { dashboardConfigSchema } from '@/lib/schema';

export default function RawEditorPage() {
    const [configText, setConfigText] = useState('');
    const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error' | 'unsaved'>('loading');
    const [lastSavedText, setLastSavedText] = useState('');

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                import('js-yaml').then(yaml => {
                    const text = yaml.dump(data, { indent: 2, lineWidth: -1 });
                    setConfigText(text);
                    setLastSavedText(text);
                    setStatus('saved');
                });
            })
            .catch(() => setStatus('error'));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setConfigText(e.target.value);
        if (e.target.value !== lastSavedText) setStatus('unsaved');
        else setStatus('saved');
    };

    const handleSave = async () => {
        if (!window.confirm("Are you sure you want to save these raw changes? Invalid YAML will break the dashboard.")) {
            return;
        }

        setStatus('saving');
        try {
            // 1. Syntax Check (YAML)
            const yaml = await import('js-yaml');
            let newConfig: any;
            try {
                newConfig = yaml.load(configText);
            } catch (yamlErr: any) {
                alert(`YAML Syntax Error:\n${yamlErr.message}`);
                setStatus('error');
                return;
            }

            // 2. Schema Check (Zod)
            const validation = dashboardConfigSchema.safeParse(newConfig);
            if (!validation.success) {
                // Determine format of error to display
                const errorStr = validation.error.errors.map(e => `• ${e.path.join('.')}: ${e.message}`).join('\n');
                alert(`Configuration Validation Failed:\n\n${errorStr}`);
                setStatus('error');
                return;
            }

            // 3. Send to API
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });

            if (res.ok) {
                setStatus('saved');
                setLastSavedText(configText);
                alert("Settings saved successfully!");
            } else {
                const errData = await res.json();
                alert(`Server Error: ${errData.message}`);
                setStatus('error');
            }
        } catch (e: any) {
            alert('Unknown Error: ' + e.message);
            setStatus('error');
        }
    };

    // Copy to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(configText);
        alert('Copied to clipboard!');
    };

    if (status === 'loading') return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Raw Editor</h2>
                    <p className="text-gray-400">Advanced configuration via YAML. Validated on save.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCopy}
                        className="p-2 text-gray-400 hover:text-white"
                        title="Copy to Clipboard"
                    >
                        <FaCopy />
                    </button>
                    {status === 'unsaved' && <span className="text-yellow-500 flex items-center gap-2"><FaExclamationCircle /> Unsaved Changes</span>}
                    <button
                        onClick={handleSave}
                        className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg ${status === 'saving' ? 'bg-gray-600 cursor-wait' :
                            status === 'saved' ? 'bg-green-600 hover:bg-green-500 text-white' :
                                'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white hover:scale-105 shadow-cyan-500/20'
                            }`}
                        disabled={status === 'saving'}
                    >
                        {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : 'Save Changes'}
                        {status === 'saved' && <FaCheck />}
                        {status !== 'saved' && status !== 'saving' && <FaSave />}
                    </button>
                </div>
            </header>

            <div className="flex-1 glass-panel p-1 rounded-xl overflow-hidden relative">
                <textarea
                    value={configText}
                    onChange={handleChange}
                    className="w-full h-full bg-black/50 text-emerald-400 font-mono text-sm p-6 resize-none focus:outline-none custom-scrollbar"
                    spellCheck="false"
                    placeholder="# Edit your configuration here..."
                />
            </div>
        </div>
    );
}
