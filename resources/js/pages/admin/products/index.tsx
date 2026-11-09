import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
    products: { data: Product[] };
}) {
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
            </div>

            <div className="overflow-hidden rounded-[1.35rem] border border-line bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-ink text-[11px] tracking-[0.14em] text-white/70 uppercase">
                            <tr>
                                <th className="px-4 py-3.5 font-medium">Name</th>
                                <th className="px-4 py-3.5 font-medium">
                                    Category
                                </th>
                                <th className="px-4 py-3.5 font-medium">Price</th>
                                <th className="px-4 py-3.5 font-medium">Stock</th>
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
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
