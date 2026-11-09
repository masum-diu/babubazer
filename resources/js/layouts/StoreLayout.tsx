import { Link, useForm, usePage } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import { type PropsWithChildren, useState } from 'react';
import { FlashBanner } from '@/components/FlashBanner';

type Shared = {
    name: string;
    cartCount: number;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            is_admin: boolean;
        } | null;
    };
    footer?: {
        blurb?: string;
        links_title?: string;
        support_title?: string;
        hotline?: string;
        email?: string;
        note?: string;
        copyright_suffix?: string;
    };
};

export default function StoreLayout({ children }: PropsWithChildren) {
    const { name, cartCount, auth, footer } = usePage()
        .props as unknown as Shared;
    const [menuOpen, setMenuOpen] = useState(false);
    const searchForm = useForm({ q: '' });
    const logout = useForm({});

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-line/70 bg-mist/85 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <Link href="/" className="group">
                        <span className="font-display block text-2xl leading-none text-ink transition group-hover:text-leaf-deep">
                            {name}
                        </span>
                        <span className="text-xs tracking-[0.18em] text-ink-soft uppercase">
                            Baby essentials
                        </span>
                    </Link>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            searchForm.get('/shop', { preserveState: true });
                        }}
                        className="hidden max-w-md flex-1 md:block"
                    >
                        <input
                            value={searchForm.data.q}
                            onChange={(e) =>
                                searchForm.setData('q', e.target.value)
                            }
                            placeholder="Search diapers, toys, lotion..."
                            className="w-full rounded-full border border-line bg-white/80 px-5 py-2.5 text-sm outline-none ring-leaf/30 transition focus:ring-2"
                        />
                    </form>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/shop"
                            className="hidden rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition hover:text-ink sm:inline"
                        >
                            Shop
                        </Link>
                        <Link
                            href="/about"
                            className="hidden rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition hover:text-ink sm:inline"
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="hidden rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition hover:text-ink sm:inline"
                        >
                            Contact
                        </Link>
                        <Link
                            href="/cart"
                            className="relative inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm ring-1 ring-line transition hover:ring-leaf"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Bag
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-semibold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        {auth.user ? (
                            <>
                                {auth.user.is_admin && (
                                    <Link
                                        href="/admin"
                                        prefetch={false}
                                        className="hidden rounded-full bg-leaf px-3 py-2 text-sm font-medium text-white sm:inline"
                                    >
                                        Control room
                                    </Link>
                                )}
                                <Link
                                    href="/account/orders"
                                    className="hidden rounded-full px-3 py-2 text-sm font-medium text-ink-soft sm:inline"
                                >
                                    Orders
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => logout.post('/logout')}
                                    className="hidden rounded-full px-3 py-2 text-sm text-ink-soft sm:inline"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="hidden rounded-full bg-ink px-4 py-2 text-sm font-medium text-white sm:inline"
                            >
                                Login
                            </Link>
                        )}
                        <button
                            type="button"
                            className="rounded-full bg-white px-3 py-2 text-sm ring-1 ring-line md:hidden"
                            onClick={() => setMenuOpen((v) => !v)}
                        >
                            Menu
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <div className="space-y-2 border-t border-line bg-white px-4 py-4 md:hidden">
                        <Link href="/shop" className="block py-2">
                            Shop
                        </Link>
                        <Link href="/about" className="block py-2">
                            About
                        </Link>
                        <Link href="/contact" className="block py-2">
                            Contact
                        </Link>
                        <Link
                            href="/cart"
                            className="flex items-center gap-2 py-2"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Bag ({cartCount})
                        </Link>
                        {auth.user ? (
                            <>
                                {auth.user.is_admin && (
                                    <Link
                                        href="/admin"
                                        prefetch={false}
                                        className="block py-2 font-medium text-leaf-deep"
                                    >
                                        Control room
                                    </Link>
                                )}
                                <Link
                                    href="/account/orders"
                                    className="block py-2"
                                >
                                    My Orders
                                </Link>
                                <button
                                    type="button"
                                    className="block py-2"
                                    onClick={() => logout.post('/logout')}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="block py-2">
                                Login
                            </Link>
                        )}
                    </div>
                )}
            </header>

            <FlashBanner />
            <main>{children}</main>

            <footer className="mt-20 border-t border-line/80 bg-ink text-white">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
                    <div>
                        <p className="font-display text-3xl">{name}</p>
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                            {footer?.blurb}
                        </p>
                    </div>
                    <div>
                        <p className="font-display text-lg">
                            {footer?.links_title || 'Quick links'}
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-white/75">
                            <Link href="/shop" className="block hover:text-white">
                                All products
                            </Link>
                            <Link
                                href="/about"
                                className="block hover:text-white"
                            >
                                About Us
                            </Link>
                            <Link
                                href="/contact"
                                className="block hover:text-white"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                    <div>
                        <p className="font-display text-lg">
                            {footer?.support_title || 'Support'}
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-white/75">
                            <p>Hotline: {footer?.hotline}</p>
                            <p>Email: {footer?.email}</p>
                            <p>{footer?.note}</p>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
                    © {new Date().getFullYear()} {name}.{' '}
                    {footer?.copyright_suffix}
                </div>
            </footer>
        </div>
    );
}
