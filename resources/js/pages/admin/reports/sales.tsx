import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    Download,
    PackageCheck,
    ShoppingBag,
    Wallet,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { formatBdt } from '@/lib/money';
import AdminLayout from '@/layouts/AdminLayout';

type DailySale = {
    date: string;
    orders_count: number;
    revenue: number | string;
};

type TopProduct = {
    product_name: string;
    quantity: number | string;
    revenue: number | string;
};

export default function SalesReport({
    filters,
    summary,
    dailySales,
    topProducts,
}: {
    filters: { from: string; to: string };
    summary: {
        orders: number;
        revenue: number;
        items_sold: number;
        average_order: number;
    };
    dailySales: DailySale[];
    topProducts: TopProduct[];
}) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const exportUrl = `/admin/reports/sales/export?from=${encodeURIComponent(filters.from)}&to=${encodeURIComponent(filters.to)}`;

    const applyDates = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/admin/reports/sales',
            { from, to },
            { preserveState: true, preserveScroll: true },
        );
    };

    const cards = [
        {
            label: 'Sales revenue',
            value: formatBdt(summary.revenue),
            icon: Wallet,
        },
        { label: 'Completed orders', value: summary.orders, icon: ShoppingBag },
        { label: 'Items sold', value: summary.items_sold, icon: PackageCheck },
        {
            label: 'Average order',
            value: formatBdt(summary.average_order),
            icon: CalendarDays,
        },
    ];

    return (
        <AdminLayout title="Sales report">
            <Head title="Admin · Sales report" />

            <section className="mb-6 flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 sm:flex-row sm:items-end sm:justify-between">
                <form
                    onSubmit={applyDates}
                    className="flex flex-wrap items-end gap-3"
                >
                    <label className="grid gap-1 text-sm font-medium text-ink">
                        From
                        <input
                            required
                            type="date"
                            value={from}
                            max={to}
                            onChange={(event) => setFrom(event.target.value)}
                            className="rounded-xl border border-line px-3 py-2"
                        />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-ink">
                        To
                        <input
                            required
                            type="date"
                            value={to}
                            min={from}
                            onChange={(event) => setTo(event.target.value)}
                            className="rounded-xl border border-line px-3 py-2"
                        />
                    </label>
                    <button
                        type="submit"
                        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-leaf-deep"
                    >
                        Apply dates
                    </button>
                </form>

                <a
                    href={exportUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-foam px-5 py-2.5 text-sm font-semibold text-leaf-deep transition hover:bg-leaf hover:text-white"
                >
                    <Download className="size-4" />
                    Export CSV
                </a>
            </section>

            <p className="mb-4 text-sm text-ink-soft">
                Revenue includes confirmed, shipped, and delivered orders.
                Pending and cancelled orders are excluded.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <article
                        key={card.label}
                        className="rounded-3xl border border-line bg-white p-5"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-ink-soft">
                                {card.label}
                            </p>
                            <card.icon className="size-5 text-leaf-deep" />
                        </div>
                        <p className="mt-3 font-display text-3xl text-ink">
                            {card.value}
                        </p>
                    </article>
                ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="overflow-hidden rounded-3xl border border-line bg-white">
                    <div className="border-b border-line px-5 py-4">
                        <h2 className="font-display text-2xl text-ink">
                            Daily sales
                        </h2>
                        <p className="mt-1 text-sm text-ink-soft">
                            Sales by order date for the selected period
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-mist text-xs text-ink-soft uppercase">
                                <tr>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Orders</th>
                                    <th className="px-5 py-3 text-right">
                                        Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailySales.map((sale) => (
                                    <tr
                                        key={sale.date}
                                        className="border-t border-line"
                                    >
                                        <td className="px-5 py-3 text-ink">
                                            {new Date(
                                                `${sale.date}T00:00:00`,
                                            ).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-5 py-3 text-ink-soft">
                                            {sale.orders_count}
                                        </td>
                                        <td className="px-5 py-3 text-right font-semibold text-leaf-deep">
                                            {formatBdt(sale.revenue)}
                                        </td>
                                    </tr>
                                ))}
                                {dailySales.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-5 py-10 text-center text-ink-soft"
                                        >
                                            No completed sales in this date
                                            range.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="overflow-hidden rounded-3xl border border-line bg-white">
                    <div className="border-b border-line px-5 py-4">
                        <h2 className="font-display text-2xl text-ink">
                            Top products
                        </h2>
                        <p className="mt-1 text-sm text-ink-soft">
                            Ranked by sales revenue
                        </p>
                    </div>
                    <div className="divide-y divide-line">
                        {topProducts.map((product, index) => (
                            <div
                                key={`${product.product_name}-${index}`}
                                className="flex items-center justify-between gap-3 px-5 py-3.5"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-ink">
                                        {product.product_name}
                                    </p>
                                    <p className="mt-0.5 text-xs text-ink-soft">
                                        {product.quantity} sold
                                    </p>
                                </div>
                                <p className="shrink-0 font-semibold text-leaf-deep">
                                    {formatBdt(product.revenue)}
                                </p>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <p className="px-5 py-10 text-center text-sm text-ink-soft">
                                No product sales in this date range.
                            </p>
                        )}
                    </div>
                </section>
            </div>

            <Link
                href="/admin/orders"
                className="mt-6 inline-flex text-sm font-semibold text-leaf-deep underline underline-offset-4 hover:text-leaf"
            >
                View all orders
            </Link>
        </AdminLayout>
    );
}
