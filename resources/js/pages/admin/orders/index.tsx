import { Head, Link, router } from '@inertiajs/react';
import {
    Banknote,
    Clock3,
    PackageCheck,
    Printer,
    ShoppingBag,
    Truck,
} from 'lucide-react';
import { formatBdt } from '@/lib/money';
import AdminLayout from '@/layouts/AdminLayout';

type Order = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone?: string;
    city?: string;
    division?: string | null;
    payment_method?: string;
    status: string;
    total: number | string;
    items_count?: number;
    created_at?: string;
};

const statusTone: Record<string, string> = {
    pending: 'bg-sun/30 text-ink ring-sun/40',
    confirmed: 'bg-leaf/15 text-leaf-deep ring-leaf/30',
    shipped: 'bg-[#dff3ff] text-[#1a5f7a] ring-[#9fd0e6]',
    delivered: 'bg-leaf text-white ring-leaf-deep',
    cancelled: 'bg-coral/15 text-coral-deep ring-coral/30',
};

const paymentLabel: Record<string, string> = {
    cod: 'COD',
    bkash: 'bKash',
    nagad: 'Nagad',
};

function formatDate(value?: string) {
    if (!value) return '';
    return new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AdminOrders({
    orders,
    stats,
    filters,
}: {
    orders: { data: Order[] };
    stats: {
        all: number;
        pending: number;
        confirmed: number;
        shipped: number;
        delivered: number;
        cancelled: number;
        revenue: number;
    };
    filters: { status: string };
}) {
    const tabs = [
        { key: 'all', label: 'All', count: stats.all },
        { key: 'pending', label: 'Pending', count: stats.pending },
        { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
        { key: 'shipped', label: 'Shipped', count: stats.shipped },
        { key: 'delivered', label: 'Delivered', count: stats.delivered },
        { key: 'cancelled', label: 'Cancelled', count: stats.cancelled },
    ];

    const setStatus = (status: string) => {
        router.get(
            '/admin/orders',
            status === 'all' ? {} : { status },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AdminLayout title="Sales desk">
            <Head title="Admin Sales" />

            <div className="mb-6 overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#102a31] via-[#163c45] to-leaf p-5 text-white sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[11px] tracking-[0.22em] text-white/55 uppercase">
                            Sales desk
                        </p>
                        <h2 className="font-display mt-2 text-3xl">
                            Orders that need your eye
                        </h2>
                        <p className="mt-2 max-w-lg text-sm text-white/70">
                            Filter by status, open a ticket, update progress, and
                            print invoices for packing.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                        <p className="text-[11px] tracking-[0.16em] text-white/55 uppercase">
                            Confirmed revenue
                        </p>
                        <p className="font-display mt-1 text-2xl text-sun">
                            {formatBdt(stats.revenue)}
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: 'Pending',
                            value: stats.pending,
                            icon: Clock3,
                        },
                        {
                            label: 'Confirmed',
                            value: stats.confirmed,
                            icon: PackageCheck,
                        },
                        {
                            label: 'Shipped',
                            value: stats.shipped,
                            icon: Truck,
                        },
                        {
                            label: 'Open tickets',
                            value: stats.all,
                            icon: ShoppingBag,
                        },
                    ].map((card) => (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs tracking-[0.14em] text-white/55 uppercase">
                                    {card.label}
                                </p>
                                <card.icon className="h-4 w-4 text-sun" />
                            </div>
                            <p className="font-display mt-2 text-2xl">
                                {card.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
                {tabs.map((tab) => {
                    const active = filters.status === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setStatus(tab.key)}
                            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                                active
                                    ? 'bg-ink text-white'
                                    : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'
                            }`}
                        >
                            {tab.label}
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                                    active
                                        ? 'bg-white/15 text-white'
                                        : 'bg-mist text-ink-soft'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="space-y-3">
                {orders.data.length === 0 && (
                    <div className="rounded-[1.5rem] border border-dashed border-line bg-white px-5 py-12 text-center">
                        <Banknote className="mx-auto h-8 w-8 text-leaf" />
                        <p className="font-display mt-3 text-2xl text-ink">
                            No orders in this lane
                        </p>
                        <p className="mt-1 text-sm text-ink-soft">
                            New sales will show up here as soon as customers
                            checkout.
                        </p>
                    </div>
                )}

                {orders.data.map((order) => (
                    <Link
                        key={order.id}
                        href={`/admin/orders/${order.id}`}
                        className="group relative block overflow-hidden rounded-[1.5rem] border border-line bg-white transition hover:-translate-y-0.5 hover:border-leaf/40 hover:shadow-[0_22px_40px_-30px_rgba(18,50,58,0.5)]"
                    >
                        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-sun via-leaf to-coral opacity-80" />
                        <div className="flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:pl-6">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-display text-xl text-ink">
                                        {order.order_number}
                                    </p>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ring-1 ${
                                            statusTone[order.status] ||
                                            'bg-mist text-ink-soft ring-line'
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm font-medium text-ink">
                                    {order.customer_name}
                                </p>
                                <p className="mt-1 text-sm text-ink-soft">
                                    {[
                                        order.customer_phone,
                                        order.city,
                                        order.division,
                                        formatDate(order.created_at),
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                                <div className="rounded-2xl bg-mist px-3 py-2 text-center">
                                    <p className="text-[10px] tracking-[0.14em] text-ink-soft uppercase">
                                        Items
                                    </p>
                                    <p className="font-semibold text-ink">
                                        {order.items_count ?? 0}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-mist px-3 py-2 text-center">
                                    <p className="text-[10px] tracking-[0.14em] text-ink-soft uppercase">
                                        Pay
                                    </p>
                                    <p className="font-semibold text-ink">
                                        {paymentLabel[order.payment_method || ''] ||
                                            order.payment_method ||
                                            '—'}
                                    </p>
                                </div>
                                <div className="min-w-28 text-right">
                                    <p className="font-display text-2xl text-leaf-deep">
                                        {formatBdt(order.total)}
                                    </p>
                                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-soft transition group-hover:text-leaf-deep">
                                        <Printer className="h-3.5 w-3.5" />
                                        Open & print
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </AdminLayout>
    );
}
