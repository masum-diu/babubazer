import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type CategoryItem = {
    id: number;
    parent_id?: number | null;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    sort_order: number;
    is_active: boolean;
    children?: CategoryItem[];
};

type FormState = {
    parent_id: number | '';
    name: string;
    description: string;
    image: File | null;
    is_active: boolean;
};

const emptyForm: FormState = {
    parent_id: '',
    name: '',
    description: '',
    image: null,
    is_active: true,
};

export default function AdminCategories({
    categories,
    parentOptions,
}: {
    categories: CategoryItem[];
    parentOptions: Array<{ id: number; name: string }>;
}) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const form = useForm<FormState>(emptyForm);

    const fieldClass =
        'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-leaf';

    const resetCreate = () => {
        setEditingId(null);
        setCurrentImage(null);
        setPreview(null);
        form.setData(emptyForm);
        form.clearErrors();
    };

    const startEdit = (item: CategoryItem) => {
        setEditingId(item.id);
        setCurrentImage(item.image || null);
        setPreview(null);
        form.setData({
            parent_id: item.parent_id ?? '',
            name: item.name,
            description: item.description || '',
            image: null,
            is_active: item.is_active ?? true,
        });
        form.clearErrors();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onImageChange = (file: File | null) => {
        if (!file) {
            form.setData('image', null);
            setPreview(null);
            return;
        }

        if (file.size > 1024 * 1024) {
            form.setError('image', 'Image must be 1MB or smaller');
            return;
        }

        form.clearErrors('image');
        form.setData('image', file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const payload: Record<string, unknown> = {
            parent_id:
                form.data.parent_id === '' ? null : Number(form.data.parent_id),
            name: form.data.name,
            description: form.data.description,
            is_active: form.data.is_active,
        };

        if (form.data.image) {
            payload.image = form.data.image;
        }

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => resetCreate(),
        };

        if (editingId) {
            form.transform(() => ({ ...payload, _method: 'put' }));
            form.post(`/admin/categories/${editingId}`, options);
            return;
        }

        form.transform(() => payload);
        form.post('/admin/categories', options);
    };

    const remove = (item: CategoryItem, kind: 'category' | 'subcategory') => {
        if (
            !confirm(
                kind === 'category'
                    ? 'Delete this category? Subcategories must be removed first.'
                    : 'Delete this subcategory?',
            )
        ) {
            return;
        }

        router.delete(`/admin/categories/${item.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (editingId === item.id) {
                    resetCreate();
                }
            },
        });
    };

    const isEditing = editingId !== null;
    const editingIsSub = isEditing && form.data.parent_id !== '';
    const shownImage = preview || currentImage;

    return (
        <AdminLayout
            title="Groups"
            backHref={isEditing ? '/admin/categories' : undefined}
            backLabel="Back to groups"
        >
            <Head title="Admin Groups" />

            <p className="mb-5 text-sm text-ink-soft">
                Create, modify, or remove categories and subcategories. Image
                upload max 1MB.
            </p>

            <form
                className="mb-6 overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-[0_18px_40px_-30px_rgba(18,50,58,0.35)]"
                onSubmit={submit}
                encType="multipart/form-data"
            >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-gradient-to-r from-ink to-leaf px-5 py-4 text-white">
                    <div>
                        <p className="text-[11px] tracking-[0.18em] text-white/55 uppercase">
                            Groups
                        </p>
                        <h2 className="font-display text-2xl">
                            {isEditing
                                ? editingIsSub
                                    ? 'Modify subcategory'
                                    : 'Modify category'
                                : 'Add category / subcategory'}
                        </h2>
                    </div>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={resetCreate}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back
                        </button>
                    )}
                </div>

                <div className="grid items-stretch gap-5 p-5 lg:grid-cols-2">
                    <div className="flex min-h-0 flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="flex flex-col gap-1.5 text-sm">
                                <span className="font-medium text-ink">
                                    Type
                                </span>
                                <select
                                    value={form.data.parent_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'parent_id',
                                            e.target.value === ''
                                                ? ''
                                                : Number(e.target.value),
                                        )
                                    }
                                    className={fieldClass}
                                    disabled={
                                        isEditing &&
                                        categories.some(
                                            (c) =>
                                                c.id === editingId &&
                                                (c.children?.length || 0) > 0,
                                        )
                                    }
                                >
                                    <option value="">Parent category</option>
                                    {parentOptions
                                        .filter(
                                            (parent) =>
                                                parent.id !== editingId,
                                        )
                                        .map((parent) => (
                                            <option
                                                key={parent.id}
                                                value={parent.id}
                                            >
                                                Sub of: {parent.name}
                                            </option>
                                        ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1.5 text-sm">
                                <span className="font-medium text-ink">
                                    Name
                                </span>
                                <input
                                    required
                                    placeholder="e.g. Baby Care"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    className={fieldClass}
                                />
                            </label>
                        </div>

                        <label className="flex min-h-0 flex-1 flex-col gap-1.5 text-sm">
                            <span className="font-medium text-ink">
                                Description
                            </span>
                            <textarea
                                rows={8}
                                placeholder="Write a clear description for this category..."
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                                className={`${fieldClass} min-h-44 flex-1 resize-y`}
                            />
                            <span className="text-xs text-ink-soft">
                                Shown on shop/category cards
                            </span>
                        </label>

                        <label className="flex flex-col gap-1.5 text-sm">
                            <span className="font-medium text-ink">Status</span>
                            <div className="flex h-[3.05rem] items-center gap-3 rounded-2xl border border-line bg-mist px-4">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(e) =>
                                        form.setData(
                                            'is_active',
                                            e.target.checked,
                                        )
                                    }
                                    className="accent-leaf"
                                />
                                <span className="text-sm text-ink">
                                    Active · visible in store
                                </span>
                            </div>
                            <span className="text-xs text-ink-soft">
                                Newest categories show first automatically
                            </span>
                        </label>
                    </div>

                    <div className="flex min-h-0 flex-col gap-4 rounded-[1.25rem] border border-line bg-mist/60 p-4">
                        <label className="flex flex-col gap-1.5 text-sm">
                            <span className="font-medium text-ink">Image</span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) =>
                                    onImageChange(e.target.files?.[0] || null)
                                }
                                className="w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-foam file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-leaf-deep"
                            />
                            <span className="text-xs text-ink-soft">
                                JPG, PNG, or WebP · max 1MB
                            </span>
                        </label>

                        <div className="min-h-44 flex-1 overflow-hidden rounded-2xl border border-line bg-white">
                            {shownImage ? (
                                <img
                                    src={shownImage}
                                    alt="Category preview"
                                    className="h-full min-h-44 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full min-h-44 items-center justify-center bg-foam/50 px-4 text-center text-sm text-ink-soft">
                                    Image preview will appear here
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
                    {form.errors.name && (
                        <p className="w-full text-sm text-coral">
                            {form.errors.name}
                        </p>
                    )}
                    {form.errors.parent_id && (
                        <p className="w-full text-sm text-coral">
                            {form.errors.parent_id}
                        </p>
                    )}
                    {form.errors.image && (
                        <p className="w-full text-sm text-coral">
                            {form.errors.image}
                        </p>
                    )}
                    {form.errors.description && (
                        <p className="w-full text-sm text-coral">
                            {form.errors.description}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-leaf-deep disabled:opacity-50"
                    >
                        {isEditing ? (
                            <Save className="h-4 w-4" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        {isEditing
                            ? 'Save changes'
                            : form.data.parent_id
                              ? 'Add subcategory'
                              : 'Add category'}
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="overflow-hidden rounded-[1.35rem] border border-line bg-white"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ink px-4 py-3 text-white">
                            <div className="flex min-w-0 items-center gap-3">
                                {category.image && (
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="h-12 w-12 rounded-xl object-cover"
                                    />
                                )}
                                <div>
                                    <p className="font-semibold">
                                        {category.name}
                                        {!category.is_active && (
                                            <span className="ml-2 text-xs text-white/50">
                                                inactive
                                            </span>
                                        )}
                                    </p>
                                    <p className="mt-0.5 text-xs tracking-wide text-white/55 uppercase">
                                        {category.slug} · parent
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
                                    onClick={() => startEdit(category)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Modify
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-coral hover:bg-coral/15"
                                    onClick={() => remove(category, 'category')}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remove
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-line">
                            {(category.children?.length || 0) === 0 && (
                                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                                    <p className="text-sm text-ink-soft">
                                        No subcategories yet
                                    </p>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5 rounded-full bg-foam px-3 py-1.5 text-sm font-medium text-leaf-deep"
                                        onClick={() => {
                                            resetCreate();
                                            form.setData(
                                                'parent_id',
                                                category.id,
                                            );
                                            window.scrollTo({
                                                top: 0,
                                                behavior: 'smooth',
                                            });
                                        }}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add subcategory
                                    </button>
                                </div>
                            )}

                            {category.children?.map((child) => (
                                <div
                                    key={child.id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3 pl-2">
                                        {child.image && (
                                            <img
                                                src={child.image}
                                                alt={child.name}
                                                className="h-10 w-10 rounded-lg object-cover"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium text-ink">
                                                {child.name}
                                                {!child.is_active && (
                                                    <span className="ml-2 text-xs text-ink-soft">
                                                        inactive
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs tracking-wide text-ink-soft uppercase">
                                                {child.slug} · subcategory
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-1.5 rounded-full bg-foam px-3 py-1.5 text-sm text-leaf-deep hover:bg-leaf hover:text-white"
                                            onClick={() => startEdit(child)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Modify
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-coral hover:bg-coral/10"
                                            onClick={() =>
                                                remove(child, 'subcategory')
                                            }
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
