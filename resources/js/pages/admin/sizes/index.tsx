import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type SizeItem = {
    id: number;
    name: string;
    is_active: boolean;
};

export default function AdminSizes({ sizes }: { sizes: SizeItem[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const form = useForm({
        name: '',
        is_active: true,
    });

    const fieldClass =
        'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-leaf';

    const reset = () => {
        setEditingId(null);
        form.setData({ name: '', is_active: true });
        form.clearErrors();
    };

    const startEdit = (item: SizeItem) => {
        setEditingId(item.id);
        form.setData({
            name: item.name,
            is_active: item.is_active,
        });
        form.clearErrors();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editingId) {
            form.put(`/admin/sizes/${editingId}`, {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
            return;
        }
        form.post('/admin/sizes', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AdminLayout
            title="Sizes"
            backHref={editingId ? '/admin/sizes' : undefined}
            backLabel="Back to sizes"
        >
            <Head title="Admin Sizes" />

            <p className="mb-5 text-sm text-ink-soft">
                Create reusable sizes like 0-3M, S, M, L. Use them on products.
            </p>

            <form
                onSubmit={submit}
                className="mb-6 overflow-hidden rounded-[1.5rem] border border-line bg-white"
            >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-gradient-to-r from-ink to-leaf px-5 py-4 text-white">
                    <h2 className="font-display text-2xl">
                        {editingId ? 'Modify size' : 'Add size'}
                    </h2>
                    {editingId && (
                        <button
                            type="button"
                            onClick={reset}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-sm"
                        >
                            <X className="h-3.5 w-3.5" />
                            Back
                        </button>
                    )}
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                    <label className="block space-y-1.5 text-sm">
                        <span className="font-medium text-ink">Name</span>
                        <input
                            required
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="e.g. 0-3M / S / M / L"
                            className={fieldClass}
                        />
                    </label>
                    <label className="flex items-center gap-2 pb-3 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.is_active}
                            onChange={(e) =>
                                form.setData('is_active', e.target.checked)
                            }
                            className="accent-leaf"
                        />
                        Active
                    </label>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-leaf-deep disabled:opacity-50"
                    >
                        {editingId ? (
                            <Save className="h-4 w-4" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        {editingId ? 'Save' : 'Add size'}
                    </button>
                </div>
                {form.errors.name && (
                    <p className="px-5 pb-4 text-sm text-coral">
                        {form.errors.name}
                    </p>
                )}
            </form>

            <div className="overflow-hidden rounded-[1.35rem] border border-line bg-white">
                <div className="flex flex-wrap gap-2 p-5">
                    {sizes.length === 0 && (
                        <p className="w-full py-6 text-center text-sm text-ink-soft">
                            No sizes yet. Add your first size above.
                        </p>
                    )}
                    {sizes.map((size) => (
                        <div
                            key={size.id}
                            className="inline-flex items-center gap-2 rounded-full border border-line bg-mist px-3 py-2"
                        >
                            <span className="font-medium text-ink">
                                {size.name}
                            </span>
                            {!size.is_active && (
                                <span className="text-[10px] text-ink-soft uppercase">
                                    off
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => startEdit(size)}
                                className="rounded-full p-1 text-leaf-deep hover:bg-leaf/10"
                                title="Modify"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Remove this size?')) {
                                        router.delete(
                                            `/admin/sizes/${size.id}`,
                                        );
                                    }
                                }}
                                className="rounded-full p-1 text-coral hover:bg-coral/10"
                                title="Remove"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
