import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard, type ProductCardData } from '@/components/ProductCard';
import { type SidebarCategory } from '@/components/StoreSidebar';
import StoreLayout from '@/layouts/StoreLayout';

type Paginator = {
    data: ProductCardData[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

const pill =
    'h-10 rounded-full border border-line bg-white px-4 text-sm text-ink outline-none transition hover:border-leaf focus:border-leaf';

export default function ShopIndex({
    products,
    categories,
    filters,
    ageRanges,
}: {
    products: Paginator;
    categories: SidebarCategory[];
    filters: {
        q?: string | null;
        category?: string | null;
        age?: string | null;
        sort: string;
    };
    ageRanges: string[];
}) {
    const update = (key: string, value: string) => {
        router.get(
            '/shop',
            {
                ...filters,
                [key]: value || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const activeName =
        categories
            .flatMap((c) => [c, ...(c.children ?? [])])
            .find((c) => c.slug === filters.category)?.name ?? 'All Products';

    const pageBtn =
        'inline-flex size-9 items-center justify-center rounded-lg border border-line bg-white text-ink-soft transition hover:border-leaf hover:text-leaf-deep';

    return (
        <StoreLayout>
            <Head title="Shop" />

            <div className="px-4 py-6 sm:px-6 lg:px-0">
                <div className="min-w-0">
                    <nav className="mb-3 text-sm text-ink-soft">
                        <Link href="/" className="hover:text-ink">
                            Home
                        </Link>
                        <span className="mx-1.5">/</span>
                        <span className="text-ink">{activeName}</span>
                    </nav>

                    <div className="rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-baseline gap-x-3">
                                <h1 className="font-display text-2xl font-semibold text-ink">
                                    {activeName}
                                </h1>
                                <p className="text-sm text-ink-soft">
                                    Showing {products.from ?? 0}–
                                    {products.to ?? 0} of {products.total} items
                                </p>
                            </div>

                            {products.last_page > 1 && (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={products.prev_page_url || '#'}
                                        preserveState
                                        aria-label="Previous page"
                                        className={`${pageBtn} ${!products.prev_page_url ? 'pointer-events-none opacity-40' : ''}`}
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Link>
                                    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-leaf px-2 text-sm font-semibold text-white">
                                        {products.current_page}
                                    </span>
                                    <span className="text-sm text-ink-soft">
                                        of {products.last_page}
                                    </span>
                                    <Link
                                        href={products.next_page_url || '#'}
                                        preserveState
                                        aria-label="Next page"
                                        className={`${pageBtn} ${!products.next_page_url ? 'pointer-events-none opacity-40' : ''}`}
                                    >
                                        <ChevronRight className="size-4" />
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                            <select
                                value={filters.category || ''}
                                onChange={(e) =>
                                    update('category', e.target.value)
                                }
                                className={`${pill} lg:hidden`}
                            >
                                <option value="">All categories</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.slug}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.age || ''}
                                onChange={(e) => update('age', e.target.value)}
                                className={pill}
                            >
                                <option value="">Baby's age</option>
                                {ageRanges.map((age) => (
                                    <option key={age} value={age}>
                                        {age}
                                    </option>
                                ))}
                            </select>

                            <label className="ml-auto flex items-center gap-2 text-sm text-ink-soft">
                                Sort by
                                <select
                                    value={filters.sort}
                                    onChange={(e) =>
                                        update('sort', e.target.value)
                                    }
                                    className={pill}
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">
                                        Price: low to high
                                    </option>
                                    <option value="price_desc">
                                        Price: high to low
                                    </option>
                                    <option value="name">Name</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    {products.data.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-dashed border-line bg-white/70 p-12 text-center">
                            <p className="font-display text-2xl">
                                No products found
                            </p>
                            <Link
                                href="/shop"
                                className="mt-4 inline-block text-leaf-deep"
                            >
                                Clear filters
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {products.data.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}

                    {products.last_page > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <Link
                                href={products.prev_page_url || '#'}
                                preserveState
                                aria-label="Previous page"
                                className={`${pageBtn} ${!products.prev_page_url ? 'pointer-events-none opacity-40' : ''}`}
                            >
                                <ChevronLeft className="size-4" />
                            </Link>
                            <span className="text-sm text-ink-soft">
                                Page {products.current_page} of{' '}
                                {products.last_page}
                            </span>
                            <Link
                                href={products.next_page_url || '#'}
                                preserveState
                                aria-label="Next page"
                                className={`${pageBtn} ${!products.next_page_url ? 'pointer-events-none opacity-40' : ''}`}
                            >
                                <ChevronRight className="size-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </StoreLayout>
    );
}
