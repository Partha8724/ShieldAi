"use client";
import { useState, useEffect, useCallback } from 'react';

type ToastVariant = 'success' | 'error' | 'info';
type ToastItem = { id: number; message: string; variant: ToastVariant };

let listeners: ((t: ToastItem) => void)[] = [];
let nextId = 0;

export function toast(message: string, variant: ToastVariant = 'info') {
  const item = { id: nextId++, message, variant };
  listeners.forEach(fn => fn(item));
}

const ACCENT_COLORS: Record<ToastVariant, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 4000;

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: ToastItem) => {
    setToasts(prev => {
      const next = [...prev, item];
      // Keep only the most recent MAX_TOASTS, remove oldest
      if (next.length > MAX_TOASTS) {
        return next.slice(next.length - MAX_TOASTS);
      }
      return next;
    });
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.push(addToast);
    return () => {
      listeners = listeners.filter(fn => fn !== addToast);
    };
  }, [addToast]);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map(t =>
      setTimeout(() => removeToast(t.id), AUTO_DISMISS_MS)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 shadow-2xl"
          style={{
            animation: 'toast-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${ACCENT_COLORS[t.variant]}`}
            aria-hidden="true"
          />
          <span className="text-sm text-white">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="ml-2 text-white/40 hover:text-white/80 transition-colors text-xs shrink-0"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Inline keyframes — rendered once */}
      <style jsx global>{`
        @keyframes toast-slide-in {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
