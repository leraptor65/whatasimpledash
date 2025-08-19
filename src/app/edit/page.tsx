"use client";

import { useState, useEffect, type KeyboardEvent } from 'react';
import Link from 'next/link';

export default function EditPage() {
  const [configText, setConfigText] = useState('');
  const [status, setStatus] = useState<'loading' | 'saved' | 'saving' | 'error' | 'ready'>('loading');

  // Fetch the raw config file content when the page loads
  useEffect(() => {
    fetch('/api/config/raw')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch config');
        return res.text();
      })
      .then(text => {
        setConfigText(text);
        setStatus('ready');
      })
      .catch(err => {
        console.error(err);
        setConfigText("# Could not load config/services.yml.\n# Please check file permissions or server logs.");
        setStatus('error');
      });
  }, []);

  const handleSave = async () => {
    setStatus('saving');
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/yaml' },
        body: configText,
      });

      if (response.ok) {
        setStatus('saved');
        setTimeout(() => setStatus('ready'), 2000); // Reset status after 2 seconds
      } else {
        setStatus('error');
        const errorData = await response.json();
        alert(`Error saving: ${errorData.message}`);
      }
    } catch (error) {
      setStatus('error');
      alert('An unexpected error occurred.');
    }
  };

  // This new function handles the Tab key press
  const handleTabKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault(); // Prevent focus from changing

      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;

      // Set textarea value to: text before caret + two spaces + text after caret
      e.currentTarget.value = e.currentTarget.value.substring(0, start) +
        "  " + e.currentTarget.value.substring(end);

      // Put caret at right position again
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
      
      // Also update the React state
      setConfigText(e.currentTarget.value);
    }
  };

  return (
    <main className="min-h-screen w-full p-4 md:p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Configuration</h1>
          <Link href="/" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>

        <p className="text-gray-400 mb-4">
          Edit the YAML configuration for your dashboard below. Changes will be saved to your `services.yml` file.
        </p>

        <textarea
          className="w-full h-[60vh] p-4 font-mono bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={configText}
          onChange={(e) => setConfigText(e.target.value)}
          onKeyDown={handleTabKey} // Add the keydown event handler here
          spellCheck="false"
        />

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={status === 'saving' || status === 'loading'}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-500 text-white font-bold px-6 py-2 rounded-lg transition-colors"
          >
            {status === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
          {status === 'saved' && <span className="text-green-400">Configuration saved!</span>}
          {status === 'error' && <span className="text-red-400">Failed to save. Check YAML syntax.</span>}
        </div>
      </div>
    </main>
  );
}
