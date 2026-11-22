import { router, usePage } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WishlistButton({
    productId,
    className,
}: {
    productId: number;
    className?: string;
}) {
    const { auth, wishlistIds } = usePage().props as unknown as {
        auth: { user: unknown | null };
        wishlistIds?: number[];
    };
    const saved = (wishlistIds ?? []).includes(productId);

    const toggle = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (!auth.user) {
            router.visit('/login');
            return;
        }

        router.post(`/wishlist/${productId}`, {}, { preserveScroll: true });
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
            className={cn(
                'inline-flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110',
                saved ? 'text-[#ee4b6a]' : 'text-ink-soft hover:text-[#ee4b6a]',
                className,
            )}
        >
            <Heart
                className="size-4"
                fill={saved ? 'currentColor' : 'none'}
                strokeWidth={2}
            />
        </button>
    );
}
