import { Head, useForm } from '@inertiajs/react';
import { Check, Copy, Images, Upload } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type MediaItem = {
    name: string;
    url: string;
    size: number;
};

export default function MediaLibrary({ media }: { media: MediaItem[] }) {
    const form = useForm<{ images: File[] }>({ images: [] });
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [copyError, setCopyError] = useState<string | null>(null);

    const copyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopyError(null);
            setCopiedUrl(url);
            window.setTimeout(() => setCopiedUrl(null), 2000);
        } catch {
            setCopyError('Could not copy the URL. Please copy it manually.');
        }
    };

    return (
        <AdminLayout title="Media library">
            <Head title="Admin · Media library" />

            <section className="mb-6 rounded-3xl border border-line bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <span className="rounded-2xl bg-foam p-3 text-leaf-deep">
                        <Upload className="size-5" />
                    </span>
                    <div>
                        <h2 className="font-display text-2xl text-ink">
                            Upload product images
                        </h2>
                        <p className="mt-1 text-sm text-ink-soft">
                            Upload up to 20 JPG, PNG, or WebP images at once.
                            Each image can be up to 5 MB.
                        </p>
                    </div>
                </div>

                <form
                    className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post('/admin/media', {
                            forceFormData: true,
                            onSuccess: () => form.reset('images'),
                        });
                    }}
                >
                    <input
                        required
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) =>
                            form.setData(
                                'images',
                                Array.from(event.target.files ?? []),
                            )
                        }
                        className="min-w-0 flex-1 rounded-2xl border border-line bg-white px-4 py-3 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={
                            form.processing || form.data.images.length === 0
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-leaf px-5 py-3 text-sm font-semibold text-white hover:bg-leaf-deep disabled:opacity-50"
                    >
                        <Upload className="size-4" />
                        {form.processing ? 'Uploading...' : 'Upload images'}
                    </button>
                </form>
                {form.errors.images && (
                    <p className="mt-2 text-sm text-coral-deep">
                        {form.errors.images}
                    </p>
                )}
                {Object.entries(form.errors)
                    .filter(([key]) => key.startsWith('images.'))
                    .map(([key, message]) => (
                        <p key={key} className="mt-2 text-sm text-coral-deep">
                            {message}
                        </p>
                    ))}
            </section>

            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="font-display text-2xl text-white">
                        Uploaded media
                    </h2>
                    <p className="text-sm text-white/60">
                        Copy an image URL and paste it into your product CSV.
                    </p>
                </div>
                {copyError && (
                    <p role="alert" className="mb-4 text-sm text-coral-deep">
                        {copyError}
                    </p>
                )}
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/75">
                    {media.length} images
                </span>
            </div>

            {media.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/20 p-10 text-center text-white/65">
                    <Images className="mx-auto mb-3 size-8" />
                    No images uploaded yet.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {media.map((item) => (
                        <article
                            key={item.url}
                            className="overflow-hidden rounded-2xl border border-line bg-white"
                        >
                            <img
                                src={item.url}
                                alt={item.name}
                                className="aspect-[4/3] w-full object-cover"
                                loading="lazy"
                            />
                            <div className="space-y-3 p-3">
                                <div>
                                    <p
                                        className="truncate text-sm font-medium text-ink"
                                        title={item.name}
                                    >
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-ink-soft">
                                        {(item.size / 1024).toFixed(0)} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void copyUrl(item.url)}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foam px-4 py-2 text-sm font-medium text-leaf-deep hover:bg-leaf hover:text-white"
                                >
                                    {copiedUrl === item.url ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                    {copiedUrl === item.url
                                        ? 'Copied'
                                        : 'Copy image URL'}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
