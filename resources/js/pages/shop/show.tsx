import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Minus,
    Plus,
    ShoppingBag,
    Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCard, type ProductCardData } from '@/components/ProductCard';
import { formatBdt } from '@/lib/money';
import StoreLayout from '@/layouts/StoreLayout';

type ColorImage = { id: number; path: string };
type ProductColor = {
    id: number;
    name: string;
    hex?: string | null;
    images: ColorImage[];
};
type ProductSize = { id: number; name: string };
type ProductVariant = {
    id: number;
    product_color_id?: number | null;
    product_size_id?: number | null;
    stock: number;
};

type Product = ProductCardData & {
    description?: string | null;
    stock: number;
    gallery?: string[] | null;
    colors?: ProductColor[];
    sizes?: ProductSize[];
    variants?: ProductVariant[];
};

export default function ProductShow({
    product,
    related,
}: {
    product: Product;
    related: ProductCardData[];
}) {
    const colors = product.colors || [];
    const sizes = product.sizes || [];
    const variants = product.variants || [];

    const [colorId, setColorId] = useState<number | null>(
        colors[0]?.id ?? null,
    );
    const [sizeId, setSizeId] = useState<number | null>(sizes[0]?.id ?? null);
    const [activeImage, setActiveImage] = useState(0);

    const selectedColor = colors.find((color) => color.id === colorId) || null;

    const gallery = useMemo(() => {
        const colorImages =
            selectedColor?.images?.map((image) => image.path) || [];
        return [
            ...new Set(
                [
                    ...colorImages,
                    ...(product.gallery || []),
                    product.image,
                ].filter((image): image is string => Boolean(image)),
            ),
        ];
    }, [selectedColor, product.gallery, product.image]);

    const showPreviousImage = () => {
        setActiveImage((current) =>
            gallery.length
                ? (current - 1 + gallery.length) % gallery.length
                : 0,
        );
    };

    const showNextImage = () => {
        setActiveImage((current) =>
            gallery.length ? (current + 1) % gallery.length : 0,
        );
    };

    const selectedVariant = useMemo(() => {
        return (
            variants.find((variant) => {
                const colorOk = colorId
                    ? variant.product_color_id === colorId
                    : !variant.product_color_id;
                const sizeOk = sizeId
                    ? variant.product_size_id === sizeId
                    : !variant.product_size_id;
                return colorOk && sizeOk;
            }) || null
        );
    }, [variants, colorId, sizeId]);

    const availableStock =
        colors.length || sizes.length
            ? (selectedVariant?.stock ?? 0)
            : product.stock;

    const price = Number(product.price);
    const compareAt = Number(product.compare_at_price ?? 0);
    const onSale = compareAt > price;
    const discountPercent = onSale
        ? Math.round(((compareAt - price) / compareAt) * 100)
        : 0;
    const savings = onSale ? compareAt - price : 0;

    const form = useForm({
        product_id: product.id,
        quantity: 1,
        product_color_id: colorId,
        product_size_id: sizeId,
    });

    const selectColor = (id: number) => {
        setColorId(id);
        setActiveImage(0);
        form.setData('product_color_id', id);
    };

    const selectSize = (id: number) => {
        setSizeId(id);
        form.setData('product_size_id', id);
    };

    const setQty = (next: number) => {
        const max = Math.max(1, availableStock);
        form.setData('quantity', Math.min(max, Math.max(1, next)));
    };

    return (
        <StoreLayout>
            <Head title={product.name} />

            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,200,87,0.16),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(31,138,112,0.12),transparent_30%)]" />

                <div className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-1.5 transition hover:text-ink"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Shop
                        </Link>
                        {product.category && (
                            <>
                                <span>/</span>
                                <Link
                                    href={`/shop?category=${product.category.slug}`}
                                    className="transition hover:text-ink"
                                >
                                    {product.category.name}
                                </Link>
                            </>
                        )}
                        <span>/</span>
                        <span className="truncate text-ink">
                            {product.name}
                        </span>
                    </div>
                </div>

                <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:py-12">
                    <div className="space-y-4">
                        <div className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-line/60">
                            {gallery[activeImage] ? (
                                <img
                                    key={gallery[activeImage]}
                                    src={gallery[activeImage]}
                                    alt={product.name}
                                    className="aspect-square w-full object-cover"
                                />
                            ) : (
                                <div className="aspect-square bg-gradient-to-br from-foam via-white to-leaf/15" />
                            )}

                            {gallery.length > 0 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={showPreviousImage}
                                        aria-label="Previous product image"
                                        className="absolute top-1/2 left-3 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-leaf-deep shadow-sm backdrop-blur transition hover:bg-white"
                                    >
                                        <ArrowLeft className="size-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={showNextImage}
                                        aria-label="Next product image"
                                        className="absolute top-1/2 right-3 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-leaf-deep shadow-sm backdrop-blur transition hover:bg-white"
                                    >
                                        <ArrowRight className="size-5" />
                                    </button>
                                </>
                            )}

                            {onSale && discountPercent > 0 && (
                                <span className="absolute top-4 left-4 rounded-full bg-coral px-3 py-1 text-xs font-semibold text-white">
                                    -{discountPercent}%
                                </span>
                            )}

                            {availableStock < 1 && (
                                <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-3 text-center text-sm font-semibold tracking-wide text-white uppercase">
                                    Out of stock
                                </span>
                            )}
                        </div>

                        {gallery.length > 1 && (
                            <div className="flex gap-2.5 overflow-x-auto">
                                {gallery.map((src, index) => (
                                    <button
                                        key={`${src}-${index}`}
                                        type="button"
                                        onClick={() => setActiveImage(index)}
                                        aria-label={`Show product image ${index + 1}`}
                                        aria-current={activeImage === index}
                                        className={`size-16 shrink-0 overflow-hidden rounded-lg transition ${
                                            activeImage === index
                                                ? 'ring-2 ring-leaf'
                                                : 'opacity-75 ring-1 ring-line hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={src}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:sticky lg:top-28 lg:self-start">
                        <div className="space-y-6">
                            <div>
                                {(product.brand || product.age_range) && (
                                    <p className="inline-flex items-center gap-2 text-xs tracking-[0.18em] text-leaf uppercase">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        {[product.brand, product.age_range]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                )}
                                <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
                                    {product.name}
                                </h1>
                                {product.category && (
                                    <Link
                                        href={`/shop?category=${product.category.slug}`}
                                        className="mt-3 inline-block text-sm font-medium text-leaf-deep transition hover:text-ink"
                                    >
                                        {product.category.name}
                                    </Link>
                                )}
                            </div>

                            <div className="flex flex-wrap items-end gap-x-4 gap-y-2 border-y border-line/80 py-5">
                                <p className="font-display text-4xl text-leaf-deep sm:text-5xl">
                                    {formatBdt(product.price)}
                                </p>
                                {onSale && (
                                    <div className="pb-1">
                                        <p className="text-lg text-ink-soft line-through">
                                            {formatBdt(
                                                product.compare_at_price || 0,
                                            )}
                                        </p>
                                        <p className="text-sm font-medium text-coral">
                                            Save {formatBdt(savings)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {product.description && (
                                <p className="max-w-xl text-base leading-relaxed text-ink-soft">
                                    {product.description}
                                </p>
                            )}

                            <p
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
                                    availableStock > 0
                                        ? 'bg-leaf/10 text-leaf-deep'
                                        : 'bg-coral/10 text-coral-deep'
                                }`}
                            >
                                {availableStock > 0
                                    ? `${availableStock} in stock`
                                    : 'Out of stock'}
                            </p>

                            {colors.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-ink">
                                        Color{' '}
                                        <span className="font-normal text-ink-soft">
                                            · {selectedColor?.name}
                                        </span>
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2.5">
                                        {colors.map((color) => (
                                            <button
                                                key={color.id}
                                                type="button"
                                                title={color.name}
                                                onClick={() =>
                                                    selectColor(color.id)
                                                }
                                                className={`relative h-11 w-11 rounded-full transition duration-300 ${
                                                    colorId === color.id
                                                        ? 'scale-110 ring-2 ring-ink ring-offset-2 ring-offset-mist'
                                                        : 'ring-1 ring-line hover:scale-105'
                                                }`}
                                                style={{
                                                    backgroundColor:
                                                        color.hex || '#ccc',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {sizes.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-ink">
                                        Size
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {sizes.map((size) => {
                                            const stockForSize =
                                                variants.find((variant) => {
                                                    const colorOk = colorId
                                                        ? variant.product_color_id ===
                                                          colorId
                                                        : !variant.product_color_id;
                                                    return (
                                                        colorOk &&
                                                        variant.product_size_id ===
                                                            size.id
                                                    );
                                                })?.stock ?? 0;

                                            return (
                                                <button
                                                    key={size.id}
                                                    type="button"
                                                    disabled={stockForSize < 1}
                                                    onClick={() =>
                                                        selectSize(size.id)
                                                    }
                                                    className={`min-w-12 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                                                        sizeId === size.id
                                                            ? 'bg-ink text-white shadow-md shadow-ink/20'
                                                            : 'bg-white text-ink ring-1 ring-line hover:ring-leaf'
                                                    } disabled:cursor-not-allowed disabled:opacity-35`}
                                                >
                                                    {size.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    form.setData({
                                        ...form.data,
                                        product_color_id: colorId,
                                        product_size_id: sizeId,
                                    });
                                    form.post('/cart');
                                }}
                                className="space-y-4 border-t border-line/80 pt-6"
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center rounded-full border border-line bg-white">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQty(form.data.quantity - 1)
                                            }
                                            className="px-3.5 py-3 text-ink-soft transition hover:text-ink"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="min-w-10 text-center text-sm font-semibold">
                                            {form.data.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQty(form.data.quantity + 1)
                                            }
                                            className="px-3.5 py-3 text-ink-soft transition hover:text-ink"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={
                                            availableStock < 1 ||
                                            form.processing
                                        }
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-coral px-7 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_-16px_rgba(255,107,87,0.8)] transition hover:bg-coral-deep disabled:opacity-40 sm:min-w-48 sm:flex-none"
                                    >
                                        <ShoppingBag className="h-4 w-4" />
                                        Add to bag
                                    </button>
                                </div>

                                <Link
                                    href="/shop"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-leaf-deep"
                                >
                                    Continue shopping
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {related.length > 0 && (
                <section className="border-t border-line/70 bg-white/40">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                        <div className="mb-8 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs tracking-[0.18em] text-leaf uppercase">
                                    You may also like
                                </p>
                                <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                                    More from this category
                                </h2>
                            </div>
                            <Link
                                href="/shop"
                                className="hidden items-center gap-1.5 text-sm font-medium text-leaf-deep sm:inline-flex"
                            >
                                View all
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {related.map((item) => (
                                <ProductCard key={item.id} product={item} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </StoreLayout>
    );
}
