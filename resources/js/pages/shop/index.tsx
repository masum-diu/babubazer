import { Head, Link, router } from '@inertiajs/react';
import { ProductCard, type ProductCardData } from '@/components/ProductCard';
import StoreLayout from '@/layouts/StoreLayout';

type Paginator = {
    data: ProductCardData[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function ShopIndex({
    products,
    categories,
    filters,
    ageRanges,
}: {
    products: Paginator;
    categories: Array<{
        id: number;
        name: string;
        slug: string;
        children?: Array<{ id: number; name: string; slug: string }>;
    }>;
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

    return (
        <StoreLayout>
            <Head title="Shop" />

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                            Shop
                        </p>
                        <h1 className="font-display mt-2 text-4xl text-ink">
                            All baby products
                        </h1>
                    </div>
                    <Link
                        href="/shop"
                        className="ml-auto text-sm font-medium text-leaf-deep"
                    >
                        View all →
                    </Link>
                </div>

                <div className="mb-8 flex flex-wrap gap-3">
                    <select
                        value={filters.category || ''}
                        onChange={(e) => update('category', e.target.value)}
                        className="rounded-full border border-line bg-white px-4 py-2 text-sm"
                    >
                        <option value="">All categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.slug}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.age || ''}
                        onChange={(e) => update('age', e.target.value)}
                        className="rounded-full border border-line bg-white px-4 py-2 text-sm"
                    >
                        <option value="">All ages</option>
                        {ageRanges.map((age) => (
                            <option key={age} value={age}>
                                {age}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.sort}
                        onChange={(e) => update('sort', e.target.value)}
                        className="rounded-full border border-line bg-white px-4 py-2 text-sm"
                    >
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: low to high</option>
                        <option value="price_desc">Price: high to low</option>
                        <option value="name">Name</option>
                    </select>
                </div>

                {categories.length > 0 && (
                    <div className="mb-8 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => update('category', '')}
                            className={`rounded-full px-3 py-1.5 text-sm ${
                                !filters.category
                                    ? 'bg-ink text-white'
                                    : 'bg-white text-ink ring-1 ring-line'
                            }`}
                        >
                            All
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() =>
                                    update('category', category.slug)
                                }
                                className={`rounded-full px-3 py-1.5 text-sm ${
                                    filters.category === category.slug
                                        ? 'bg-ink text-white'
                                        : 'bg-white text-ink ring-1 ring-line'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                )}

                {products.data.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-line bg-white/70 p-12 text-center">
                        <p className="font-display text-2xl">No products found</p>
                        <Link href="/shop" className="mt-4 inline-block text-leaf-deep">
                            Clear filters
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                <div className="mt-10 flex flex-wrap justify-center gap-2">
                    {products.links.map((link, index) => (
                        <Link
                            key={`${link.label}-${index}`}
                            href={link.url || '#'}
                            preserveState
                            className={`rounded-full px-3 py-1.5 text-sm ${
                                link.active
                                    ? 'bg-ink text-white'
                                    : 'bg-white text-ink-soft ring-1 ring-line'
                            } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </StoreLayout>
    );
}
