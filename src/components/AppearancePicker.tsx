"use client";

import { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { FaSearch, FaChevronDown, FaCheck } from 'react-icons/fa';

export type PickerOption = {
  value: string;          // '' represents the inherit/default option
  label: string;
  hint?: string;          // small muted note shown on the right (license, description…)
  group?: string;         // optional section header
  style?: CSSProperties;  // e.g. font-family preview
};

type AppearancePickerProps = {
  label: string;
  value?: string;               // undefined => the '' (inherit) option
  options: PickerOption[];
  onChange: (value: string | undefined) => void;
  searchable?: boolean;
  /** Apply the selected option's style (e.g. font) to the trigger text. */
  previewSelected?: boolean;
};

type Pos = { left: number; top: number; width: number; maxHeight: number; openUp: boolean };

export function AppearancePicker({ label, value, options, onChange, searchable = false, previewSelected = false }: AppearancePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const selected = options.find(o => o.value === (value ?? '')) || options[0];

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()) || (o.group || '').toLowerCase().includes(search.toLowerCase()))
    : options;

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 6;
    const spaceBelow = window.innerHeight - r.bottom - gap;
    const spaceAbove = r.top - gap;
    const desired = 320;
    const openUp = spaceBelow < Math.min(desired, 220) && spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, Math.min(desired, openUp ? spaceAbove : spaceBelow));
    setPos({ left: r.left, top: openUp ? r.top - gap : r.bottom + gap, width: r.width, maxHeight, openUp });
  }, []);

  const open = () => { updatePosition(); setIsOpen(true); };
  const close = () => { setIsOpen(false); setSearch(''); };

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => updatePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [isOpen, updatePosition]);

  const pick = (v: string) => { onChange(v === '' ? undefined : v); close(); };

  let lastGroup: string | undefined;

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-400 mb-2">{label}</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : open())}
        className="w-full flex items-center justify-between gap-3 glass-input px-3 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-white/10 transition-colors"
      >
        <span className="truncate text-gray-200" style={previewSelected ? selected?.style : undefined}>
          {selected?.label}
        </span>
        <FaChevronDown className={`text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={12} />
      </button>

      {mounted && isOpen && pos && createPortal(
        <>
          <div className="fixed inset-0 z-[190]" onClick={close} />
          <div
            className="fixed z-[200] rounded-xl flex flex-col p-3 shadow-2xl border border-white/15 bg-[#181818]"
            style={{
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              ...(pos.openUp ? { bottom: window.innerHeight - pos.top } : { top: pos.top }),
            }}
          >
            {searchable && (
              <div className="relative mb-3 shrink-0">
                <FaSearch className="absolute left-3 top-2.5 text-gray-500" size={12} />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 pl-9 pr-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-white/20"
                  autoFocus
                />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center text-gray-500 py-6 text-sm bg-white/5 rounded-lg border border-white/5 border-dashed">
                No matches
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 overflow-y-auto pr-1 custom-scrollbar">
                {filtered.map(o => {
                  const showHeader = o.group && o.group !== lastGroup;
                  lastGroup = o.group;
                  const isSel = o.value === (value ?? '');
                  return (
                    <div key={o.value || '__inherit'}>
                      {showHeader && (
                        <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-gray-500">{o.group}</div>
                      )}
                      <button
                        type="button"
                        onClick={() => pick(o.value)}
                        title={o.hint || o.label}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-3 transition-colors border ${isSel ? 'bg-white/15 border-white/20' : 'border-transparent hover:bg-white/10'}`}
                      >
                        <span className="truncate text-sm text-gray-200" style={o.style}>{o.label}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          {o.hint && <span className="text-[10px] text-gray-500">{o.hint}</span>}
                          {isSel && <FaCheck className="text-white/70" size={10} />}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
