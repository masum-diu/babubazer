import { Head, Link } from "@inertiajs/react";
import { OrderTimeline, statusMessage } from "@/components/OrderTimeline";
import { formatBdt } from "@/lib/money";
import StoreLayout from "@/layouts/StoreLayout";

type TrackedOrder = {
    order_number: string;
    status: string;
    created_at?: string;
    updated_at?: string;
    first_name: string;
    division?: string | null;
    city?: string | null;
    payment_method: string;
    subtotal: number | string;
    shipping_fee: number | string;
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

const statusTone: Record<string, string> = {
    pending: "bg-sun/30 text-[#9a6a00]",
    confirmed: "bg-leaf/15 text-leaf-deep",
    shipped: "bg-sky text-[#1a5f7a]",
    delivered: "bg-[#e0f5ec] text-[#16794f]",
    cancelled: "bg-blush text-[#c0344c]",
};

const statusLabel: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const paymentLabel: Record<string, string> = {
    cod: "Cash on delivery",
    bkash: "bKash",
    nagad: "Nagad",
};

function formatDateTime(value?: string) {
    if (!value) return "";
    return new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function TrackOrder({ order }: { order: TrackedOrder }) {
    return (
        <StoreLayout>
            <Head title={`Order ${order.order_number}`} />

            <div className="px-4 py-8 sm:px-6 lg:px-0">
                <Link
                    href="/account/orders"
                    className="text-sm font-medium text-ink-soft hover:text-ink"
                >
                    ← Back to my orders
                </Link>

                <div className="mt-4 rounded-[2rem] border border-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(18,50,58,0.4)] sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs tracking-[0.18em] text-ink-soft uppercase">
                                Order
                            </p>
                            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                                {order.order_number}
                            </h1>
                            <p className="mt-1 text-xs text-ink-soft">
                                Placed {formatDateTime(order.created_at)}
                            </p>
                        </div>
                        <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase ${
                                statusTone[order.status] ||
                                "bg-mist text-ink-soft"
                            }`}
                        >
                            {statusLabel[order.status] || order.status}
                        </span>
                    </div>

                    <div className="mt-7">
                        <OrderTimeline status={order.status} />
                    </div>

                    <p className="mt-6 rounded-2xl bg-mist px-4 py-3 text-sm text-ink-soft">
                        {order.first_name ? `Hi ${order.first_name}, ` : ""}
                        {statusMessage[order.status] ||
                            "We are working on your order."}
                        {order.updated_at && order.status !== "pending" && (
                            <span className="mt-1 block text-xs">
                                Last updated {formatDateTime(order.updated_at)}
                            </span>
                        )}
                    </p>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem]">
                    <div className="overflow-hidden rounded-[2rem] border border-line bg-white">
                        <h2 className="border-b border-line px-5 py-4 font-display text-lg font-semibold text-ink">
                            Items
                        </h2>
                        <div className="divide-y divide-line">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-4 px-5 py-4"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-ink">
                                            {item.product_name}
                                        </p>
                                        {(item.color_name ||
                                            item.size_name) && (
                                            <p className="mt-0.5 text-xs text-ink-soft">
                                                {[
                                                    item.color_name,
                                                    item.size_name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </p>
                                        )}
                                        <p className="mt-0.5 text-xs text-ink-soft">
                                            Qty {item.quantity}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-medium text-ink">
                                        {formatBdt(item.line_total)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-fit rounded-[2rem] border border-line bg-white p-5">
                        <h2 className="font-display text-lg font-semibold text-ink">
                            Summary
                        </h2>
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-ink-soft">Subtotal</span>
                                <span>{formatBdt(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ink-soft">Delivery</span>
                                <span>{formatBdt(order.shipping_fee)}</span>
                            </div>
                            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                                <span>Total</span>
                                <span className="text-leaf-deep">
                                    {formatBdt(order.total)}
                                </span>
                            </div>
                        </div>
                        <dl className="mt-4 space-y-2 border-t border-line pt-3 text-xs text-ink-soft">
                            <div className="flex justify-between gap-3">
                                <dt>Payment</dt>
                                <dd className="text-right text-ink">
                                    {paymentLabel[order.payment_method] ||
                                        order.payment_method}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt>Delivery area</dt>
                                <dd className="text-right text-ink">
                                    {[order.city, order.division]
                                        .filter(Boolean)
                                        .join(", ") || "—"}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
