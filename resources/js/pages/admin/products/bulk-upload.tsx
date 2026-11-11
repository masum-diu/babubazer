import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Upload,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

type PreviewRow = {
    line: number;
    name: string;
    category: string;
    price: string;
    stock: string;
    image_url: string;
    color: string;
    size: string;
    color_image_url: string;
    errors: string[];
};

type Preview = {
    rows: PreviewRow[];
    errors: string[];
    can_import: boolean;
    products_count: number;
};

export default function BulkProductUpload({
    categories,
    preview,
}: {
    categories: Array<{ id: number; name: string; slug: string }>;
    preview?: Preview;
}) {
    const form = useForm<{
        csv_file: File | null;
        action: 'preview' | 'import';
    }>({
        csv_file: null,
        action: 'preview',
    });

    const post = (action: 'preview' | 'import') => {
        form.transform((data) => ({ ...data, action }));
        form.post('/admin/products/import', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title="Bulk product upload">
            <Head title="Admin · Bulk product upload" />

            <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                <section className="h-fit rounded-3xl border border-line bg-white p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="rounded-2xl bg-foam p-3 text-leaf-deep">
                            <FileSpreadsheet className="size-5" />
                        </span>
                        <div>
                            <h2 className="font-display text-2xl text-ink">
                                Import products from CSV
                            </h2>
                            <p className="mt-1 text-sm text-ink-soft">
                                Upload, preview, then import up to 500 products.
                            </p>
                        </div>
                    </div>

                    <a
                        href="/admin/products/import/template"
                        className="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-leaf-deep hover:bg-foam"
                    >
                        <Download className="size-4" />
                        Download CSV template
                    </a>

                    <form
                        className="mt-5 space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            post('preview');
                        }}
                    >
                        <label className="block space-y-1.5 text-sm font-medium text-ink">
                            CSV file (max 5 MB)
                            <input
                                required
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(event) =>
                                    form.setData(
                                        'csv_file',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm"
                            />
                        </label>
                        {form.errors.csv_file && (
                            <p className="text-sm text-coral-deep">
                                {form.errors.csv_file}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={form.processing || !form.data.csv_file}
                            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-leaf-deep disabled:opacity-50"
                        >
                            <Upload className="size-4" />
                            {form.processing ? 'Checking...' : 'Preview CSV'}
                        </button>
                    </form>

                    <div className="mt-6 rounded-2xl bg-mist p-4">
                        <h3 className="text-sm font-semibold text-ink">
                            Required CSV columns
                        </h3>
                        <p className="mt-1 text-sm text-ink-soft">
                            name, category, price, stock
                        </p>
                        <h3 className="mt-4 text-sm font-semibold text-ink">
                            Optional columns
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                            description, brand, age_range, compare_at_price,
                            image_url, is_featured, is_active
                        </p>
                        <h3 className="mt-4 text-sm font-semibold text-ink">
                            Variant columns
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                            product_key, color, color_hex, size, variant_stock,
                            color_image_url
                        </p>
                        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                            Category accepts its slug or exact name. For
                            image_url, upload an image in the{' '}
                            <Link
                                href="/admin/media"
                                className="font-semibold text-leaf-deep underline"
                            >
                                Media Library
                            </Link>{' '}
                            and paste its copied URL into image_url or
                            color_image_url. Repeat one row per color/size
                            combination. Give those rows the same product_key;
                            color and size stock comes from variant_stock (stock
                            is also accepted as a fallback). The template has a
                            working example.
                        </p>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-sm font-semibold text-ink">
                            Available categories
                        </h3>
                        <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs text-ink-soft">
                            {categories.map((category) => (
                                <li key={category.id}>
                                    {category.name}{' '}
                                    <span className="text-ink/45">
                                        ({category.slug})
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="rounded-3xl border border-line bg-white p-5 sm:p-6">
                    <h2 className="font-display text-2xl text-ink">
                        CSV preview
                    </h2>
                    {!preview ? (
                        <p className="mt-3 text-sm text-ink-soft">
                            Choose a CSV file and preview it before importing.
                        </p>
                    ) : (
                        <>
                            {preview.errors.map((error) => (
                                <p
                                    key={error}
                                    className="mt-3 flex items-start gap-2 text-sm text-coral-deep"
                                >
                                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                    {error}
                                </p>
                            ))}
                            {preview.rows.length > 0 && (
                                <>
                                    <div className="my-4 flex items-center justify-between gap-3">
                                        <p className="text-sm text-ink-soft">
                                            {preview.products_count} products ·{' '}
                                            {preview.rows.length} CSV rows /
                                            variants
                                        </p>
                                        <button
                                            type="button"
                                            disabled={
                                                !preview.can_import ||
                                                form.processing
                                            }
                                            onClick={() => post('import')}
                                            className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-deep disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <CheckCircle2 className="size-4" />
                                            {form.processing
                                                ? 'Importing...'
                                                : 'Import products'}
                                        </button>
                                    </div>
                                    <div className="max-h-[34rem] overflow-auto rounded-2xl border border-line">
                                        <table className="min-w-full text-left text-sm">
                                            <thead className="sticky top-0 bg-ink text-xs text-white/80 uppercase">
                                                <tr>
                                                    <th className="px-3 py-2">
                                                        Row
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Product
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Category
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Price
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Stock
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Color / size
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Image
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.rows.map((row) => (
                                                    <tr
                                                        key={row.line}
                                                        className="border-t border-line align-top"
                                                    >
                                                        <td className="px-3 py-2 text-ink-soft">
                                                            {row.line}
                                                        </td>
                                                        <td className="px-3 py-2 font-medium text-ink">
                                                            {row.name || '—'}
                                                            {row.errors.length >
                                                                0 && (
                                                                <ul className="mt-1 space-y-1 text-xs font-normal text-coral-deep">
                                                                    {row.errors.map(
                                                                        (
                                                                            error,
                                                                            index,
                                                                        ) => (
                                                                            <li
                                                                                key={`${row.line}-${index}`}
                                                                            >
                                                                                {
                                                                                    error
                                                                                }
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-ink-soft">
                                                            {row.category ||
                                                                '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-ink-soft">
                                                            {row.price || '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-ink-soft">
                                                            {row.stock || '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-ink-soft">
                                                            {[
                                                                row.color,
                                                                row.size,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' / ') ||
                                                                '—'}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {row.color_image_url ||
                                                            row.image_url ? (
                                                                <img
                                                                    src={
                                                                        row.color_image_url ||
                                                                        row.image_url
                                                                    }
                                                                    alt=""
                                                                    className="size-12 rounded-lg object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-xs text-ink-soft">
                                                                    —
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {row.errors
                                                                .length ===
                                                            0 ? (
                                                                <span className="text-xs font-medium text-leaf-deep">
                                                                    Ready
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs font-medium text-coral-deep">
                                                                    Fix errors
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
