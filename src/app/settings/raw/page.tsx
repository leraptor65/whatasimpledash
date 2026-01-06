"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-dark.css';
import { FaSave, FaCheck, FaExclamationCircle, FaCopy } from 'react-icons/fa';
import { dashboardConfigSchema } from '@/lib/schema';

export default function RawEditorPage() {
    const [configText, setConfigText] = useState('');
    const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error' | 'unsaved' | 'idle'>('loading');
    const [lastSavedText, setLastSavedText] = useState('');

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                import('js-yaml').then(yaml => {
                    const text = yaml.dump(data, { indent: 2, lineWidth: -1 });
                    setConfigText(text);
                    setLastSavedText(text);
                    setStatus('idle');
                });
            })
            .catch(() => setStatus('error'));
    }, []);

    useEffect(() => {
        if (status === 'saved') {
            const timer = setTimeout(() => {
                setStatus('idle');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleChange = (newCode: string) => {
        setConfigText(newCode);
        if (newCode !== lastSavedText) setStatus('unsaved');
        else setStatus('idle');
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
                // alert("Settings saved successfully!"); // Removed to rely on button state
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
        // alert('Copied to clipboard!'); // Optional, maybe toast?
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
                                'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        disabled={status === 'saving'}
                    >
                        {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : 'Save Changes'}
                        {status === 'saved' && <FaCheck />}
                        {status !== 'saved' && status !== 'saving' && <FaSave />}
                    </button>
                </div>
            </header>

            <div className="flex-1 glass-panel p-1 rounded-xl overflow-hidden relative bg-black/50">
                <div className="absolute inset-0 overflow-auto custom-scrollbar">
                    <Editor
                        value={configText}
                        onValueChange={handleChange}
                        highlight={code => highlight(code, languages.yaml, 'yaml')}
                        padding={24}
                        className="font-mono text-sm"
                        style={{
                            fontFamily: '"Fira Code", "Fira Mono", monospace',
                            fontSize: 14,
                            backgroundColor: 'transparent',
                            minHeight: '100%',
                        }}
                        textareaClassName="focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
