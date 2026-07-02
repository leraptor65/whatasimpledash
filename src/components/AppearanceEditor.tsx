"use client";

import { FaUndo } from 'react-icons/fa';
import type { CardAppearance } from '@/types';
import { LAYOUT_OPTIONS, TEXT_SIZE_OPTIONS, FONT_OPTIONS, fontStack, isEmptyAppearance } from '@/lib/appearance';
import { AppearancePicker, type PickerOption } from './AppearancePicker';

type AppearanceEditorProps = {
  value?: CardAppearance;
  onChange: (next: CardAppearance) => void;
  /** Word for the unset state — "Inherit" for group/service, "Default" for global. */
  inheritLabel?: string;
  /** Short note explaining where unset values come from. */
  inheritNote?: string;
};

export function AppearanceEditor({ value, onChange, inheritLabel = 'Inherit', inheritNote }: AppearanceEditorProps) {
  const v = value || {};

  const layoutOptions: PickerOption[] = [
    { value: '', label: inheritLabel },
    ...LAYOUT_OPTIONS.map(o => ({ value: o.value, label: o.label, hint: o.description })),
  ];

  const textSizeOptions: PickerOption[] = [
    { value: '', label: inheritLabel },
    ...TEXT_SIZE_OPTIONS.map(o => ({ value: o.value, label: o.label })),
  ];

  const fontOptions: PickerOption[] = [
    { value: '', label: inheritLabel },
    ...FONT_OPTIONS.map(f => ({
      value: f.key,
      label: f.label,
      hint: f.license === 'System' ? undefined : f.license,
      group: f.category,
      style: { fontFamily: fontStack(f.key) },
    })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-200">Card Appearance</h4>
          {inheritNote && <p className="text-xs text-gray-500 mt-0.5">{inheritNote}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange({})}
          disabled={isEmptyAppearance(value)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Clear overrides at this level"
        >
          <FaUndo size={10} /> Reset to default
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppearancePicker
          label="Layout"
          value={v.layout}
          options={layoutOptions}
          onChange={(val) => onChange({ ...v, layout: val as CardAppearance['layout'] })}
        />
        <AppearancePicker
          label="Text Size"
          value={v.textSize}
          options={textSizeOptions}
          onChange={(val) => onChange({ ...v, textSize: val as CardAppearance['textSize'] })}
        />
      </div>

      <AppearancePicker
        label="Font"
        value={v.fontFamily}
        options={fontOptions}
        onChange={(val) => onChange({ ...v, fontFamily: val })}
        searchable
        previewSelected
      />
      <p className="text-[11px] text-gray-500 -mt-2">All {FONT_OPTIONS.length - 1} bundled fonts are open-source (OFL / Apache-2.0), self-hosted at build time.</p>
    </div>
  );
}
