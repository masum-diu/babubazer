import { Head, useForm } from '@inertiajs/react';
import { Printer, Save } from 'lucide-react';
import { formatBdt } from '@/lib/money';
import AdminLayout from '@/layouts/AdminLayout';

type Order = {
    id: number;
    order_number: string;
    status: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    division?: string | null;
    city: string;
    payment_method: string;
    subtotal?: number | string;
    shipping_fee?: number | string;
    total: number | string;
    notes?: string | null;
    created_at?: string;
    items: Array<{
        id: number;
        product_name: string;
        color_name?: string | null;
        size_name?: string | null;
        quantity: number;
        unit_price?: number | string;
        line_total: number | string;
    }>;
};

const statusTone: Record<string, string> = {
    pending: 'bg-sun/30 text-ink',
    confirmed: 'bg-leaf/15 text-leaf-deep',
    shipped: 'bg-[#dff3ff] text-[#1a5f7a]',
    delivered: 'bg-leaf text-white',
    cancelled: 'bg-coral/15 text-coral-deep',
};

const paymentLabel: Record<string, string> = {
    cod: 'Cash on delivery',
    bkash: 'bKash',
    nagad: 'Nagad',
};

function formatDate(value?: string) {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AdminOrderShow({ order }: { order: Order }) {
    const form = useForm({ status: order.status });

    const printInvoice = () => {
        window.print();
    };

    return (
        <AdminLayout
            title={`Ticket ${order.order_number}`}
            backHref="/admin/orders"
            backLabel="Back to sales desk"
        >
            <Head title={`Order ${order.order_number}`} />

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div>
                    <p className="text-sm text-ink-soft">
                        Update status or print a packing invoice.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={printInvoice}
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
                    >
                        <Printer className="h-4 w-4" />
                        Print invoice
                    </button>
                </div>
            </div>

            <div className="mb-5 rounded-[1.35rem] border border-line bg-white p-5 print:hidden">
                <form
                    className="flex flex-wrap items-end gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.patch(`/admin/orders/${order.id}`);
                    }}
                >
                    <label className="block space-y-1.5 text-sm">
                        <span className="font-medium text-ink">Order status</span>
                        <select
                            value={form.data.status}
                            onChange={(e) =>
                                form.setData('status', e.target.value)
                            }
                            className="block min-w-44 rounded-full border border-line px-4 py-2.5 text-sm outline-none focus:border-leaf"
                        >
                            {[
                                'pending',
                                'confirmed',
                                'shipped',
                                'delivered',
                                'cancelled',
                            ].map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-deep disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        Save status
                    </button>
                </form>
            </div>

            <div className="print-sheet overflow-hidden rounded-[1.5rem] border border-line bg-white">
                <div className="border-b border-line bg-gradient-to-r from-ink via-[#164048] to-leaf px-5 py-6 text-white sm:px-8 print:bg-none print:from-transparent print:text-ink print:border-b-2 print:border-ink">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="font-display text-3xl leading-none">
                                BabuBazer
                            </p>
                            <p className="mt-2 text-sm text-white/70 print:text-ink-soft">
                                Sales invoice / packing slip
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] tracking-[0.18em] text-white/55 uppercase print:text-ink-soft">
                                Order
                            </p>
                            <p className="font-display mt-1 text-2xl">
                                {order.order_number}
                            </p>
                            <span
                                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase print:border print:border-ink ${
                                    statusTone[order.status] || 'bg-white/15'
                                }`}
                            >
                                {order.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 px-5 py-6 sm:px-8 md:grid-cols-2">
                    <div>
                        <p className="text-[11px] tracking-[0.18em] text-leaf uppercase">
                            Bill to
                        </p>
                        <p className="font-display mt-2 text-xl text-ink">
                            {order.customer_name}
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-ink-soft">
                            <p>{order.customer_phone}</p>
                            <p>{order.customer_email}</p>
                            <p>
                                {order.shipping_address}
                                {order.city ? `, ${order.city}` : ''}
                                {order.division ? `, ${order.division}` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="md:text-right">
                        <p className="text-[11px] tracking-[0.18em] text-leaf uppercase">
                            Details
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-ink-soft">
                            <p>
                                <span className="text-ink">Placed:</span>{' '}
                                {formatDate(order.created_at)}
                            </p>
                            <p>
                                <span className="text-ink">Payment:</span>{' '}
                                {paymentLabel[order.payment_method] ||
                                    order.payment_method}
                            </p>
                            {order.notes && (
                                <p>
                                    <span className="text-ink">Notes:</span>{' '}
                                    {order.notes}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-6 sm:px-8">
                    <div className="overflow-hidden rounded-2xl border border-line">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-mist text-[11px] tracking-[0.14em] text-ink-soft uppercase">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Item
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Line total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-line"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-ink">
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
                                                        .join(' / ')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-ink-soft">
                                            × {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-ink">
                                            {formatBdt(item.line_total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5 ml-auto max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between text-ink-soft">
                            <span>Subtotal</span>
                            <span>
                                {formatBdt(order.subtotal ?? order.total)}
                            </span>
                        </div>
                        <div className="flex justify-between text-ink-soft">
                            <span>Shipping</span>
                            <span>{formatBdt(order.shipping_fee ?? 0)}</span>
                        </div>
                        <div className="flex justify-between border-t border-line pt-3 font-display text-xl text-ink">
                            <span>Total</span>
                            <span>{formatBdt(order.total)}</span>
                        </div>
                    </div>

                    <div className="mt-8 hidden border-t border-dashed border-line pt-4 text-center text-xs text-ink-soft print:block">
                        Thank you for shopping with BabuBazer · Soft care for
                        little ones
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
