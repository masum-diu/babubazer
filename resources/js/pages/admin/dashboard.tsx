import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    PackagePlus,
    ShoppingBag,
} from 'lucide-react';
import { formatBdt } from '@/lib/money';
import AdminLayout from '@/layouts/AdminLayout';

const statusTone: Record<string, string> = {
    pending: 'bg-sun/20 text-ink',
    confirmed: 'bg-leaf/15 text-leaf-deep',
    shipped: 'bg-foam text-leaf-deep',
    delivered: 'bg-leaf text-white',
    cancelled: 'bg-coral/15 text-coral-deep',
};

export default function AdminDashboard({
    stats,
    recentOrders,
}: {
    stats: {
        products: number;
        orders: number;
        pending_orders: number;
        customers: number;
        revenue: number;
    };
    recentOrders: Array<{
        id: number;
        order_number: string;
        customer_name: string;
        status: string;
        total: number | string;
    }>;
}) {
    const cards = [
        {
            label: 'Products',
            value: stats.products,
            tone: 'from-leaf to-leaf-deep',
            note: 'Live catalog',
        },
        {
            label: 'Orders',
            value: stats.orders,
            tone: 'from-ink to-[#1a4550]',
            note: 'All time',
        },
        {
            label: 'Pending',
            value: stats.pending_orders,
            tone: 'from-coral to-coral-deep',
            note: 'Needs action',
        },
        {
            label: 'Customers',
            value: stats.customers,
            tone: 'from-[#2a6f7a] to-ink',
            note: 'Registered',
        },
        {
            label: 'Revenue',
            value: formatBdt(stats.revenue),
            tone: 'from-sun to-[#f0a83a]',
            note: 'Paid + COD',
            dark: true,
        },
    ];

    return (
        <AdminLayout title="Overview">
            <Head title="Admin Overview" />

            <div className="mb-6 overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-ink via-[#164048] to-leaf p-5 text-white sm:p-6">
                <p className="text-[11px] tracking-[0.2em] text-white/55 uppercase">
                    Today at BabuBazer
                </p>
                <h2 className="font-display mt-2 max-w-xl text-2xl sm:text-3xl">
                    Keep the catalog stocked and sales moving.
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                        href="/admin/products/create"
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink"
                    >
                        <PackagePlus className="h-4 w-4" />
                        Add product
                    </Link>
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Review sales
                    </Link>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className={`rounded-[1.35rem] bg-gradient-to-br ${card.tone} p-4 text-white shadow-[0_18px_40px_-28px_rgba(18,50,58,0.55)]`}
                    >
                        <p
                            className={`text-[11px] tracking-[0.16em] uppercase ${
                                card.dark ? 'text-ink/55' : 'text-white/65'
                            }`}
                        >
                            {card.label}
                        </p>
                        <p
                            className={`font-display mt-2 text-3xl leading-none ${
                                card.dark ? 'text-ink' : 'text-white'
                            }`}
                        >
                            {card.value}
                        </p>
                        <p
                            className={`mt-3 text-xs ${
                                card.dark ? 'text-ink/60' : 'text-white/65'
                            }`}
                        >
                            {card.note}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-line bg-white">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                    <div>
                        <h2 className="font-display text-2xl">Recent orders</h2>
                        <p className="text-sm text-ink-soft">
                            Latest activity from checkout
                        </p>
                    </div>
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-1.5 rounded-full bg-foam px-4 py-2 text-sm font-medium text-leaf-deep"
                    >
                        View all
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="divide-y divide-line">
                    {recentOrders.length === 0 && (
                        <p className="px-5 py-8 text-sm text-ink-soft">
                            No orders yet.
                        </p>
                    )}
                    {recentOrders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/admin/orders/${order.id}`}
                            className="flex flex-col gap-3 px-5 py-4 transition hover:bg-mist/80 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <p className="font-semibold text-ink">
                                    {order.order_number}
                                </p>
                                <p className="mt-0.5 text-sm text-ink-soft">
                                    {order.customer_name}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${
                                        statusTone[order.status] ||
                                        'bg-mist text-ink-soft'
                                    }`}
                                >
                                    {order.status}
                                </span>
                                <span className="font-display text-lg text-leaf-deep">
                                    {formatBdt(order.total)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
