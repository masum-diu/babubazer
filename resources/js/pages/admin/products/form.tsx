import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { formatBdt } from '@/lib/money';
import AdminLayout from '@/layouts/AdminLayout';

type ExistingImage = { id: number; path: string };
type ColorDraft = {
    key: string;
    id?: number;
    name: string;
    hex: string;
    existing_images: ExistingImage[];
    newFiles: File[];
};
type SizeDraft = { key: string; id?: number; name: string };

type Product = {
    id: number;
    category_id: number;
    name: string;
    description?: string | null;
    brand?: string | null;
    age_range?: string | null;
    price: number | string;
    compare_at_price?: number | string | null;
    stock: number;
    image?: string | null;
    is_featured: boolean;
    is_active: boolean;
    colors?: Array<{
        id: number;
        name: string;
        hex?: string | null;
        images?: ExistingImage[];
    }>;
    sizes?: Array<{ id: number; name: string }>;
    variants?: Array<{
        product_color_id?: number | null;
        product_size_id?: number | null;
        stock: number;
    }>;
};

function uid(prefix: string) {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function initialOriginalPrice(product: Product | null): number {
    if (!product) return 0;
    const compare = Number(product.compare_at_price || 0);
    const price = Number(product.price || 0);
    return compare > price ? compare : price;
}

function initialDiscount(product: Product | null): number {
    if (!product) return 0;
    const compare = Number(product.compare_at_price || 0);
    const price = Number(product.price || 0);
    if (compare > price && compare > 0) {
        return Math.min(
            90,
            Math.max(0, Math.round(((compare - price) / compare) * 100)),
        );
    }
    return 0;
}

function buildVariantDrafts(product: Product | null): {
    colors: ColorDraft[];
    sizes: SizeDraft[];
    stocks: Record<string, number>;
} {
    const colors: ColorDraft[] = (product?.colors || []).map((color) => ({
        key: uid('color'),
        id: color.id,
        name: color.name,
        hex: color.hex || '#cccccc',
        existing_images: color.images || [],
        newFiles: [],
    }));

    const sizes: SizeDraft[] = (product?.sizes || []).map((size) => ({
        key: uid('size'),
        id: size.id,
        name: size.name,
    }));

    const colorKeyById = new Map(colors.map((c) => [c.id as number, c.key]));
    const sizeKeyById = new Map(sizes.map((s) => [s.id as number, s.key]));

    const stocks: Record<string, number> = {};
    (product?.variants || []).forEach((variant) => {
        const colorKey = variant.product_color_id
            ? colorKeyById.get(variant.product_color_id) || ''
            : '';
        const sizeKey = variant.product_size_id
            ? sizeKeyById.get(variant.product_size_id) || ''
            : '';
        stocks[`${colorKey}|${sizeKey}`] = variant.stock;
    });

    return { colors, sizes, stocks };
}

export default function AdminProductForm({
    product,
    categories,
    attributeColors = [],
    attributeSizes = [],
}: {
    product: Product | null;
    categories: Array<{ id: number; name: string; group: string }>;
    attributeColors?: Array<{ id: number; name: string; hex: string }>;
    attributeSizes?: Array<{ id: number; name: string }>;
}) {
    const [preview, setPreview] = useState<string | null>(null);
    const [originalPrice, setOriginalPrice] = useState(
        initialOriginalPrice(product),
    );
    const [discountPercent, setDiscountPercent] = useState(
        initialDiscount(product),
    );

    const initialVariants = useRef(buildVariantDrafts(product));
    const [colors, setColors] = useState<ColorDraft[]>(
        initialVariants.current.colors,
    );
    const [sizes, setSizes] = useState<SizeDraft[]>(
        initialVariants.current.sizes,
    );
    const [stocks, setStocks] = useState<Record<string, number>>(
        initialVariants.current.stocks,
    );

    const stockKey = (colorKey: string, sizeKey: string) =>
        `${colorKey}|${sizeKey}`;

    const form = useForm({
        category_id: product?.category_id || categories[0]?.id || '',
        name: product?.name || '',
        description: product?.description || '',
        brand: product?.brand || '',
        age_range: product?.age_range || '',
        stock: product?.stock ?? 0,
        image: null as File | null,
        is_featured: product?.is_featured ?? false,
        is_active: product?.is_active ?? true,
    });

    const fieldClass =
        'box-border block w-full min-w-0 rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-leaf';

    const shownImage = preview || product?.image || null;

    const salePrice = useMemo(() => {
        if (originalPrice <= 0) return 0;
        if (discountPercent <= 0) return originalPrice;
        return Math.round(originalPrice * (1 - discountPercent / 100));
    }, [originalPrice, discountPercent]);

    const savings = Math.max(0, originalPrice - salePrice);

    const variantStockTotal = useMemo(() => {
        if (colors.length === 0 && sizes.length === 0) {
            return form.data.stock;
        }
        let total = 0;
        if (colors.length && sizes.length) {
            colors.forEach((color) => {
                sizes.forEach((size) => {
                    total += stocks[stockKey(color.key, size.key)] || 0;
                });
            });
        } else if (colors.length) {
            colors.forEach((color) => {
                total += stocks[stockKey(color.key, '')] || 0;
            });
        } else {
            sizes.forEach((size) => {
                total += stocks[stockKey('', size.key)] || 0;
            });
        }
        return total;
    }, [colors, sizes, stocks, form.data.stock]);

    const onImageChange = (file: File | null) => {
        if (!file) {
            form.setData('image', null);
            setPreview(null);
            return;
        }
        if (file.size > 1024 * 1024) {
            form.setError('image', 'Image must be 1MB or smaller');
            return;
        }
        form.clearErrors('image');
        form.setData('image', file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const colorsPayload = colors
            .filter((color) => color.name.trim())
            .map((color) => ({
                key: color.key,
                id: color.id,
                name: color.name.trim(),
                hex: color.hex,
                existing_images: color.existing_images,
            }));

        const sizesPayload = sizes
            .filter((size) => size.name.trim())
            .map((size) => ({
                key: size.key,
                id: size.id,
                name: size.name.trim(),
            }));

        const stocksPayload: Array<{
            color_key: string;
            size_key: string;
            stock: number;
        }> = [];

        if (colorsPayload.length && sizesPayload.length) {
            colorsPayload.forEach((color) => {
                sizesPayload.forEach((size) => {
                    stocksPayload.push({
                        color_key: color.key,
                        size_key: size.key,
                        stock: stocks[stockKey(color.key, size.key)] || 0,
                    });
                });
            });
        } else if (colorsPayload.length) {
            colorsPayload.forEach((color) => {
                stocksPayload.push({
                    color_key: color.key,
                    size_key: '',
                    stock: stocks[stockKey(color.key, '')] || 0,
                });
            });
        } else if (sizesPayload.length) {
            sizesPayload.forEach((size) => {
                stocksPayload.push({
                    color_key: '',
                    size_key: size.key,
                    stock: stocks[stockKey('', size.key)] || 0,
                });
            });
        }

        const hasVariants =
            colorsPayload.length > 0 || sizesPayload.length > 0;

        const payload: Record<string, unknown> = {
            category_id: form.data.category_id,
            name: form.data.name,
            description: form.data.description,
            brand: form.data.brand,
            age_range: form.data.age_range,
            price: salePrice,
            compare_at_price:
                discountPercent > 0 && originalPrice > salePrice
                    ? originalPrice
                    : null,
            stock: hasVariants ? variantStockTotal : form.data.stock,
            is_featured: form.data.is_featured,
            is_active: form.data.is_active,
            colors_json: JSON.stringify(colorsPayload),
            sizes_json: JSON.stringify(sizesPayload),
            stocks_json: JSON.stringify(stocksPayload),
        };

        if (form.data.image) {
            payload.image = form.data.image;
        }

        colors.forEach((color) => {
            if (color.newFiles.length) {
                payload[`color_images_${color.key}`] = color.newFiles;
            }
        });

        if (product) {
            form.transform(() => ({ ...payload, _method: 'put' }));
            form.post(`/admin/products/${product.id}`, { forceFormData: true });
            return;
        }

        form.transform(() => payload);
        form.post('/admin/products', { forceFormData: true });
    };

    return (
        <AdminLayout
            title={product ? 'Modify product' : 'Add product'}
            backHref="/admin/products"
            backLabel="Back to catalog"
        >
            <Head title={product ? 'Modify Product' : 'Add Product'} />

            <form
                className="w-full space-y-4 rounded-[1.35rem] border border-line bg-white p-5 sm:p-6"
                onSubmit={submit}
                encType="multipart/form-data"
            >
                <label className="block w-full space-y-1.5 text-sm">
                    <span className="font-medium text-ink">Category</span>
                    <select
                        value={form.data.category_id}
                        onChange={(e) =>
                            form.setData('category_id', Number(e.target.value))
                        }
                        className={fieldClass}
                    >
                        {Object.entries(
                            categories.reduce<
                                Record<
                                    string,
                                    Array<{ id: number; name: string }>
                                >
                            >((groups, category) => {
                                groups[category.group] ??= [];
                                groups[category.group].push(category);
                                return groups;
                            }, {}),
                        ).map(([group, items]) => (
                            <optgroup key={group} label={group}>
                                {items.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </label>

                <label className="block w-full space-y-1.5 text-sm">
                    <span className="font-medium text-ink">Name</span>
                    <input
                        required
                        placeholder="Product name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        className={fieldClass}
                    />
                </label>

                <div className="grid w-full gap-4 sm:grid-cols-2">
                    <label className="block w-full space-y-1.5 text-sm">
                        <span className="font-medium text-ink">Brand</span>
                        <input
                            placeholder="Brand"
                            value={form.data.brand}
                            onChange={(e) =>
                                form.setData('brand', e.target.value)
                            }
                            className={fieldClass}
                        />
                    </label>
                    <label className="block w-full space-y-1.5 text-sm">
                        <span className="font-medium text-ink">Age range</span>
                        <input
                            placeholder="e.g. 0-12 months"
                            value={form.data.age_range}
                            onChange={(e) =>
                                form.setData('age_range', e.target.value)
                            }
                            className={fieldClass}
                        />
                    </label>
                </div>

                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block w-full space-y-1.5 text-sm">
                        <span className="font-medium text-ink">
                            Product price (BDT)
                        </span>
                        <input
                            required
                            type="number"
                            min={0}
                            placeholder="e.g. 5000"
                            value={originalPrice || ''}
                            onChange={(e) =>
                                setOriginalPrice(Number(e.target.value) || 0)
                            }
                            className={fieldClass}
                        />
                    </label>

                    {colors.length === 0 && sizes.length === 0 ? (
                        <label className="block w-full space-y-1.5 text-sm">
                            <span className="font-medium text-ink">Stock</span>
                            <input
                                type="number"
                                min={0}
                                value={form.data.stock}
                                onChange={(e) =>
                                    form.setData(
                                        'stock',
                                        Number(e.target.value),
                                    )
                                }
                                className={fieldClass}
                            />
                        </label>
                    ) : (
                        <div className="rounded-2xl border border-line bg-mist px-4 py-3 text-sm">
                            <p className="font-medium text-ink">Total stock</p>
                            <p className="font-display mt-1 text-2xl text-leaf-deep">
                                {variantStockTotal}
                            </p>
                            <p className="text-xs text-ink-soft">
                                From color/size combinations
                            </p>
                        </div>
                    )}
                </div>

                <div className="w-full space-y-3 rounded-2xl border border-line bg-mist/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-sm font-medium text-ink">
                                Discount percentage
                            </p>
                            <p className="text-xs text-ink-soft">
                                Example: 5000 with 5% → customer pays 4750
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={0}
                                max={90}
                                value={discountPercent}
                                onChange={(e) =>
                                    setDiscountPercent(
                                        Math.min(
                                            90,
                                            Math.max(
                                                0,
                                                Number(e.target.value) || 0,
                                            ),
                                        ),
                                    )
                                }
                                className="w-20 rounded-xl border border-line bg-white px-3 py-2 text-center text-sm"
                            />
                            <span className="font-semibold text-coral">%</span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={90}
                        value={discountPercent}
                        onChange={(e) =>
                            setDiscountPercent(Number(e.target.value))
                        }
                        className="w-full accent-coral"
                    />
                    <div className="rounded-2xl border border-line bg-white p-4">
                        <p className="text-xs uppercase text-ink-soft">
                            Customer will see
                        </p>
                        <p className="font-display mt-1 text-3xl text-leaf-deep">
                            {formatBdt(salePrice)}
                        </p>
                        {discountPercent > 0 && originalPrice > 0 && (
                            <p className="mt-1 text-sm text-ink-soft">
                                <span className="line-through">
                                    {formatBdt(originalPrice)}
                                </span>
                                <span className="ml-2 text-coral">
                                    -{discountPercent}% · Save{' '}
                                    {formatBdt(savings)}
                                </span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="w-full space-y-2">
                    <p className="text-sm font-medium text-ink">
                        Main image (optional)
                    </p>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                            onImageChange(e.target.files?.[0] || null)
                        }
                        className="box-border block w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-foam file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-leaf-deep"
                    />
                    {shownImage && (
                        <img
                            src={shownImage}
                            alt=""
                            className="h-40 w-full rounded-2xl object-cover"
                        />
                    )}
                </div>

                <div className="space-y-4 rounded-[1.35rem] border border-line bg-mist/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="font-display text-xl text-ink">
                                Colors
                            </h3>
                            <p className="text-xs text-ink-soft">
                                Pick from Colors list or add custom. Each color
                                can have multiple images.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setColors((prev) => [
                                    ...prev,
                                    {
                                        key: uid('color'),
                                        name: '',
                                        hex: '#cccccc',
                                        existing_images: [],
                                        newFiles: [],
                                    },
                                ])
                            }
                            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                        >
                            Add custom
                        </button>
                    </div>

                    {attributeColors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {attributeColors.map((preset) => {
                                const used = colors.some(
                                    (c) =>
                                        c.name.toLowerCase() ===
                                        preset.name.toLowerCase(),
                                );
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        disabled={used}
                                        onClick={() =>
                                            setColors((prev) => [
                                                ...prev,
                                                {
                                                    key: uid('color'),
                                                    name: preset.name,
                                                    hex: preset.hex || '#cccccc',
                                                    existing_images: [],
                                                    newFiles: [],
                                                },
                                            ])
                                        }
                                        className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm disabled:opacity-40"
                                    >
                                        <span
                                            className="h-4 w-4 rounded-full border border-line"
                                            style={{
                                                backgroundColor: preset.hex,
                                            }}
                                        />
                                        {preset.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {colors.length === 0 && (
                        <p className="text-sm text-ink-soft">
                            No colors yet. Create colors in Admin → Colors, then
                            pick them here.
                        </p>
                    )}

                    <div className="space-y-4">
                        {colors.map((color, index) => (
                            <div
                                key={color.key}
                                className="rounded-2xl border border-line bg-white p-4"
                            >
                                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                                    <input
                                        placeholder="Color name (e.g. Red)"
                                        value={color.name}
                                        onChange={(e) =>
                                            setColors((prev) =>
                                                prev.map((item, i) =>
                                                    i === index
                                                        ? {
                                                              ...item,
                                                              name: e.target
                                                                  .value,
                                                          }
                                                        : item,
                                                ),
                                            )
                                        }
                                        className={fieldClass}
                                    />
                                    <input
                                        type="color"
                                        value={color.hex}
                                        onChange={(e) =>
                                            setColors((prev) =>
                                                prev.map((item, i) =>
                                                    i === index
                                                        ? {
                                                              ...item,
                                                              hex: e.target
                                                                  .value,
                                                          }
                                                        : item,
                                                ),
                                            )
                                        }
                                        className="h-[3.05rem] w-16 rounded-2xl border border-line bg-white p-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setColors((prev) =>
                                                prev.filter(
                                                    (_, i) => i !== index,
                                                ),
                                            )
                                        }
                                        className="rounded-full px-3 text-sm text-coral hover:bg-coral/10"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium text-ink">
                                        Images for this color (max 1MB each)
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(
                                                e.target.files || [],
                                            ).filter(
                                                (file) =>
                                                    file.size <= 1024 * 1024,
                                            );
                                            setColors((prev) =>
                                                prev.map((item, i) =>
                                                    i === index
                                                        ? {
                                                              ...item,
                                                              newFiles: [
                                                                  ...item.newFiles,
                                                                  ...files,
                                                              ],
                                                          }
                                                        : item,
                                                ),
                                            );
                                        }}
                                        className="w-full rounded-2xl border border-line px-3 py-2 text-sm"
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {color.existing_images.map((image) => (
                                            <div
                                                key={image.id}
                                                className="relative"
                                            >
                                                <img
                                                    src={image.path}
                                                    alt=""
                                                    className="h-16 w-16 rounded-xl object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute -top-1 -right-1 rounded-full bg-coral px-1.5 text-[10px] text-white"
                                                    onClick={() =>
                                                        setColors((prev) =>
                                                            prev.map(
                                                                (item, i) =>
                                                                    i === index
                                                                        ? {
                                                                              ...item,
                                                                              existing_images:
                                                                                  item.existing_images.filter(
                                                                                      (img) =>
                                                                                          img.id !==
                                                                                          image.id,
                                                                                  ),
                                                                          }
                                                                        : item,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        {color.newFiles.map((file, fileIndex) => (
                                            <div
                                                key={`${file.name}-${fileIndex}`}
                                                className="relative"
                                            >
                                                <img
                                                    src={URL.createObjectURL(
                                                        file,
                                                    )}
                                                    alt=""
                                                    className="h-16 w-16 rounded-xl object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 rounded-[1.35rem] border border-line bg-mist/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="font-display text-xl text-ink">
                                Sizes
                            </h3>
                            <p className="text-xs text-ink-soft">
                                Pick from Sizes list or add custom
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setSizes((prev) => [
                                    ...prev,
                                    { key: uid('size'), name: '' },
                                ])
                            }
                            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                        >
                            Add custom
                        </button>
                    </div>

                    {attributeSizes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {attributeSizes.map((preset) => {
                                const used = sizes.some(
                                    (s) =>
                                        s.name.toLowerCase() ===
                                        preset.name.toLowerCase(),
                                );
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        disabled={used}
                                        onClick={() =>
                                            setSizes((prev) => [
                                                ...prev,
                                                {
                                                    key: uid('size'),
                                                    name: preset.name,
                                                },
                                            ])
                                        }
                                        className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium disabled:opacity-40"
                                    >
                                        {preset.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="space-y-2">
                        {sizes.map((size, index) => (
                            <div key={size.key} className="flex gap-2">
                                <input
                                    placeholder="Size name"
                                    value={size.name}
                                    onChange={(e) =>
                                        setSizes((prev) =>
                                            prev.map((item, i) =>
                                                i === index
                                                    ? {
                                                          ...item,
                                                          name: e.target.value,
                                                      }
                                                    : item,
                                            ),
                                        )
                                    }
                                    className={fieldClass}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSizes((prev) =>
                                            prev.filter((_, i) => i !== index),
                                        )
                                    }
                                    className="rounded-full px-3 text-sm text-coral"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {(colors.length > 0 || sizes.length > 0) && (
                    <div className="space-y-3 rounded-[1.35rem] border border-line bg-white p-4">
                        <h3 className="font-display text-xl text-ink">
                            Stock by color / size
                        </h3>
                        <div className="space-y-2">
                            {colors.length > 0 && sizes.length > 0
                                ? colors.map((color) =>
                                      sizes.map((size) => (
                                          <div
                                              key={stockKey(color.key, size.key)}
                                              className="grid grid-cols-[1fr_1fr_120px] items-center gap-2 text-sm"
                                          >
                                              <span>{color.name || 'Color'}</span>
                                              <span>{size.name || 'Size'}</span>
                                              <input
                                                  type="number"
                                                  min={0}
                                                  value={
                                                      stocks[
                                                          stockKey(
                                                              color.key,
                                                              size.key,
                                                          )
                                                      ] || 0
                                                  }
                                                  onChange={(e) =>
                                                      setStocks((prev) => ({
                                                          ...prev,
                                                          [stockKey(
                                                              color.key,
                                                              size.key,
                                                          )]:
                                                              Number(
                                                                  e.target
                                                                      .value,
                                                              ) || 0,
                                                      }))
                                                  }
                                                  className="rounded-xl border border-line px-3 py-2"
                                              />
                                          </div>
                                      )),
                                  )
                                : colors.length > 0
                                  ? colors.map((color) => (
                                        <div
                                            key={color.key}
                                            className="grid grid-cols-[1fr_120px] items-center gap-2 text-sm"
                                        >
                                            <span>{color.name || 'Color'}</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={
                                                    stocks[
                                                        stockKey(color.key, '')
                                                    ] || 0
                                                }
                                                onChange={(e) =>
                                                    setStocks((prev) => ({
                                                        ...prev,
                                                        [stockKey(
                                                            color.key,
                                                            '',
                                                        )]:
                                                            Number(
                                                                e.target.value,
                                                            ) || 0,
                                                    }))
                                                }
                                                className="rounded-xl border border-line px-3 py-2"
                                            />
                                        </div>
                                    ))
                                  : sizes.map((size) => (
                                        <div
                                            key={size.key}
                                            className="grid grid-cols-[1fr_120px] items-center gap-2 text-sm"
                                        >
                                            <span>{size.name || 'Size'}</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={
                                                    stocks[
                                                        stockKey('', size.key)
                                                    ] || 0
                                                }
                                                onChange={(e) =>
                                                    setStocks((prev) => ({
                                                        ...prev,
                                                        [stockKey(
                                                            '',
                                                            size.key,
                                                        )]:
                                                            Number(
                                                                e.target.value,
                                                            ) || 0,
                                                    }))
                                                }
                                                className="rounded-xl border border-line px-3 py-2"
                                            />
                                        </div>
                                    ))}
                        </div>
                    </div>
                )}

                <label className="block w-full space-y-1.5 text-sm">
                    <span className="font-medium text-ink">Description</span>
                    <textarea
                        rows={5}
                        placeholder="Write product details..."
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                        className={`${fieldClass} min-h-32 resize-y`}
                    />
                </label>

                <div className="flex w-full flex-wrap gap-5">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.is_featured}
                            onChange={(e) =>
                                form.setData('is_featured', e.target.checked)
                            }
                            className="accent-leaf"
                        />
                        Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.data.is_active}
                            onChange={(e) =>
                                form.setData('is_active', e.target.checked)
                            }
                            className="accent-leaf"
                        />
                        Active
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={form.processing || originalPrice <= 0}
                    className="inline-flex items-center gap-2 rounded-full bg-leaf px-6 py-3 text-sm font-semibold text-white hover:bg-leaf-deep disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    Save product
                </button>
            </form>
        </AdminLayout>
    );
}
