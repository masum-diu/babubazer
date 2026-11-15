import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';

type Movement = {
    id: number;
    product_id: number | null;
    product_name: string;
    variant_label: string | null;
    type: string;
    change: number;
    stock_after: number;
    reason: string | null;
    order_id: number | null;
    user: string | null;
    created_at: string;
};

const types: Array<{ key: string; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'adjustment', label: 'Manual' },
    { key: 'order', label: 'Orders' },
    { key: 'cancel', label: 'Cancelled' },
    { key: 'product_edit', label: 'Product edit' },
    { key: 'import', label: 'Bulk upload' },
    { key: 'initial', label: 'New product' },
];

const typeLabel: Record<string, string> = Object.fromEntries(
    types.map((t) => [t.key, t.label]),
);

export default function AdminInventoryHistory({
    movements,
    filters,
}: {
    movements: {
        data: Movement[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    filters: { type: string; product: number | null };
}) {
    const go = (type: string) =>
        router.get(
            '/admin/inventory/history',
            {
                ...(type !== 'all' ? { type } : {}),
                ...(filters.product ? { product: filters.product } : {}),
            },
            { preserveState: true, replace: true },
        );

    return (
        <AdminLayout
            title="Stock history"
            backHref="/admin/inventory"
            backLabel="Back to inventory"
        >
            <Head title="Admin Stock history" />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                {types.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => go(t.key)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            filters.type === t.key
                                ? 'bg-ink text-white'
                                : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
                {filters.product && (
                    <Link
                        href="/admin/inventory/history"
                        className="rounded-full bg-foam px-4 py-2 text-sm font-medium text-leaf-deep"
                    >
                        Showing one product · show all
                    </Link>
                )}
            </div>

            <div className="overflow-x-auto rounded-[1.5rem] border border-line bg-white">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-mist/70 text-[11px] tracking-[0.14em] text-ink-soft uppercase">
                        <tr>
                            <th className="px-4 py-3">When</th>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3 text-right">Change</th>
                            <th className="px-4 py-3 text-right">Stock after</th>
                            <th className="px-4 py-3">Note</th>
                            <th className="px-4 py-3">By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {movements.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-10 text-center text-ink-soft"
                                >
                                    No stock movements yet.
                                </td>
                            </tr>
                        )}
                        {movements.data.map((m) => (
                            <tr key={m.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                                    {new Date(m.created_at).toLocaleString()}
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-ink">
                                        {m.product_name}
                                    </p>
                                    {m.variant_label && (
                                        <p className="text-xs text-ink-soft">
                                            {m.variant_label}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {typeLabel[m.type] ?? m.type}
                                </td>
                                <td
                                    className={`px-4 py-3 text-right font-semibold ${
                                        m.change > 0
                                            ? 'text-leaf-deep'
                                            : 'text-coral-deep'
                                    }`}
                                >
                                    {m.change > 0 ? '+' : ''}
                                    {m.change}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {m.stock_after}
                                </td>
                                <td className="px-4 py-3 text-ink-soft">
                                    {m.order_id ? (
                                        <Link
                                            href={`/admin/orders/${m.order_id}`}
                                            className="hover:text-leaf-deep hover:underline"
                                        >
                                            {m.reason || 'Order'}
                                        </Link>
                                    ) : (
                                        m.reason
                                    )}
                                </td>
                                <td className="px-4 py-3 text-ink-soft">
                                    {m.user ?? '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {movements.links.length > 3 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {movements.links.map((link, index) => (
                        <button
                            key={index}
                            type="button"
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url)}
                            className={`rounded-full px-3 py-1.5 text-sm ${
                                link.active
                                    ? 'bg-ink text-white'
                                    : 'bg-white text-ink-soft ring-1 ring-line disabled:opacity-40'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
