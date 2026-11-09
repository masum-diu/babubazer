import { usePage } from '@inertiajs/react';

export function FlashBanner() {
    const { flash } = usePage().props as {
        flash?: { success?: string | null; error?: string | null };
    };

    if (!flash?.success && !flash?.error) {
        return null;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            {flash.success && (
                <div className="rounded-2xl border border-leaf/30 bg-leaf/10 px-4 py-3 text-sm text-leaf-deep">
                    {flash.success}
                </div>
            )}
            {flash.error && (
                <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral-deep">
                    {flash.error}
                </div>
            )}
        </div>
    );
}
