import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type Field = {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'image' | 'slides';
};

type PageMeta = {
    slug: string;
    title: string;
};

type BannerSlide = {
    brand: string;
    title: string;
    text: string;
    image: string;
    image_file?: File | null;
    primary: string;
    primary_url: string;
    secondary: string;
    secondary_url: string;
};

type FormData = Record<string, string | File | null | BannerSlide[]>;

const emptySlide = (): BannerSlide => ({
    brand: 'BabuBazer',
    title: '',
    text: '',
    image: '',
    primary: 'Shop now',
    primary_url: '/shop',
    secondary: '',
    secondary_url: '/shop',
});

const textValue = (value: FormData[string] | undefined): string =>
    typeof value === 'string' ? value : '';

export default function AdminPagesEdit({
    page,
    pages,
    fields,
}: {
    page: {
        slug: string;
        title: string;
        content: Record<string, string | BannerSlide[]>;
    };
    pages: PageMeta[];
    fields: Field[];
}) {
    const form = useForm<FormData>({ ...page.content });
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const slides = Array.isArray(form.data.banner_slides)
        ? form.data.banner_slides
        : [];

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
            if (field.type === 'slides') {
                payload[field.key] = Array.isArray(value) ? value : [];
                return;
            }
            if (field.type === 'image') {
                if (value instanceof File) {
                    payload[field.key] = value;
                }
                return;
            }
            payload[field.key] = textValue(value);
        });

        form.transform(() => ({ ...payload, _method: 'put' }));
        form.post(`/admin/pages/${page.slug}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout
            title="Pages"
            backHref="/admin"
            backLabel="Back to overview"
        >
            <Head title={`Admin · ${page.title}`} />

            <p className="mb-5 text-sm text-ink-soft">
                Edit static text and images for Home, About, Contact and Footer.
                Homepage banners can be added, reordered, and removed here.
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
                                field.type === 'image' ||
                                field.type === 'slides'
                                    ? 'sm:col-span-2'
                                    : ''
                            }`}
                        >
                            <span className="font-medium text-ink">
                                {field.label}
                            </span>

                            {field.type === 'slides' ? (
                                <div className="space-y-4">
                                    <p className="text-xs text-ink-soft">
                                        Add up to 6 banners. Upload an image for
                                        each slide, edit its text and links, and
                                        use the arrows to change display order.
                                    </p>
                                    {slides.map((slide, index) => {
                                        const preview =
                                            previews[`banner-${index}`] ||
                                            slide.image;
                                        const updateSlide = (
                                            key: keyof BannerSlide,
                                            value: string | File | null,
                                        ) => {
                                            const next = slides.map(
                                                (item, itemIndex) =>
                                                    itemIndex === index
                                                        ? {
                                                              ...item,
                                                              [key]: value,
                                                          }
                                                        : item,
                                            );
                                            form.setData('banner_slides', next);
                                        };

                                        return (
                                            <section
                                                key={`banner-${index}`}
                                                className="rounded-2xl border border-line p-4"
                                            >
                                                <div className="mb-4 flex items-center justify-between">
                                                    <h3 className="font-semibold text-ink">
                                                        Banner {index + 1}
                                                    </h3>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            aria-label={`Move banner ${index + 1} up`}
                                                            disabled={
                                                                index === 0
                                                            }
                                                            onClick={() => {
                                                                const next = [
                                                                    ...slides,
                                                                ];
                                                                [
                                                                    next[
                                                                        index -
                                                                            1
                                                                    ],
                                                                    next[index],
                                                                ] = [
                                                                    next[index],
                                                                    next[
                                                                        index -
                                                                            1
                                                                    ],
                                                                ];
                                                                form.setData(
                                                                    'banner_slides',
                                                                    next,
                                                                );
                                                            }}
                                                            className="rounded-lg p-2 text-ink-soft hover:bg-mist disabled:opacity-30"
                                                        >
                                                            <ArrowUp className="size-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            aria-label={`Move banner ${index + 1} down`}
                                                            disabled={
                                                                index ===
                                                                slides.length -
                                                                    1
                                                            }
                                                            onClick={() => {
                                                                const next = [
                                                                    ...slides,
                                                                ];
                                                                [
                                                                    next[index],
                                                                    next[
                                                                        index +
                                                                            1
                                                                    ],
                                                                ] = [
                                                                    next[
                                                                        index +
                                                                            1
                                                                    ],
                                                                    next[index],
                                                                ];
                                                                form.setData(
                                                                    'banner_slides',
                                                                    next,
                                                                );
                                                            }}
                                                            className="rounded-lg p-2 text-ink-soft hover:bg-mist disabled:opacity-30"
                                                        >
                                                            <ArrowDown className="size-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            aria-label={`Delete banner ${index + 1}`}
                                                            disabled={
                                                                slides.length <=
                                                                1
                                                            }
                                                            onClick={() => {
                                                                form.setData(
                                                                    'banner_slides',
                                                                    slides.filter(
                                                                        (
                                                                            _,
                                                                            itemIndex,
                                                                        ) =>
                                                                            itemIndex !==
                                                                            index,
                                                                    ),
                                                                );
                                                                setPreviews(
                                                                    (
                                                                        current,
                                                                    ) => {
                                                                        const next =
                                                                            {
                                                                                ...current,
                                                                            };
                                                                        delete next[
                                                                            `banner-${index}`
                                                                        ];
                                                                        return next;
                                                                    },
                                                                );
                                                            }}
                                                            className="rounded-lg p-2 text-coral hover:bg-coral/10 disabled:opacity-30"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {preview && (
                                                    <img
                                                        src={preview}
                                                        alt={`Banner ${index + 1} preview`}
                                                        className="mb-3 h-40 w-full rounded-xl object-cover"
                                                    />
                                                )}
                                                <label className="mb-4 block space-y-1.5">
                                                    <span>Banner image</span>
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        onChange={(event) => {
                                                            const file =
                                                                event.target
                                                                    .files?.[0] ??
                                                                null;
                                                            if (!file) return;
                                                            if (
                                                                file.size >
                                                                1024 * 1024
                                                            ) {
                                                                form.setError(
                                                                    `banner_slides.${index}.image`,
                                                                    'Image must be 1MB or smaller',
                                                                );
                                                                return;
                                                            }
                                                            form.clearErrors(
                                                                `banner_slides.${index}.image`,
                                                            );
                                                            updateSlide(
                                                                'image_file',
                                                                file,
                                                            );
                                                            setPreviews(
                                                                (current) => ({
                                                                    ...current,
                                                                    [`banner-${index}`]:
                                                                        URL.createObjectURL(
                                                                            file,
                                                                        ),
                                                                }),
                                                            );
                                                        }}
                                                        className={fieldClass}
                                                    />
                                                </label>

                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {(
                                                        [
                                                            ['brand', 'Brand'],
                                                            ['title', 'Title'],
                                                            [
                                                                'primary',
                                                                'Primary button',
                                                            ],
                                                            [
                                                                'primary_url',
                                                                'Primary button URL',
                                                            ],
                                                            [
                                                                'secondary',
                                                                'Secondary button',
                                                            ],
                                                            [
                                                                'secondary_url',
                                                                'Secondary button URL',
                                                            ],
                                                        ] as const
                                                    ).map(([key, label]) => (
                                                        <label
                                                            key={key}
                                                            className="space-y-1.5"
                                                        >
                                                            <span>{label}</span>
                                                            <input
                                                                required={
                                                                    key ===
                                                                    'title'
                                                                }
                                                                value={
                                                                    slide[key]
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateSlide(
                                                                        key,
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                className={
                                                                    fieldClass
                                                                }
                                                            />
                                                        </label>
                                                    ))}
                                                </div>
                                                <label className="mt-3 block space-y-1.5">
                                                    <span>Description</span>
                                                    <textarea
                                                        rows={3}
                                                        value={slide.text}
                                                        onChange={(event) =>
                                                            updateSlide(
                                                                'text',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className={`${fieldClass} resize-y`}
                                                    />
                                                </label>
                                                {form.errors[
                                                    `banner_slides.${index}.image`
                                                ] && (
                                                    <p className="mt-2 text-xs text-coral-deep">
                                                        {
                                                            form.errors[
                                                                `banner_slides.${index}.image`
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </section>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        disabled={slides.length >= 6}
                                        onClick={() =>
                                            form.setData('banner_slides', [
                                                ...slides,
                                                emptySlide(),
                                            ])
                                        }
                                        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-leaf hover:text-leaf-deep disabled:opacity-40"
                                    >
                                        <Plus className="size-4" />
                                        Add banner
                                    </button>
                                    {form.errors.banner_slides && (
                                        <p className="text-xs text-coral-deep">
                                            {form.errors.banner_slides}
                                        </p>
                                    )}
                                </div>
                            ) : field.type === 'image' ? (
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
                                    value={textValue(form.data[field.key])}
                                    onChange={(e) =>
                                        form.setData(field.key, e.target.value)
                                    }
                                    className={`${fieldClass} resize-y`}
                                />
                            ) : (
                                <input
                                    value={textValue(form.data[field.key])}
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
