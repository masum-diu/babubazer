import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type ColorItem = {
    id: number;
    name: string;
    hex: string;
    is_active: boolean;
};

export default function AdminColors({ colors }: { colors: ColorItem[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const form = useForm({
        name: '',
        hex: '#7eb6d9',
        is_active: true,
    });

    const fieldClass =
        'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-leaf';

    const reset = () => {
        setEditingId(null);
        form.setData({ name: '', hex: '#7eb6d9', is_active: true });
        form.clearErrors();
    };

    const startEdit = (item: ColorItem) => {
        setEditingId(item.id);
        form.setData({
            name: item.name,
            hex: item.hex || '#cccccc',
            is_active: item.is_active,
        });
        form.clearErrors();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editingId) {
            form.put(`/admin/colors/${editingId}`, {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
            return;
        }
        form.post('/admin/colors', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AdminLayout
            title="Colors"
            backHref={editingId ? '/admin/colors' : undefined}
            backLabel="Back to colors"
        >
            <Head title="Admin Colors" />

            <p className="mb-5 text-sm text-ink-soft">
                Create reusable colors. Use them when adding products.
            </p>

            <form
                onSubmit={submit}
                className="mb-6 overflow-hidden rounded-[1.5rem] border border-line bg-white"
            >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-gradient-to-r from-ink to-leaf px-5 py-4 text-white">
                    <h2 className="font-display text-2xl">
                        {editingId ? 'Modify color' : 'Add color'}
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

                <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                    <label className="block space-y-1.5 text-sm">
                        <span className="font-medium text-ink">Name</span>
                        <input
                            required
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="e.g. Sky Blue"
                            className={fieldClass}
                        />
                    </label>
                    <label className="block space-y-1.5 text-sm">
                        <span className="font-medium text-ink">Hex</span>
                        <input
                            type="color"
                            value={form.data.hex}
                            onChange={(e) =>
                                form.setData('hex', e.target.value)
                            }
                            className="h-[3.05rem] w-16 rounded-2xl border border-line bg-white p-1"
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
                        {editingId ? 'Save' : 'Add color'}
                    </button>
                </div>
                {form.errors.name && (
                    <p className="px-5 pb-4 text-sm text-coral">
                        {form.errors.name}
                    </p>
                )}
            </form>

            <div className="overflow-hidden rounded-[1.35rem] border border-line bg-white">
                <div className="divide-y divide-line">
                    {colors.length === 0 && (
                        <p className="px-5 py-10 text-center text-sm text-ink-soft">
                            No colors yet. Add your first color above.
                        </p>
                    )}
                    {colors.map((color) => (
                        <div
                            key={color.id}
                            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className="h-10 w-10 rounded-full border border-line shadow-inner"
                                    style={{ backgroundColor: color.hex }}
                                />
                                <div>
                                    <p className="font-medium text-ink">
                                        {color.name}
                                        {!color.is_active && (
                                            <span className="ml-2 text-xs text-ink-soft">
                                                inactive
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs uppercase text-ink-soft">
                                        {color.hex}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => startEdit(color)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-foam px-3 py-1.5 text-sm text-leaf-deep hover:bg-leaf hover:text-white"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Modify
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('Remove this color?')) {
                                            router.delete(
                                                `/admin/colors/${color.id}`,
                                            );
                                        }
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-coral hover:bg-coral/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
