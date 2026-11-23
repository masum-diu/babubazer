import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Download,
    PackageCheck,
    Search,
    SlidersHorizontal,
    Truck,
    X,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatBdt } from '@/lib/money';
import AdminLayout from '@/layouts/AdminLayout';

type Order = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email?: string | null;
    customer_phone?: string;
    city?: string;
    division?: string | null;
    payment_method?: string;
    status: string;
    total: number | string;
    items_count?: number;
    created_at?: string;
};

type Paginator = {
    data: Order[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
};

type Filters = { status: string; q: string; from: string; to: string };

const statusConfig: Record<
    string,
    { label: string; icon: typeof Clock3; tone: string }
> = {
    pending: {
        label: 'Pending',
        icon: Clock3,
        tone: 'bg-sun/30 text-[#9a6a00]',
    },
    confirmed: {
        label: 'Confirmed',
        icon: PackageCheck,
        tone: 'bg-leaf/15 text-leaf-deep',
    },
    shipped: {
        label: 'Shipped',
        icon: Truck,
        tone: 'bg-sky text-[#1a5f7a]',
    },
    delivered: {
        label: 'Delivered',
        icon: CheckCircle2,
        tone: 'bg-[#e0f5ec] text-[#16794f]',
    },
    cancelled: {
        label: 'Cancelled',
        icon: XCircle,
        tone: 'bg-blush text-[#c0344c]',
    },
};

const paymentLabel: Record<string, string> = {
    cod: 'COD',
    bkash: 'bKash',
    nagad: 'Nagad',
};

const avatarTones = [
    'bg-sky text-ink',
    'bg-blush text-ink',
    'bg-sun/40 text-ink',
    'bg-leaf/20 text-leaf-deep',
];

const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function StatusDialog({
    order,
    onClose,
}: {
    order: Order;
    onClose: () => void;
}) {
    const [next, setNext] = useState(order.status);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const cancelling = next === 'cancelled' && order.status !== 'cancelled';
    const reopening = order.status === 'cancelled' && next !== 'cancelled';

    const save = () => {
        setSaving(true);
        router.patch(
            `/admin/orders/${order.id}`,
            { status: next },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: onClose,
                onFinish: () => setSaving(false),
            },
        );
    };

    return createPortal(
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-label="Update order status"
                className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold text-ink">
                            Update status
                        </h3>
                        <p className="truncate text-xs text-ink-soft">
                            {order.order_number} · {order.customer_name}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className="text-ink-soft hover:text-ink"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="mt-4 space-y-2" role="radiogroup">
                    {statusOrder.map((key) => {
                        const cfg = statusConfig[key];
                        const Icon = cfg.icon;
                        const active = next === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => setNext(key)}
                                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                                    active
                                        ? 'border-leaf bg-leaf/5'
                                        : 'border-line hover:border-leaf/50'
                                }`}
                            >
                                <span
                                    className={`inline-flex size-8 items-center justify-center rounded-lg ${cfg.tone}`}
                                >
                                    <Icon className="size-4" />
                                </span>
                                <span className="flex-1 text-sm font-medium text-ink">
                                    {cfg.label}
                                    {key === order.status && (
                                        <span className="ml-2 text-[11px] font-normal text-ink-soft">
                                            current
                                        </span>
                                    )}
                                </span>
                                <span
                                    className={`inline-flex size-4 items-center justify-center rounded-full border-2 ${
                                        active
                                            ? 'border-leaf'
                                            : 'border-line'
                                    }`}
                                    aria-hidden="true"
                                >
                                    {active && (
                                        <span className="size-2 rounded-full bg-leaf" />
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {cancelling && (
                    <p className="mt-3 rounded-lg bg-blush px-3 py-2 text-xs text-[#c0344c]">
                        Cancelling returns the ordered items to stock.
                    </p>
                )}
                {reopening && (
                    <p className="mt-3 rounded-lg bg-sun/30 px-3 py-2 text-xs text-[#9a6a00]">
                        Re-opening takes the items from stock again. It fails if
                        there is not enough stock.
                    </p>
                )}

                <div className="mt-5 flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 flex-1 rounded-lg border border-line text-sm font-medium text-ink-soft hover:text-ink"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving || next === order.status}
                        className="h-10 flex-1 rounded-lg bg-leaf text-sm font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : 'Update status'}
                    </button>
                </div>
            </section>
        </div>,
        document.body,
    );
}

function initials(name: string) {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || '?'
    );
}

function formatDate(value?: string) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function pageWindow(current: number, last: number): Array<number | '…'> {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }
    const pages = new Set([1, last, current - 1, current, current + 1]);
    const sorted = [...pages]
        .filter((page) => page >= 1 && page <= last)
        .sort((a, b) => a - b);
    const out: Array<number | '…'> = [];
    sorted.forEach((page, index) => {
        if (index > 0 && page - sorted[index - 1] > 1) {
            out.push('…');
        }
        out.push(page);
    });
    return out;
}

export default function AdminOrders({
    orders,
    stats,
    filters,
}: {
    orders: Paginator;
    stats: {
        all: number;
        pending: number;
        confirmed: number;
        shipped: number;
        delivered: number;
        cancelled: number;
        revenue: number;
    };
    filters: Filters;
}) {
    const [search, setSearch] = useState(filters.q);
    const [filterOpen, setFilterOpen] = useState(false);
    const [draft, setDraft] = useState({
        status: filters.status,
        from: filters.from,
        to: filters.to,
    });
    const [selected, setSelected] = useState<number[]>([]);
    const [editing, setEditing] = useState<Order | null>(null);
    const firstRender = useRef(true);

    const query = (extra: Partial<Filters> & { page?: number } = {}) => {
        const merged = { ...filters, ...extra };
        const out: Record<string, string | number> = {};
        if (merged.status && merged.status !== 'all') out.status = merged.status;
        if (merged.q) out.q = merged.q;
        if (merged.from) out.from = merged.from;
        if (merged.to) out.to = merged.to;
        if (extra.page && extra.page > 1) out.page = extra.page;
        return out;
    };

    const go = (extra: Partial<Filters> & { page?: number }) => {
        setSelected([]);
        router.get('/admin/orders', query(extra), {
            preserveState: true,
            replace: true,
        });
    };

    // Search box: wait a moment after typing before reloading.
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (search === filters.q) return;
        const timer = window.setTimeout(() => go({ q: search, page: 1 }), 400);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const pageIds = useMemo(() => orders.data.map((order) => order.id), [orders]);
    const allSelected =
        pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

    const toggleAll = () =>
        setSelected(allSelected ? [] : pageIds);
    const toggleOne = (id: number) =>
        setSelected((current) =>
            current.includes(id)
                ? current.filter((x) => x !== id)
                : [...current, id],
        );

    const exportHref = (() => {
        const params = new URLSearchParams(
            Object.entries(query()).map(([k, v]) => [k, String(v)]),
        );
        if (selected.length) params.set('ids', selected.join(','));
        const qs = params.toString();
        return `/admin/orders/export${qs ? `?${qs}` : ''}`;
    })();

    const tabs = [
        { key: 'all', label: 'All', count: stats.all },
        { key: 'pending', label: 'Pending', count: stats.pending },
        { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
        { key: 'shipped', label: 'Shipped', count: stats.shipped },
        { key: 'delivered', label: 'Delivered', count: stats.delivered },
        { key: 'cancelled', label: 'Cancelled', count: stats.cancelled },
    ];

    const activeFilters =
        (filters.from ? 1 : 0) + (filters.to ? 1 : 0);

    return (
        <AdminLayout title="Orders">
            <Head title="Admin Orders" />

            <section className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-30px_rgba(18,50,58,0.45)] ring-1 ring-line">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
                    <div>
                        <h2 className="font-display text-lg font-semibold text-ink">
                            Orders
                        </h2>
                        <p className="text-xs text-ink-soft">
                            {stats.all} total · Confirmed revenue{' '}
                            {formatBdt(stats.revenue)}
                        </p>
                    </div>

                    <div className="relative flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setDraft({
                                    status: filters.status,
                                    from: filters.from,
                                    to: filters.to,
                                });
                                setFilterOpen((open) => !open);
                            }}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-leaf px-4 text-sm font-semibold text-white transition hover:bg-leaf-deep"
                        >
                            <SlidersHorizontal className="size-4" />
                            Filters
                            {activeFilters > 0 && (
                                <span className="rounded-full bg-white/25 px-1.5 text-[11px]">
                                    {activeFilters}
                                </span>
                            )}
                        </button>
                        <a
                            href={exportHref}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-ink/70 px-4 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
                        >
                            <Download className="size-4" />
                            Export
                            {selected.length > 0 && (
                                <span className="rounded-full bg-leaf px-1.5 text-[11px] text-white">
                                    {selected.length}
                                </span>
                            )}
                        </a>

                        {filterOpen && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Close filters"
                                    className="fixed inset-0 z-30 cursor-default"
                                    onClick={() => setFilterOpen(false)}
                                />
                                <div className="absolute top-full right-0 z-40 mt-2 w-72 rounded-2xl bg-white p-4 shadow-[0_24px_50px_-20px_rgba(18,50,58,0.5)] ring-1 ring-line">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-ink">
                                            Filters
                                        </p>
                                        <button
                                            type="button"
                                            aria-label="Close"
                                            onClick={() => setFilterOpen(false)}
                                            className="text-ink-soft hover:text-ink"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>

                                    <p className="mt-3 text-xs font-medium text-ink-soft">
                                        Status
                                    </p>
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        status: tab.key,
                                                    }))
                                                }
                                                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                                    draft.status === tab.key
                                                        ? 'bg-leaf text-white'
                                                        : 'bg-mist text-ink-soft hover:text-ink'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <label className="text-xs font-medium text-ink-soft">
                                            From
                                            <input
                                                type="date"
                                                value={draft.from}
                                                onChange={(e) =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        from: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 h-9 w-full rounded-lg border border-line px-2 text-sm text-ink"
                                            />
                                        </label>
                                        <label className="text-xs font-medium text-ink-soft">
                                            To
                                            <input
                                                type="date"
                                                value={draft.to}
                                                onChange={(e) =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        to: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 h-9 w-full rounded-lg border border-line px-2 text-sm text-ink"
                                            />
                                        </label>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterOpen(false);
                                                setSearch('');
                                                go({
                                                    status: 'all',
                                                    from: '',
                                                    to: '',
                                                    q: '',
                                                    page: 1,
                                                });
                                            }}
                                            className="h-9 flex-1 rounded-lg border border-line text-sm font-medium text-ink-soft hover:text-ink"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterOpen(false);
                                                go({ ...draft, page: 1 });
                                            }}
                                            className="h-9 flex-1 rounded-lg bg-leaf text-sm font-semibold text-white hover:bg-leaf-deep"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Search + status quick filter */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                    <div className="relative w-full sm:w-72">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search order, name, email, phone..."
                            className="h-10 w-full rounded-lg border border-line bg-white pr-3 pl-9 text-sm text-ink outline-none focus:border-leaf"
                        />
                    </div>

                    <div className="flex max-w-full gap-1.5 overflow-x-auto">
                        {tabs.map((tab) => {
                            const active = filters.status === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() =>
                                        go({ status: tab.key, page: 1 })
                                    }
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                        active
                                            ? 'bg-leaf text-white'
                                            : 'bg-mist text-ink-soft hover:text-ink'
                                    }`}
                                >
                                    {tab.label}
                                    <span
                                        className={`rounded-full px-1.5 text-[10px] ${
                                            active
                                                ? 'bg-white/25'
                                                : 'bg-white text-ink-soft'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto px-3 sm:px-4">
                    <table className="w-full min-w-[960px] text-left text-sm">
                        <thead>
                            <tr className="bg-mist text-xs font-semibold text-ink">
                                <th className="w-10 rounded-l-lg px-3 py-3">
                                    <input
                                        type="checkbox"
                                        aria-label="Select all orders"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        className="size-4 accent-leaf"
                                    />
                                </th>
                                <th className="px-3 py-3">Customer</th>
                                <th className="px-3 py-3">Order</th>
                                <th className="px-3 py-3">Email</th>
                                <th className="px-3 py-3">Location</th>
                                <th className="px-3 py-3">Date</th>
                                <th className="px-3 py-3">Total</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="w-10 rounded-r-lg px-3 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.map((order) => {
                                const status = statusConfig[order.status];
                                const Icon = status?.icon;
                                const tone =
                                    avatarTones[order.id % avatarTones.length];
                                const inDhaka = order.division === 'Dhaka';

                                return (
                                    <tr
                                        key={order.id}
                                        onClick={() =>
                                            router.visit(
                                                `/admin/orders/${order.id}`,
                                            )
                                        }
                                        className="group cursor-pointer border-b border-line/60 transition last:border-0 hover:bg-mist/70"
                                    >
                                        <td
                                            className="px-3 py-3.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                aria-label={`Select ${order.order_number}`}
                                                checked={selected.includes(
                                                    order.id,
                                                )}
                                                onChange={() =>
                                                    toggleOne(order.id)
                                                }
                                                className="size-4 accent-leaf"
                                            />
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${tone}`}
                                                >
                                                    {initials(
                                                        order.customer_name,
                                                    )}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-ink">
                                                        {order.customer_name}
                                                    </p>
                                                    <p className="text-xs text-ink-soft">
                                                        {order.customer_phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="font-medium text-ink hover:text-leaf-deep"
                                            >
                                                {order.order_number}
                                            </Link>
                                            <p className="text-xs text-ink-soft">
                                                {order.items_count ?? 0} item
                                                {order.items_count === 1
                                                    ? ''
                                                    : 's'}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3.5 text-ink-soft">
                                            {order.customer_email || '—'}
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <span
                                                className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${
                                                    inDhaka
                                                        ? 'bg-sky text-[#1a5f7a]'
                                                        : 'bg-blush text-[#c0344c]'
                                                }`}
                                            >
                                                {order.city ||
                                                    order.division ||
                                                    '—'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3.5 whitespace-nowrap text-ink">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-3 py-3.5 whitespace-nowrap">
                                            <p className="font-semibold text-ink">
                                                {formatBdt(order.total)}
                                            </p>
                                            <p className="text-xs text-ink-soft">
                                                {paymentLabel[
                                                    order.payment_method || ''
                                                ] ||
                                                    order.payment_method ||
                                                    '—'}
                                            </p>
                                        </td>
                                        <td
                                            className="px-3 py-3.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                type="button"
                                                title="Change status"
                                                onClick={() =>
                                                    setEditing(order)
                                                }
                                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition hover:brightness-95 ${
                                                    status?.tone ||
                                                    'bg-mist text-ink-soft'
                                                }`}
                                            >
                                                {Icon && (
                                                    <Icon className="size-4" />
                                                )}
                                                {status?.label || order.status}
                                                <ChevronDown className="size-3.5 opacity-70" />
                                            </button>
                                        </td>
                                        <td className="px-3 py-3.5 text-ink-soft group-hover:text-leaf-deep">
                                            <ArrowRight className="size-4" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {orders.data.length === 0 && (
                        <div className="px-4 py-14 text-center">
                            <p className="font-display text-lg font-semibold text-ink">
                                No orders found
                            </p>
                            <p className="mt-1 text-sm text-ink-soft">
                                Try another search or clear the filters.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer: count + pagination */}
                <div className="grid items-center gap-3 px-4 py-4 sm:grid-cols-[1fr_auto_1fr] sm:px-6">
                    <p className="flex items-center gap-2 text-xs text-ink-soft">
                        {orders.total === 0
                            ? 'Showing 0 entries'
                            : `Showing ${orders.from}–${orders.to} of ${orders.total} entries`}
                        {selected.length > 0 && (
                            <span className="rounded-full bg-leaf/15 px-2 py-0.5 font-medium text-leaf-deep">
                                {selected.length} selected
                            </span>
                        )}
                    </p>

                    {orders.last_page > 1 && (
                        <nav
                            className="flex items-center justify-center gap-1.5"
                            aria-label="Pagination"
                        >
                            <button
                                type="button"
                                aria-label="Previous page"
                                disabled={orders.current_page <= 1}
                                onClick={() =>
                                    go({ page: orders.current_page - 1 })
                                }
                                className="inline-flex size-8 items-center justify-center rounded-md border border-line text-ink-soft transition hover:border-leaf hover:text-leaf-deep disabled:opacity-40"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            {pageWindow(
                                orders.current_page,
                                orders.last_page,
                            ).map((page, index) =>
                                page === '…' ? (
                                    <span
                                        key={`gap-${index}`}
                                        className="px-1 text-xs text-ink-soft"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => go({ page })}
                                        aria-current={
                                            page === orders.current_page
                                                ? 'page'
                                                : undefined
                                        }
                                        className={`inline-flex size-8 items-center justify-center rounded-md text-xs font-semibold transition ${
                                            page === orders.current_page
                                                ? 'bg-leaf text-white'
                                                : 'text-ink hover:bg-mist'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ),
                            )}
                            <button
                                type="button"
                                aria-label="Next page"
                                disabled={
                                    orders.current_page >= orders.last_page
                                }
                                onClick={() =>
                                    go({ page: orders.current_page + 1 })
                                }
                                className="inline-flex size-8 items-center justify-center rounded-md border border-line text-ink-soft transition hover:border-leaf hover:text-leaf-deep disabled:opacity-40"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </nav>
                    )}
                    <span />
                </div>
            </section>

            {editing && (
                <StatusDialog
                    key={editing.id}
                    order={editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </AdminLayout>
    );
}
