import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    MapPin,
    Package,
    Wallet,
} from 'lucide-react';
import { formatBdt } from '@/lib/money';
import StoreLayout from '@/layouts/StoreLayout';

type Order = {
    order_number: string;
    status: string;
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
    division?: string | null;
    city: string;
    payment_method: string;
    total: number | string;
    items: Array<{
        id: number;
        product_name: string;
        color_name?: string | null;
        size_name?: string | null;
        quantity: number;
        line_total: number | string;
    }>;
};

const statusLabel: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const paymentLabel: Record<string, string> = {
    cod: 'Cash on delivery',
    bkash: 'bKash',
    nagad: 'Nagad',
};

const statusTone: Record<string, string> = {
    pending: 'bg-sun/30 text-ink',
    confirmed: 'bg-leaf/15 text-leaf-deep',
    shipped: 'bg-foam text-leaf-deep',
    delivered: 'bg-leaf text-white',
    cancelled: 'bg-coral/15 text-coral-deep',
};

export default function OrderShow({ order }: { order: Order }) {
    return (
        <StoreLayout>
            <Head title={`Order ${order.order_number}`} />

            <section className="relative overflow-hidden border-b border-line/70">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(31,138,112,0.16),transparent_28%),radial-gradient(circle_at_85%_0%,rgba(255,200,87,0.18),transparent_30%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <Link
                        href="/account/orders"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to orders
                    </Link>

                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="font-display text-5xl leading-none text-ink sm:text-6xl">
                                BabuBazer
                            </p>
                            <h1 className="mt-4 flex items-center gap-2 text-2xl font-medium text-ink sm:text-3xl">
                                <CheckCircle2 className="h-7 w-7 text-leaf" />
                                Order confirmed
                            </h1>
                            <p className="mt-2 text-ink-soft">
                                Order{' '}
                                <span className="font-semibold text-ink">
                                    {order.order_number}
                                </span>
                            </p>
                        </div>
                        <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase ${
                                statusTone[order.status] ||
                                'bg-mist text-ink-soft'
                            }`}
                        >
                            {statusLabel[order.status] || order.status}
                        </span>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="overflow-hidden rounded-[2rem] border border-line bg-white/90 shadow-[0_24px_60px_-42px_rgba(18,50,58,0.4)]">
                        <div className="flex items-center gap-2 border-b border-line bg-ink px-6 py-4 text-white">
                            <Package className="h-4 w-4 text-sun" />
                            <h2 className="font-display text-xl">Items</h2>
                        </div>
                        <div className="divide-y divide-line">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-4 px-6 py-4"
                                >
                                    <div>
                                        <p className="font-medium text-ink">
                                            {item.product_name}
                                        </p>
                                        {(item.color_name ||
                                            item.size_name) && (
                                            <p className="mt-1 text-sm text-ink-soft">
                                                {[
                                                    item.color_name,
                                                    item.size_name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-ink-soft">
                                            Qty {item.quantity}
                                        </p>
                                    </div>
                                    <p className="shrink-0 font-medium text-leaf-deep">
                                        {formatBdt(item.line_total)}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-line bg-mist/70 px-6 py-4">
                            <span className="text-sm font-medium text-ink-soft">
                                Total paid
                            </span>
                            <span className="font-display text-3xl text-leaf-deep">
                                {formatBdt(order.total)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[2rem] border border-line bg-white/90 p-6">
                            <div className="mb-4 flex items-center gap-2 text-ink">
                                <MapPin className="h-4 w-4 text-leaf" />
                                <h2 className="font-display text-xl">
                                    Delivery
                                </h2>
                            </div>
                            <div className="space-y-1 text-sm text-ink-soft">
                                <p className="font-medium text-ink">
                                    {order.customer_name}
                                </p>
                                <p>{order.customer_phone}</p>
                                <p className="pt-2">
                                    {order.shipping_address}
                                </p>
                                <p>
                                    {[order.city, order.division]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-line bg-white/90 p-6">
                            <div className="mb-4 flex items-center gap-2 text-ink">
                                <Wallet className="h-4 w-4 text-leaf" />
                                <h2 className="font-display text-xl">
                                    Payment
                                </h2>
                            </div>
                            <p className="text-sm text-ink-soft">
                                {paymentLabel[order.payment_method] ||
                                    order.payment_method}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/shop"
                                className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-coral-deep"
                            >
                                Continue shopping
                            </Link>
                            <Link
                                href="/account/orders"
                                className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink hover:border-leaf"
                            >
                                All orders
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </StoreLayout>
    );
}
