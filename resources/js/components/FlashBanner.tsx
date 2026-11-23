import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Flash = {
    success?: string | null;
    error?: string | null;
    info?: string | null;
};
type Toast = {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
};

const DURATION = 4500;

export function FlashBanner() {
    const flash = (usePage().props as { flash?: Flash }).flash;
    const [toasts, setToasts] = useState<Toast[]>([]);
    const nextId = useRef(0);
    const timers = useRef<number[]>([]);

    const dismiss = (id: number) =>
        setToasts((current) => current.filter((toast) => toast.id !== id));

    useEffect(() => {
        const incoming: Array<Omit<Toast, 'id'>> = [];
        if (flash?.success) {
            incoming.push({ type: 'success', message: flash.success });
        }
        if (flash?.error) {
            incoming.push({ type: 'error', message: flash.error });
        }
        if (flash?.info) {
            incoming.push({ type: 'info', message: flash.info });
        }
        if (incoming.length === 0) {
            return;
        }

        const added = incoming.map((toast) => ({
            ...toast,
            id: nextId.current++,
        }));
        setToasts((current) => [...current, ...added]);

        added.forEach((toast) => {
            timers.current.push(
                window.setTimeout(() => dismiss(toast.id), DURATION),
            );
        });
    }, [flash]);

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach((timer) => window.clearTimeout(timer));
    }, []);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div
            className="pointer-events-none fixed top-4 right-4 left-4 z-200 flex flex-col items-end gap-2 sm:left-auto sm:w-96 print:hidden"
            aria-live="polite"
        >
            {toasts.map((toast) => {
                const isError = toast.type === 'error';
                const isInfo = toast.type === 'info';
                const Icon = isError ? AlertCircle : isInfo ? Info : CheckCircle2;

                return (
                    <div
                        key={toast.id}
                        role={isError ? 'alert' : 'status'}
                        className={`toast-in pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-[0_18px_40px_-18px_rgba(36,50,74,0.45)] ${
                            isError
                                ? 'border-[#e0455b]/40'
                                : isInfo
                                  ? 'border-[#2f5fb3]/40'
                                  : 'border-leaf/40'
                        }`}
                    >
                        <Icon
                            className={`mt-0.5 size-5 shrink-0 ${
                                isError
                                    ? 'text-[#e0455b]'
                                    : isInfo
                                      ? 'text-[#2f5fb3]'
                                      : 'text-leaf-deep'
                            }`}
                        />
                        <p className="flex-1 text-sm font-medium text-ink">
                            {toast.message}
                        </p>
                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            aria-label="Dismiss"
                            className="shrink-0 text-ink-soft transition hover:text-ink"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
