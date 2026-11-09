import { Link, router } from '@inertiajs/react';
import { formatBdt } from '@/lib/money';
import { cn } from '@/lib/utils';

export type ProductCardData = {
    id: number;
    name: string;
    slug: string;
    brand?: string | null;
    age_range?: string | null;
    price: number | string;
    compare_at_price?: number | string | null;
    image?: string | null;
    stock?: number;
    category?: { name: string; slug: string } | null;
};

export function ProductCard({
    product,
    className,
}: {
    product: ProductCardData;
    className?: string;
}) {
    const price = Number(product.price);
    const compareAt = Number(product.compare_at_price ?? 0);
    const onSale = compareAt > price;
    const discountPercent = onSale
        ? Math.round(((compareAt - price) / compareAt) * 100)
        : 0;
    const outOfStock = (product.stock ?? 1) < 1;

    return (
        <article
            className={cn(
                'group overflow-hidden rounded-2xl bg-white ring-1 ring-line/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(18,50,58,0.45)] hover:ring-leaf/35',
                className,
            )}
        >
            <Link
                href={`/products/${product.slug}`}
                className="relative block overflow-hidden bg-foam"
            >
                <div className="aspect-[5/6] overflow-hidden">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback =
                                    e.currentTarget.nextElementSibling;
                                if (fallback instanceof HTMLElement) {
                                    fallback.classList.remove('hidden');
                                    fallback.classList.add('flex');
                                }
                            }}
                        />
                    ) : null}
                    <div
                        className={cn(
                            'h-full w-full items-center justify-center bg-gradient-to-br from-foam via-white to-leaf/20',
                            product.image ? 'hidden' : 'flex',
                        )}
                        aria-hidden={Boolean(product.image)}
                    />
                </div>

                {onSale && discountPercent > 0 && (
                    <span className="absolute top-3 left-3 z-10 rounded-full bg-coral px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        -{discountPercent}%
                    </span>
                )}

                {outOfStock && (
                    <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-2 text-center text-[11px] font-semibold tracking-wide text-white uppercase">
                        Out of stock
                    </span>
                )}
            </Link>

            <div className="space-y-3 p-3.5 sm:p-4">
                <div>
                    {(product.brand || product.category?.name) && (
                        <p className="text-[10px] tracking-[0.14em] text-ink-soft uppercase">
                            {product.brand || product.category?.name}
                        </p>
                    )}
                    <Link href={`/products/${product.slug}`}>
                        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-[15px] leading-snug font-semibold text-ink transition group-hover:text-leaf-deep">
                            {product.name}
                        </h3>
                    </Link>
                    {product.age_range && (
                        <p className="mt-1 text-xs text-ink-soft">
                            Age: {product.age_range}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-line/70 pt-3">
                    <div className="min-w-0">
                        <p className="text-base font-bold text-leaf-deep">
                            {formatBdt(product.price)}
                        </p>
                        {onSale && (
                            <p className="text-xs text-ink-soft line-through">
                                {formatBdt(product.compare_at_price || 0)}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() =>
                            router.post(
                                '/cart',
                                { product_id: product.id, quantity: 1 },
                                { preserveScroll: true },
                            )
                        }
                        disabled={outOfStock}
                        className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Add
                    </button>
                </div>
            </div>
        </article>
    );
}
