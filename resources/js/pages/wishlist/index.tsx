import { Head, Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { ProductCard, type ProductCardData } from '@/components/ProductCard';
import StoreLayout from '@/layouts/StoreLayout';

export default function WishlistIndex({
    products,
}: {
    products: ProductCardData[];
}) {
    return (
        <StoreLayout>
            <Head title="My Wishlist" />

            <div className="px-4 py-8 sm:px-6 lg:px-0">
                <div className="mb-6 flex items-baseline gap-3">
                    <h1 className="font-display text-2xl font-semibold text-ink">
                        My Wishlist
                    </h1>
                    <p className="text-sm text-ink-soft">
                        {products.length} item{products.length === 1 ? '' : 's'}
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-line bg-white/70 p-12 text-center">
                        <Heart className="mx-auto size-10 text-[#ee4b6a]" />
                        <p className="mt-3 font-display text-xl">
                            Your wishlist is empty
                        </p>
                        <p className="mt-1 text-sm text-ink-soft">
                            Tap the heart on any product to save it here.
                        </p>
                        <Link
                            href="/shop"
                            className="mt-5 inline-flex h-10 items-center rounded-full bg-leaf px-6 text-sm font-semibold text-white hover:bg-leaf-deep"
                        >
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
