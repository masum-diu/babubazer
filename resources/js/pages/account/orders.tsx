import { Head, Link } from '@inertiajs/react';
import { ArrowRight, PackageOpen, ShoppingBag } from 'lucide-react';
import { formatBdt } from '@/lib/money';
import StoreLayout from '@/layouts/StoreLayout';

type Order = {
    id: number;
    order_number: string;
    status: string;
    total: number | string;
    created_at: string;
};

const statusTone: Record<string, string> = {
    pending: 'bg-sun/30 text-ink',
    confirmed: 'bg-leaf/15 text-leaf-deep',
    shipped: 'bg-foam text-leaf-deep',
    delivered: 'bg-leaf text-white',
    cancelled: 'bg-coral/15 text-coral-deep',
};

export default function AccountOrders({
    orders,
}: {
    orders: { data: Order[] };
}) {
    return (
        <StoreLayout>
            <Head title="My Orders" />

            <section className="relative overflow-hidden border-b border-line/70">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(31,138,112,0.12),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(255,107,87,0.12),transparent_28%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="font-display text-5xl leading-none text-ink sm:text-6xl">
                                BabuBazer
                            </p>
                            <h1 className="mt-4 text-2xl font-medium text-ink sm:text-3xl">
                                Your orders
                            </h1>
                            <p className="mt-2 max-w-lg text-ink-soft">
                                Track every purchase from packing to delivery.
                            </p>
                        </div>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-leaf-deep"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Continue shopping
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {orders.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-line bg-white/70 px-6 py-16 text-center">
                        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-foam text-leaf">
                            <PackageOpen className="h-6 w-6" />
                        </span>
                        <h2 className="font-display text-3xl text-ink">
                            No orders yet
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-ink-soft">
                            When you place an order, it will show up here with
                            status updates.
                        </p>
                        <Link
                            href="/shop"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-coral-deep"
                        >
                            Browse baby wear
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[2rem] border border-line bg-white/90 shadow-[0_24px_60px_-42px_rgba(18,50,58,0.4)]">
                        <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_auto] gap-4 border-b border-line bg-ink px-6 py-3 text-[11px] tracking-[0.16em] text-white/60 uppercase md:grid">
                            <span>Order</span>
                            <span>Placed</span>
                            <span>Status</span>
                            <span className="text-right">Total</span>
                        </div>
                        <div className="divide-y divide-line">
                            {orders.data.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="group grid gap-3 px-5 py-5 transition hover:bg-mist/80 sm:px-6 md:grid-cols-[1.2fr_1fr_0.8fr_auto] md:items-center"
                                >
                                    <div>
                                        <p className="font-semibold text-ink group-hover:text-leaf-deep">
                                            {order.order_number}
                                        </p>
                                        <p className="mt-1 text-xs text-ink-soft md:hidden">
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleString('en-US')}
                                        </p>
                                    </div>
                                    <p className="hidden text-sm text-ink-soft md:block">
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleString('en-US')}
                                    </p>
                                    <div>
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${
                                                statusTone[order.status] ||
                                                'bg-mist text-ink-soft'
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 md:justify-end">
                                        <p className="font-display text-xl text-leaf-deep">
                                            {formatBdt(order.total)}
                                        </p>
                                        <ArrowRight className="h-4 w-4 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-leaf" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </StoreLayout>
    );
}
