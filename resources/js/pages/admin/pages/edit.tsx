import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type Field = {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'image';
};

type PageMeta = {
    slug: string;
    title: string;
};

type FormData = Record<string, string | File | null>;

export default function AdminPagesEdit({
    page,
    pages,
    fields,
}: {
    page: {
        slug: string;
        title: string;
        content: Record<string, string>;
    };
    pages: PageMeta[];
    fields: Field[];
}) {
    const form = useForm<FormData>({ ...page.content });
    const [previews, setPreviews] = useState<Record<string, string>>({});

    useEffect(() => {
        form.setData({ ...page.content });
        setPreviews({});
        // Reset when switching page tabs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page.slug, page.content]);

    const fieldClass =
        'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-leaf';

    const shownImage = (key: string) => {
        if (previews[key]) {
            return previews[key];
        }
        const value = form.data[key];
        return typeof value === 'string' && value ? value : null;
    };

    const onImageChange = (key: string, file: File | null) => {
        if (!file) {
            form.setData(key, null);
            setPreviews((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
            form.clearErrors(key);
            return;
        }

        if (file.size > 1024 * 1024) {
            form.setError(key, 'Image must be 1MB or smaller');
            return;
        }

        form.clearErrors(key);
        form.setData(key, file);
        setPreviews((prev) => ({
            ...prev,
            [key]: URL.createObjectURL(file),
        }));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const payload: FormData = {};
        fields.forEach((field) => {
            const value = form.data[field.key];
            if (field.type === 'image') {
                if (value instanceof File) {
                    payload[field.key] = value;
                }
                return;
            }
            payload[field.key] =
                typeof value === 'string' ? value : String(value ?? '');
        });

        form.transform(() => ({ ...payload, _method: 'put' }));
        form.post(`/admin/pages/${page.slug}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title="Pages" backHref="/admin" backLabel="Back to overview">
            <Head title={`Admin · ${page.title}`} />

            <p className="mb-5 text-sm text-ink-soft">
                Edit static text and images for Home, About, Contact and Footer.
                Images max 1MB (jpg, png, webp).
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
                {pages.map((item) => {
                    const active = item.slug === page.slug;
                    return (
                        <Link
                            key={item.slug}
                            href={`/admin/pages?page=${item.slug}`}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                active
                                    ? 'bg-ink text-white'
                                    : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'
                            }`}
                        >
                            {item.title}
                        </Link>
                    );
                })}
            </div>

            <form
                onSubmit={submit}
                className="overflow-hidden rounded-[1.5rem] border border-line bg-white"
            >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-gradient-to-r from-ink to-leaf px-5 py-4 text-white">
                    <h2 className="font-display text-2xl">{page.title} page</h2>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral-deep disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        Save changes
                    </button>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2">
                    {fields.map((field) => (
                        <div
                            key={field.key}
                            className={`block space-y-1.5 text-sm ${
                                field.type === 'textarea' ||
                                field.type === 'image'
                                    ? 'sm:col-span-2'
                                    : ''
                            }`}
                        >
                            <span className="font-medium text-ink">
                                {field.label}
                            </span>

                            {field.type === 'image' ? (
                                <div className="space-y-3">
                                    {shownImage(field.key) && (
                                        <img
                                            src={shownImage(field.key) || ''}
                                            alt={field.label}
                                            className="h-40 w-full max-w-md rounded-2xl object-cover ring-1 ring-line"
                                        />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) =>
                                            onImageChange(
                                                field.key,
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                        className={fieldClass}
                                    />
                                    <p className="text-xs text-ink-soft">
                                        Upload a new image to replace the
                                        current one. Max 1MB.
                                    </p>
                                </div>
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    rows={4}
                                    value={String(form.data[field.key] ?? '')}
                                    onChange={(e) =>
                                        form.setData(field.key, e.target.value)
                                    }
                                    className={`${fieldClass} resize-y`}
                                />
                            ) : (
                                <input
                                    value={String(form.data[field.key] ?? '')}
                                    onChange={(e) =>
                                        form.setData(field.key, e.target.value)
                                    }
                                    className={fieldClass}
                                />
                            )}

                            {form.errors[field.key] && (
                                <span className="text-xs text-coral-deep">
                                    {form.errors[field.key]}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </form>
        </AdminLayout>
    );
}
