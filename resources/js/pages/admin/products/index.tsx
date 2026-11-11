import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    FileSpreadsheet,
    Images,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { formatBdt } from '@/lib/money';
import AdminLayout from '@/layouts/AdminLayout';

type Product = {
    id: number;
    name: string;
    price: number | string;
    stock: number;
    category?: { name: string } | null;
};

export default function AdminProducts({
    products,
}: {
    products: {
        data: Product[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        from: number | null;
        to: number | null;
        total: number;
    };
}) {
    const deleteAll = () => {
        if (
            products.total === 0 ||
            !window.confirm(
                `Permanently delete all ${products.total} products? Order history will be kept. This cannot be undone.`,
            )
        ) {
            return;
        }

        if (
            window.prompt(
                'Type DELETE ALL to confirm deleting every product.',
            ) !== 'DELETE ALL'
        ) {
            return;
        }

        router.delete('/admin/products');
    };

    return (
        <AdminLayout title="Catalog">
            <Head title="Admin Catalog" />

            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-sm text-ink-soft">
                        Manage catalog items and stock levels
                    </p>
                </div>
                <Link
                    href="/admin/products/create"
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-leaf-deep"
                >
                    <Plus className="h-4 w-4" />
                    Add product
                </Link>
                <Link
                    href="/admin/products/import"
                    className="inline-flex items-center gap-2 rounded-full bg-foam px-5 py-2.5 text-sm font-semibold text-leaf-deep transition hover:bg-leaf hover:text-white"
                >
                    <FileSpreadsheet className="h-4 w-4" />
                    Bulk upload CSV
                </Link>
                <Link
                    href="/admin/media"
                    className="inline-flex items-center gap-2 rounded-full bg-foam px-5 py-2.5 text-sm font-semibold text-leaf-deep transition hover:bg-leaf hover:text-white"
                >
                    <Images className="h-4 w-4" />
                    Media library
                </Link>
                <button
                    type="button"
                    disabled={products.total === 0}
                    onClick={deleteAll}
                    className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-5 py-2.5 text-sm font-semibold text-coral-deep transition hover:bg-coral/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete all products ({products.total})
                </button>
            </div>

            <div className="overflow-hidden rounded-[1.35rem] border border-line bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-ink text-[11px] tracking-[0.14em] text-white/70 uppercase">
                            <tr>
                                <th className="px-4 py-3.5 font-medium">
                                    Name
                                </th>
                                <th className="px-4 py-3.5 font-medium">
                                    Category
                                </th>
                                <th className="px-4 py-3.5 font-medium">
                                    Price
                                </th>
                                <th className="px-4 py-3.5 font-medium">
                                    Stock
                                </th>
                                <th className="px-4 py-3.5 font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.map((product) => (
                                <tr
                                    key={product.id}
                                    className="border-b border-line last:border-0 hover:bg-mist/70"
                                >
                                    <td className="px-4 py-3.5 font-medium text-ink">
                                        {product.name}
                                    </td>
                                    <td className="px-4 py-3.5 text-ink-soft">
                                        {product.category?.name || '—'}
                                    </td>
                                    <td className="px-4 py-3.5 text-leaf-deep">
                                        {formatBdt(product.price)}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                product.stock < 10
                                                    ? 'bg-coral/15 text-coral-deep'
                                                    : 'bg-leaf/10 text-leaf-deep'
                                            }`}
                                        >
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-foam px-3 py-1.5 text-sm text-leaf-deep hover:bg-leaf hover:text-white"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Modify
                                            </Link>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-coral hover:bg-coral/10"
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            'Remove this product?',
                                                        )
                                                    ) {
                                                        router.delete(
                                                            `/admin/products/${product.id}`,
                                                        );
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-10 text-center text-ink-soft"
                                    >
                                        No products in the catalog.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {products.total > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-white/70">
                        Showing {products.from}–{products.to} of{' '}
                        {products.total} products
                    </p>
                    <nav
                        aria-label="Catalog pagination"
                        className="flex items-center gap-1.5"
                    >
                        {products.links.map((link, index) => {
                            const isPrevious = index === 0;
                            const isNext = index === products.links.length - 1;
                            const label = isPrevious ? (
                                <ChevronLeft className="size-4" />
                            ) : isNext ? (
                                <ChevronRight className="size-4" />
                            ) : (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            );

                            return (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url || '#'}
                                    preserveScroll
                                    aria-current={
                                        link.active ? 'page' : undefined
                                    }
                                    aria-label={
                                        isPrevious
                                            ? 'Previous page'
                                            : isNext
                                              ? 'Next page'
                                              : `Page ${link.label}`
                                    }
                                    className={`inline-flex size-9 items-center justify-center rounded-full text-sm ${
                                        link.active
                                            ? 'bg-white text-ink'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </AdminLayout>
    );
}
