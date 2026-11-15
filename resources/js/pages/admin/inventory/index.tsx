import { Head, Link, router } from '@inertiajs/react';
import { History, Minus, Plus, Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

type Variant = { id: number; label: string; stock: number };
type Product = {
    id: number;
    name: string;
    image?: string | null;
    category?: string | null;
    stock: number;
    variants: Variant[];
};

type Status = 'all' | 'in' | 'low' | 'out';

const tabs: Array<{ key: Status; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'in', label: 'In stock' },
    { key: 'low', label: 'Low stock' },
    { key: 'out', label: 'Out of stock' },
];

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
    if (stock <= 0) {
        return (
            <span className="rounded-full bg-coral/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-coral-deep uppercase">
                Out
            </span>
        );
    }
    if (stock <= threshold) {
        return (
            <span className="rounded-full bg-sun/25 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink uppercase">
                Low
            </span>
        );
    }
    return (
        <span className="rounded-full bg-leaf/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-leaf-deep uppercase">
            In stock
        </span>
    );
}

function StockEditor({
    productId,
    variantId,
    stock,
}: {
    productId: number;
    variantId: number | null;
    stock: number;
}) {
    const [mode, setMode] = useState<'set' | 'add'>('set');
    const [value, setValue] = useState('');
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (value === '') {
            return;
        }
        router.patch(
            '/admin/inventory/stock',
            {
                product_id: productId,
                variant_id: variantId,
                mode,
                quantity: Number(value),
                reason,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setBusy(true),
                onFinish: () => setBusy(false),
                onSuccess: () => {
                    setValue('');
                    setReason('');
                },
            },
        );
    };

    // Empty box starts from the current stock ("Set to") or from 0 ("Add / remove").
    const step = (delta: number) => {
        const base = value === '' ? (mode === 'set' ? stock : 0) : Number(value);
        const next = base + delta;
        setValue(String(mode === 'set' ? Math.max(0, next) : next));
    };

    const preview =
        value === ''
            ? null
            : mode === 'set'
              ? Math.max(0, Number(value))
              : Math.max(0, stock + Number(value));

    return (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
            <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'set' | 'add')}
                className="rounded-xl border border-line bg-white px-2 py-2 text-sm"
            >
                <option value="set">Set to</option>
                <option value="add">Add / remove</option>
            </select>
            <div className="flex items-center">
                <button
                    type="button"
                    aria-label="Decrease"
                    onClick={() => step(-1)}
                    className="flex h-9 w-9 items-center justify-center rounded-l-xl border border-line bg-white text-ink transition hover:bg-mist"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <input
                    type="number"
                    step={1}
                    min={mode === 'set' ? 0 : undefined}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={mode === 'set' ? 'Qty' : '+10 / -3'}
                    className="h-9 w-20 [appearance:textfield] border-y border-line bg-white px-2 text-center text-sm outline-none focus:border-leaf [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                    type="button"
                    aria-label="Increase"
                    onClick={() => step(1)}
                    className="flex h-9 w-9 items-center justify-center rounded-r-xl border border-line bg-white text-ink transition hover:bg-mist"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
            <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                maxLength={200}
                className="w-40 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-leaf"
            />
            <button
                type="submit"
                disabled={busy || value === ''}
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-leaf-deep disabled:opacity-40"
            >
                Save
            </button>
            {preview !== null && (
                <span className="text-xs text-ink-soft">
                    {stock} → {preview}
                </span>
            )}
        </form>
    );
}

