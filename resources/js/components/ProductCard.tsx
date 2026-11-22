import { Link, router, useForm } from "@inertiajs/react";
import { ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatBdt } from "@/lib/money";
import { cn } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";

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
            if (event.key === "Escape") {
                setOptionsOpen(false);
            }
        };

        window.addEventListener("keydown", closeOnEscape);

        return () => window.removeEventListener("keydown", closeOnEscape);
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
        form.post("/cart", {
            preserveScroll: true,
            onSuccess: () => setOptionsOpen(false),
        });
    };

    const addToCart = () => {
        if (hasOptions) {
            setOptionsOpen(true);
            return;
        }
        router.post(
            "/cart",
            { product_id: product.id, quantity: 1 },
            { preserveScroll: true },
        );
    };

    return (
        <article
            className={cn(
                "group relative flex flex-col rounded-2xl bg-white p-3 ring-1 ring-line/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(36,50,74,0.35)]",
                className,
            )}
        >
            <WishlistButton
                productId={product.id}
                className="absolute top-4 right-4 z-10"
            />

            <Link
                href={`/products/${product.slug}`}
                className="relative block overflow-hidden rounded-xl bg-mist"
            >
                <div className="aspect-square overflow-hidden">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback =
                                    e.currentTarget.nextElementSibling;
                                if (fallback instanceof HTMLElement) {
                                    fallback.classList.remove("hidden");
                                    fallback.classList.add("flex");
                                }
                            }}
                        />
                    ) : null}
                    <div
                        className={cn(
                            "h-full w-full items-center justify-center bg-gradient-to-br from-sky/60 via-white to-blush/60",
                            product.image ? "hidden" : "flex",
                        )}
                        aria-hidden={Boolean(product.image)}
                    />
                </div>

                {outOfStock && (
                    <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-1.5 text-center text-[11px] font-semibold tracking-wide text-white uppercase">
                        Out of stock
                    </span>
                )}
            </Link>

            <div className="mt-3 flex flex-1 flex-col px-1">
                <Link href={`/products/${product.slug}`}>
                    <h3 className="line-clamp-1 text-sm font-semibold text-ink transition group-hover:text-leaf-deep">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-base font-bold text-ink">
                        {formatBdt(product.price)}
                    </p>
                    {onSale && (
                        <>
                            <p className="text-xs text-ink-soft line-through">
                                {formatBdt(product.compare_at_price || 0)}
                            </p>
                            <span className="rounded-full bg-blush px-2 py-0.5 text-[11px] font-bold text-[#e0455b]">
                                -{discountPercent}%
                            </span>
                        </>
                    )}
                </div>

                <div className="mt-2 flex min-h-6 flex-wrap gap-1.5">
                    {sizes.slice(0, 4).map((size) => (
                        <span
                            key={size.id}
                            className="rounded-full bg-mist px-2 py-0.5 text-[11px] text-ink-soft ring-1 ring-line"
                        >
                            {size.name}
                        </span>
                    ))}
                    {sizes.length > 4 && (
                        <span className="px-1 text-[11px] text-ink-soft">
                            +{sizes.length - 4}
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={addToCart}
                    disabled={outOfStock}
                    className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-leaf text-sm font-semibold text-white transition hover:bg-leaf-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ShoppingBag className="size-4" />
                    Add to Cart
                </button>
            </div>

            {optionsOpen &&
                createPortal(
                    <div
                        className="fixed inset-0 z-100 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
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
                            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
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
                                                            ? "ring-2 ring-leaf ring-offset-2"
                                                            : "ring-line hover:ring-leaf"
                                                    }`}
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className="h-4 w-4 rounded-full border border-ink/15"
                                                        style={{
                                                            backgroundColor:
                                                                color.hex ||
                                                                "#ccc",
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
                                                            ? "bg-ink text-white ring-ink"
                                                            : "text-ink ring-line hover:ring-leaf"
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
                                {form.processing ? "Adding..." : "Add to cart"}
                            </button>
                        </section>
                    </div>,
                    document.body,
                )}
        </article>
    );
}
