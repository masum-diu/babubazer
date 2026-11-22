import { Link, useForm, usePage } from '@inertiajs/react';
import { Heart, LogOut, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { type PropsWithChildren, useState } from 'react';
import { FlashBanner } from '@/components/FlashBanner';
import { StoreSidebar, type SidebarCategory } from '@/components/StoreSidebar';

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
    navbar?: { logo?: string; brand_name?: string; tagline?: string };
    sidebarCategories?: SidebarCategory[];
    wishlistIds?: number[];
    footer?: {
        logo?: string;
        blurb?: string;
        links_title?: string;
        support_title?: string;
        hotline?: string;
        email?: string;
        note?: string;
        copyright_suffix?: string;
    };
};

const navLinks: Array<[string, string]> = [
    ['Home', '/'],
    ['All Products', '/shop'],
    ['About', '/about'],
    ['Contact', '/contact'],
];

const actionBtn =
    'inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-ink transition hover:bg-mist';

export default function StoreLayout({ children }: PropsWithChildren) {
    const {
        name: appName,
        cartCount,
        auth,
        footer,
        navbar,
        sidebarCategories,
        wishlistIds = [],
    } = usePage().props as unknown as Shared;
    const { url } = usePage();
    const name = navbar?.brand_name || appName;
    const [menuOpen, setMenuOpen] = useState(false);
    const searchForm = useForm({ q: '' });
    const logout = useForm({});

    const path = url.split('?')[0];
    const activeCategory =
        path === '/shop'
            ? new URLSearchParams(url.split('?')[1] ?? '').get('category')
            : null;
    const isActive = (href: string) =>
        href === '/' ? path === '/' : path.startsWith(href);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get('/shop', { preserveState: true });
    };

    const searchBox = (
        <form onSubmit={submitSearch} className="relative w-full">
            <input
                value={searchForm.data.q}
                onChange={(e) => searchForm.setData('q', e.target.value)}
                placeholder="Search baby food, diapers, toys..."
                className="h-11 w-full rounded-full border border-leaf/60 bg-white pr-14 pl-5 text-sm transition outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/25"
            />
            <button
                type="submit"
                aria-label="Search"
                className="absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-leaf text-white transition hover:bg-leaf-deep"
            >
                <Search className="size-4" />
            </button>
        </form>
    );

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-line bg-white">
                <div className="mx-auto flex h-[68px] max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
                    <Link href="/" className="group shrink-0">
                        {navbar?.logo ? (
                            <img
                                src={navbar.logo}
                                alt={name}
                                className="h-12 w-auto max-w-[180px] object-contain"
                            />
                        ) : (
                            <>
                                <span className="block font-display text-2xl leading-none font-semibold text-leaf transition group-hover:text-leaf-deep">
                                    {name}
                                </span>
                                <span className="text-[10px] tracking-[0.18em] text-ink-soft uppercase">
                                    {navbar?.tagline ?? 'Baby essentials'}
                                </span>
                            </>
                        )}
                    </Link>

                    <div className="mx-auto hidden w-full max-w-2xl md:block">
                        {searchBox}
                    </div>

                    <div className="ml-auto flex items-center gap-1 md:ml-0">
                        {auth.user ? (
                            <>
                                {auth.user.is_admin && (
                                    <Link
                                        href="/admin"
                                        prefetch={false}
                                        className="mr-1 hidden h-10 items-center rounded-full bg-sky px-4 text-sm font-semibold text-ink xl:inline-flex"
                                    >
                                        Control room
                                    </Link>
                                )}
                                <Link
                                    href="/account/orders"
                                    title={auth.user.name}
                                    className={actionBtn}
                                >
                                    <User className="size-5" />
                                    <span className="hidden max-w-30 truncate sm:inline">
                                        {auth.user.name.split(' ')[0]}
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    aria-label="Logout"
                                    title="Logout"
                                    onClick={() => logout.post('/logout')}
                                    className={`${actionBtn} hidden px-2.5 sm:inline-flex`}
                                >
                                    <LogOut className="size-5" />
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className={actionBtn}>
                                <User className="size-5" />
                                <span className="hidden sm:inline">
                                    Account
                                </span>
                            </Link>
                        )}

                        <Link
                            href="/wishlist"
                            aria-label="Wishlist"
                            title="Wishlist"
                            className={`${actionBtn} relative px-2.5`}
                        >
                            <Heart className="size-5" />
                            {wishlistIds.length > 0 && (
                                <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ee4b6a] px-1 text-[10px] font-bold text-white">
                                    {wishlistIds.length}
                                </span>
                            )}
                        </Link>

                        <Link
                            href="/cart"
                            className="relative ml-1 inline-flex h-11 items-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-leaf-deep ring-1 ring-line transition hover:ring-leaf"
                        >
                            <ShoppingBag className="size-5" />
                            <span className="hidden sm:inline">Cart</span>
                            {cartCount > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-leaf px-1 text-[11px] font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <button
                            type="button"
                            aria-label="Menu"
                            className="ml-1 inline-flex size-10 items-center justify-center rounded-full hover:bg-mist lg:hidden"
                            onClick={() => setMenuOpen((v) => !v)}
                        >
                            {menuOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="border-t border-line px-4 py-2.5 md:hidden">
                    {searchBox}
                </div>

                {menuOpen && (
                    <div className="max-h-[70vh] space-y-1 overflow-y-auto border-t border-line bg-white px-4 py-3 lg:hidden">
                        {navLinks.map(([label, href]) => (
                            <Link
                                key={href}
                                href={href}
                                className={`block rounded-xl px-3 py-2.5 font-medium ${
                                    isActive(href)
                                        ? 'bg-leaf/10 text-leaf-deep'
                                        : ''
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                        {(sidebarCategories?.length ?? 0) > 0 && (
                            <div className="mt-2 border-t border-line pt-3">
                                <p className="px-3 pb-1 text-[11px] font-semibold tracking-[0.16em] text-ink-soft uppercase">
                                    Categories
                                </p>
                                {sidebarCategories!.map((category) => (
                                    <div key={category.id}>
                                        <Link
                                            href={`/shop?category=${category.slug}`}
                                            className="block rounded-xl px-3 py-2 text-sm font-medium"
                                        >
                                            {category.name}
                                        </Link>
                                        {category.children?.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={`/shop?category=${child.slug}`}
                                                className="block rounded-xl py-1.5 pr-3 pl-7 text-sm text-ink-soft"
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                        {auth.user ? (
                            <button
                                type="button"
                                className="mt-2 block w-full rounded-xl border-t border-line px-3 py-2.5 text-left"
                                onClick={() => logout.post('/logout')}
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="block rounded-xl px-3 py-2.5"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                )}
            </header>

            <FlashBanner />
            <div className="mx-auto flex max-w-[1600px] items-start gap-6 lg:px-8">
                {sidebarCategories && (
                    <StoreSidebar
                        categories={sidebarCategories}
                        activeSlug={activeCategory}
                        allActive={path === '/shop'}
                    />
                )}
                <main className="min-w-0 flex-1">{children}</main>
            </div>

            <footer className="mt-20 bg-sky-deep text-ink">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
                    <div>
                        {footer?.logo ? (
                            <img
                                src={footer.logo}
                                alt={name}
                                className="h-16 w-auto max-w-[220px] object-contain"
                            />
                        ) : (
                            <p className="font-display text-3xl font-semibold text-leaf">
                                {name}
                            </p>
                        )}
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
                            {footer?.blurb}
                        </p>
                    </div>
                    <div>
                        <p className="font-display text-lg font-semibold">
                            {footer?.links_title || 'Quick links'}
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-ink-soft">
                            <Link
                                href="/shop"
                                className="block hover:text-leaf-deep"
                            >
                                All products
                            </Link>
                            <Link
                                href="/about"
                                className="block hover:text-leaf-deep"
                            >
                                About Us
                            </Link>
                            <Link
                                href="/contact"
                                className="block hover:text-leaf-deep"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                    <div>
                        <p className="font-display text-lg font-semibold">
                            {footer?.support_title || 'Customer Support'}
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-ink-soft">
                            <p>Hotline: {footer?.hotline}</p>
                            <p>Email: {footer?.email}</p>
                            <p>{footer?.note}</p>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/60 py-4 text-center text-xs text-ink-soft">
                    © {new Date().getFullYear()} {name}.{' '}
                    {footer?.copyright_suffix}
                </div>
            </footer>
        </div>
    );
}
