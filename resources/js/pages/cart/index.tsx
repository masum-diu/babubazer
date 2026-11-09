import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    ShoppingBag,
    Store,
    Trash2,
} from 'lucide-react';
import { formatBdt } from '@/lib/money';
import StoreLayout from '@/layouts/StoreLayout';

type Cart = {
    items: Array<{
        id: number;
        quantity: number;
        line_total: number;
        color?: { id: number; name: string; hex?: string | null } | null;
        size?: { id: number; name: string } | null;
        product: {
            id: number;
            name: string;
            slug: string;
            price: number;
            image?: string | null;
            stock: number;
        };
    }>;
    subtotal: number;
    shipping_fee: number;
    total: number;
};

export default function CartIndex({ cart }: { cart: Cart }) {
    return (
        <StoreLayout>
            <Head title="Bag" />

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="inline-flex items-center gap-2 text-sm tracking-[0.2em] text-leaf uppercase">
                            <ShoppingBag className="h-4 w-4" />
                            Shopping bag
                        </p>
                        <h1 className="font-display mt-2 text-4xl text-ink">
                            Your bag
                        </h1>
                    </div>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-leaf"
                    >
                        <Store className="h-4 w-4" />
                        Keep shopping
                    </Link>
                </div>

                {cart.items.length === 0 ? (
                    <div className="mt-8 flex flex-col items-center rounded-[2rem] border border-dashed border-line bg-white/70 p-12 text-center">
                        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-foam text-leaf">
                            <ShoppingBag className="h-6 w-6" />
                        </span>
                        <p className="font-display text-2xl text-ink">
                            Your bag is empty
                        </p>
                        <p className="mt-2 text-sm text-ink-soft">
                            Soft baby wear is waiting in the shop.
                        </p>
                        <Link
                            href="/shop"
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral-deep"
                        >
                            Browse shop
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                        <div className="space-y-4">
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-4 rounded-[1.5rem] border border-line bg-white/85 p-4 sm:flex-row sm:items-center"
                                >
                                    <img
                                        src={item.product.image || ''}
                                        alt={item.product.name}
                                        className="h-28 w-full rounded-2xl object-cover sm:h-24 sm:w-24"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/products/${item.product.slug}`}
                                            className="font-medium text-ink hover:text-leaf-deep"
                                        >
                                            {item.product.name}
                                        </Link>
                                        {(item.color || item.size) && (
                                            <p className="mt-1 text-sm text-ink-soft">
                                                {[
                                                    item.color?.name,
                                                    item.size?.name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                        )}
                                        <p className="mt-1 text-sm text-ink-soft">
                                            {formatBdt(item.product.price)} ×{' '}
                                            {item.quantity}
                                        </p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                max={item.product.stock}
                                                defaultValue={item.quantity}
                                                className="w-20 rounded-full border border-line px-3 py-2 text-center text-sm"
                                                onChange={(e) =>
                                                    router.patch(
                                                        `/cart/${item.id}`,
                                                        {
                                                            quantity: Number(
                                                                e.target.value,
                                                            ),
                                                        },
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            />
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-coral hover:bg-coral/10"
                                                onClick={() =>
                                                    router.delete(
                                                        `/cart/${item.id}`,
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <p className="font-display text-xl text-leaf-deep sm:text-right">
                                        {formatBdt(item.line_total)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <aside className="h-fit rounded-[1.5rem] border border-line bg-white/85 p-6">
                            <h2 className="font-display text-2xl">
                                Bag summary
                            </h2>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatBdt(cart.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>
                                        Delivery
                                        <span className="mt-0.5 block text-[11px] font-normal text-ink-soft">
                                            Dhaka rate (final at checkout)
                                        </span>
                                    </span>
                                    <span>{formatBdt(cart.shipping_fee)}</span>
                                </div>
                                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                                    <span>Total</span>
                                    <span className="text-leaf-deep">
                                        {formatBdt(cart.total)}
                                    </span>
                                </div>
                            </div>
                            <Link
                                href="/checkout"
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3 text-sm font-semibold text-white hover:bg-coral-deep"
                            >
                                Checkout
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </aside>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