export default function AdminInventory({
    products,
    filters,
    threshold,
    summary,
}: {
    products: {
        data: Product[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { status: Status; q: string };
    threshold: number;
    summary: { in: number; low: number; out: number };
}) {
    const [q, setQ] = useState(filters.q);

    const go = (status: Status, search: string) => {
        router.get(
            '/admin/inventory',
            {
                ...(status !== 'all' ? { status } : {}),
                ...(search ? { q: search } : {}),
            },
            { preserveState: true, replace: true },
        );
    };

    const counts: Record<Status, number> = {
        all: summary.in + summary.low + summary.out,
        in: summary.in,
        low: summary.low,
        out: summary.out,
    };

    return (
        <AdminLayout title="Inventory">
            <Head title="Admin Inventory" />

            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <p className="text-sm text-ink-soft">
                    Update stock quickly. Low stock means {threshold} or fewer
                    units. Every change is saved in the history.
                </p>
                <Link
                    href="/admin/inventory/history"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-leaf hover:text-leaf-deep"
                >
                    <History className="h-4 w-4" />
                    Stock history
                </Link>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-leaf/10 p-4">
                    <p className="text-[11px] tracking-[0.16em] text-leaf-deep uppercase">
                        In stock
                    </p>
                    <p className="font-display mt-1 text-3xl text-leaf-deep">
                        {summary.in}
                    </p>
                </div>
                <div className="rounded-2xl bg-sun/20 p-4">
                    <p className="text-[11px] tracking-[0.16em] text-ink/70 uppercase">
                        Low stock
                    </p>
                    <p className="font-display mt-1 text-3xl text-ink">
                        {summary.low}
                    </p>
                </div>
                <div className="rounded-2xl bg-coral/10 p-4">
                    <p className="text-[11px] tracking-[0.16em] text-coral-deep uppercase">
                        Out of stock
                    </p>
                    <p className="font-display mt-1 text-3xl text-coral-deep">
                        {summary.out}
                    </p>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => go(tab.key, q)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                filters.status === tab.key
                                    ? 'bg-ink text-white'
                                    : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'
                            }`}
                        >
                            {tab.label}{' '}
                            <span className="opacity-60">{counts[tab.key]}</span>
                        </button>
                    ))}
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        go(filters.status, q);
                    }}
                    className="relative"
                >
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search product..."
                        className="w-64 rounded-full border border-line bg-white py-2 pr-4 pl-9 text-sm outline-none focus:border-leaf"
                    />
                </form>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-line bg-white">
                {products.data.length === 0 && (
                    <p className="px-5 py-10 text-center text-sm text-ink-soft">
                        No products match this filter.
                    </p>
                )}
                <div className="divide-y divide-line">
                    {products.data.map((product) => (
                        <div key={product.id} className="p-4 sm:p-5">
                            <div className="flex flex-wrap items-center gap-3">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt=""
                                        className="h-12 w-12 rounded-xl object-cover ring-1 ring-line"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-xl bg-mist" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={`/admin/products/${product.id}/edit`}
                                        className="font-semibold text-ink hover:text-leaf-deep"
                                    >
                                        {product.name}
                                    </Link>
                                    <p className="text-xs text-ink-soft">
                                        {product.category || 'Uncategorized'}
                                        {product.variants.length > 0 &&
                                            ` · ${product.variants.length} variants · total ${product.stock}`}
                                    </p>
                                </div>
                                <Link
                                    href={`/admin/inventory/history?product=${product.id}`}
                                    className="text-xs text-ink-soft underline-offset-2 hover:text-leaf-deep hover:underline"
                                >
                                    History
                                </Link>
                                {product.variants.length === 0 && (
                                    <div className="flex items-center gap-3">
                                        <span className="font-display text-2xl text-ink">
                                            {product.stock}
                                        </span>
                                        <StockBadge
                                            stock={product.stock}
                                            threshold={threshold}
                                        />
                                    </div>
                                )}
                            </div>

                            {product.variants.length === 0 ? (
                                <div className="mt-3">
                                    <StockEditor
                                        productId={product.id}
                                        variantId={null}
                                        stock={product.stock}
                                    />
                                </div>
                            ) : (
                                <div className="mt-3 space-y-2">
                                    {product.variants.map((variant) => (
                                        <div
                                            key={variant.id}
                                            className="flex flex-wrap items-center gap-3 rounded-2xl bg-mist/70 px-3 py-2.5"
                                        >
                                            <span className="w-36 text-sm font-medium text-ink">
                                                {variant.label}
                                            </span>
                                            <span className="font-display w-10 text-xl text-ink">
                                                {variant.stock}
                                            </span>
                                            <StockBadge
                                                stock={variant.stock}
                                                threshold={threshold}
                                            />
                                            <div className="ml-auto">
                                                <StockEditor
                                                    productId={product.id}
                                                    variantId={variant.id}
                                                    stock={variant.stock}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {products.links.length > 3 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {products.links.map((link, index) => (
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
