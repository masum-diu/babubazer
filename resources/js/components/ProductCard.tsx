import { Link, router, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatBdt } from '@/lib/money';
import { cn } from '@/lib/utils';

type ProductColorOption = {
    id: number;
    name: string;
    hex?: string | null;
    images?: Array<{ id: number; path: string }>;
};

type ProductSizeOption = {
    id: number;
    name: string;
};

type ProductVariantOption = {
    id: number;
    product_color_id?: number | null;
    product_size_id?: number | null;
    stock: number;
};

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
    has_colors?: boolean;
    has_sizes?: boolean;
    colors?: ProductColorOption[];
    sizes?: ProductSizeOption[];
    variants?: ProductVariantOption[];
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
    const colors = product.colors ?? [];
    const sizes = product.sizes ?? [];
    const variants = product.variants ?? [];
    const hasOptions =
        Boolean(product.has_colors || product.has_sizes) ||
        colors.length > 0 ||
        sizes.length > 0;
    const firstAvailableVariant = variants.find((variant) => variant.stock > 0);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [colorId, setColorId] = useState<number | null>(
        firstAvailableVariant?.product_color_id ?? colors[0]?.id ?? null,
    );
    const [sizeId, setSizeId] = useState<number | null>(
        firstAvailableVariant?.product_size_id ?? sizes[0]?.id ?? null,
    );
    const form = useForm({
        product_id: product.id,
        quantity: 1,
        product_color_id: colorId,
        product_size_id: sizeId,
    });

    useEffect(() => {
        if (!optionsOpen) {
            return;
        }

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOptionsOpen(false);
            }
        };

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [optionsOpen]);

    const selectedVariant =
        variants.find(
            (variant) =>
                (variant.product_color_id ?? null) === colorId &&
                (variant.product_size_id ?? null) === sizeId,
        ) ?? null;

    const chooseColor = (id: number) => {
        setColorId(id);
        const matchingVariant =
            variants.find(
                (variant) =>
                    variant.product_color_id === id &&
                    (sizes.length === 0 ||
                        variant.product_size_id === sizeId) &&
                    variant.stock > 0,
            ) ??
            variants.find(
                (variant) =>
                    variant.product_color_id === id && variant.stock > 0,
            );
        if (sizes.length > 0 && matchingVariant) {
            setSizeId(matchingVariant.product_size_id ?? null);
        }
    };

    const chooseSize = (id: number) => {
        setSizeId(id);
        const matchingVariant =
            variants.find(
                (variant) =>
                    variant.product_size_id === id &&
                    (colors.length === 0 ||
                        variant.product_color_id === colorId) &&
                    variant.stock > 0,
            ) ??
            variants.find(
                (variant) =>
                    variant.product_size_id === id && variant.stock > 0,
            );
        if (colors.length > 0 && matchingVariant) {
            setColorId(matchingVariant.product_color_id ?? null);
        }
    };

    const addSelectedVariant = () => {
        form.transform(() => ({
            product_id: product.id,
            quantity: 1,
            product_color_id: colorId,
            product_size_id: sizeId,
        }));
        form.post('/cart', {
            preserveScroll: true,
            onSuccess: () => setOptionsOpen(false),
        });
    };

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
                    {hasOptions ? (
                        <button
                            type="button"
                            onClick={() => setOptionsOpen(true)}
                            disabled={outOfStock}
                            className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-leaf-deep disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Choose
                        </button>
                    ) : (
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
                    )}
                </div>
            </div>

            {optionsOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setOptionsOpen(false);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`product-options-${product.id}`}
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs tracking-[0.16em] text-leaf uppercase">
                                    Select options
                                </p>
                                <h2
                                    id={`product-options-${product.id}`}
                                    className="mt-1 text-xl font-semibold text-ink"
                                >
                                    {product.name}
                                </h2>
                            </div>
                            <button
                                type="button"
                                aria-label="Close options"
                                onClick={() => setOptionsOpen(false)}
                                className="rounded-full p-2 text-ink-soft hover:bg-mist hover:text-ink"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {colors.length > 0 && (
                            <fieldset className="mt-6">
                                <legend className="text-sm font-medium text-ink">
                                    Color
                                </legend>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {colors.map((color) => {
                                        const available =
                                            variants.length === 0
                                                ? (product.stock ?? 0) > 0
                                                : variants.some(
                                                      (variant) =>
                                                          variant.product_color_id ===
                                                              color.id &&
                                                          variant.stock > 0,
                                                  );

                                        return (
                                            <button
                                                key={color.id}
                                                type="button"
                                                aria-label={color.name}
                                                aria-pressed={
                                                    colorId === color.id
                                                }
                                                disabled={!available}
                                                onClick={() =>
                                                    chooseColor(color.id)
                                                }
                                                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 transition disabled:cursor-not-allowed disabled:opacity-35 ${
                                                    colorId === color.id
                                                        ? 'ring-2 ring-leaf ring-offset-2'
                                                        : 'ring-line hover:ring-leaf'
                                                }`}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="h-4 w-4 rounded-full border border-ink/15"
                                                    style={{
                                                        backgroundColor:
                                                            color.hex || '#ccc',
                                                    }}
                                                />
                                                {color.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        )}

                        {sizes.length > 0 && (
                            <fieldset className="mt-6">
                                <legend className="text-sm font-medium text-ink">
                                    Size
                                </legend>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {sizes.map((size) => {
                                        const available =
                                            variants.some(
                                                (variant) =>
                                                    variant.product_size_id ===
                                                        size.id &&
                                                    (colors.length === 0 ||
                                                        variant.product_color_id ===
                                                            colorId) &&
                                                    variant.stock > 0,
                                            ) ||
                                            (variants.length === 0 &&
                                                (product.stock ?? 0) > 0);

                                        return (
                                            <button
                                                key={size.id}
                                                type="button"
                                                disabled={!available}
                                                aria-pressed={
                                                    sizeId === size.id
                                                }
                                                onClick={() =>
                                                    chooseSize(size.id)
                                                }
                                                className={`rounded-full px-4 py-2 text-sm ring-1 transition disabled:cursor-not-allowed disabled:opacity-35 ${
                                                    sizeId === size.id
                                                        ? 'bg-ink text-white ring-ink'
                                                        : 'text-ink ring-line hover:ring-leaf'
                                                }`}
                                            >
                                                {size.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        )}

                        {form.errors.product_color_id && (
                            <p className="mt-3 text-sm text-coral">
                                {form.errors.product_color_id}
                            </p>
                        )}
                        {form.errors.product_size_id && (
                            <p className="mt-3 text-sm text-coral">
                                {form.errors.product_size_id}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={addSelectedVariant}
                            disabled={
                                form.processing ||
                                (variants.length > 0 &&
                                    (!selectedVariant ||
                                        selectedVariant.stock < 1))
                            }
                            className="mt-7 w-full rounded-full bg-coral py-3 text-sm font-semibold text-white transition hover:bg-coral-deep disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            {form.processing ? 'Adding...' : 'Add to cart'}
                        </button>
                    </section>
                </div>
            )}
        </article>
    );
}
