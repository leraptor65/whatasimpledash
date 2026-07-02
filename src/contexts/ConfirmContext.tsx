"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => close(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#161616] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-150"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {options.danger && (
                  <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                    <FaExclamationTriangle className="text-red-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {options.title && (
                    <h3 className="text-lg font-bold text-white mb-1">{options.title}</h3>
                  )}
                  <p className="text-sm text-white/70 whitespace-pre-line break-words">{options.message}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-white/5 border-t border-white/10">
              <button
                onClick={() => close(false)}
                className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {options.cancelLabel || 'Cancel'}
              </button>
              <button
                autoFocus
                onClick={() => close(true)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                  options.danger
                    ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                    : 'bg-white/15 border border-white/20 text-white hover:bg-white/25'
                }`}
              >
                {options.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
