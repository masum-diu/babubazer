import { Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronDown,
    Headset,
    Heart,
    LogOut,
    Mail,
    Menu,
    Phone,
    Search,
    ShieldCheck,
    ShoppingBag,
    Star,
    Truck,
    User,
    X,
} from 'lucide-react';
import { type PropsWithChildren, useState } from 'react';
import { FlashBanner } from '@/components/FlashBanner';
import {
    FacebookIcon,
    InstagramIcon,
    YoutubeIcon,
} from '@/components/SocialIcons';
import { type SidebarCategory } from '@/lib/categories';

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
    topbar?: {
        announcement_1?: string;
        announcement_2?: string;
        announcement_3?: string;
        facebook_url?: string;
        instagram_url?: string;
        youtube_url?: string;
    };
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
        tagline?: string;
        newsletter_title?: string;
        newsletter_text?: string;
    };
};

const iconBtn =
    'relative inline-flex size-10 items-center justify-center rounded-full text-ink transition hover:bg-white/70';

function Newsletter({ title, text }: { title: string; text: string }) {
    const form = useForm({ email: '' });

    return (
        <div>
            <p className="font-display text-lg leading-snug font-semibold">
                {title}
            </p>
            <p className="mt-2 text-sm text-ink-soft">{text}</p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post('/newsletter', {
                        preserveScroll: true,
                        onSuccess: () => form.reset(),
                    });
                }}
                className="mt-4"
            >
                <div className="relative">
                    <input
                        type="email"
                        required
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        placeholder="Your Email"
                        className="h-11 w-full rounded-full border border-white bg-white pr-14 pl-5 text-sm outline-none focus:ring-2 focus:ring-leaf/40"
                    />
                    <button
                        type="submit"
                        disabled={form.processing}
                        aria-label="Subscribe"
                        className="absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-leaf text-white transition hover:bg-leaf-deep disabled:opacity-60"
                    >
                        <ArrowRight className="size-4" />
                    </button>
                </div>
                {form.errors.email && (
                    <p className="mt-1.5 pl-3 text-xs text-[#e0455b]">
                        {form.errors.email}
                    </p>
                )}
            </form>
        </div>
    );
}

export default function StoreLayout({ children }: PropsWithChildren) {
    const {
        name: appName,
        cartCount,
        auth,
        footer,
        navbar,
        topbar,
        sidebarCategories,
        wishlistIds = [],
    } = usePage().props as unknown as Shared;
    const { url } = usePage();
    const name = navbar?.brand_name || appName;
    const [menuOpen, setMenuOpen] = useState(false);
    const searchForm = useForm({ q: '' });
    const logout = useForm({});

    const path = url.split('?')[0];
    const query = new URLSearchParams(url.split('?')[1] ?? '');
    const activeCategory = path === '/shop' ? query.get('category') : null;
    const isHome = path === '/';

    const activePill = 'bg-leaf !text-white hover:!text-white';
    const categoryActive = (category: SidebarCategory) =>
        activeCategory !== null &&
        (activeCategory === category.slug ||
            Boolean(
                category.children?.some((child) => child.slug === activeCategory),
            ));
    const shopActive = path === '/shop' && !activeCategory;
    const subLink = (slug: string, base: string) =>
        `${base} ${
            activeCategory === slug
                ? 'bg-leaf/15 font-semibold !text-leaf-deep'
                : ''
        }`;

    const navCategories = (sidebarCategories ?? []).slice(0, 2);
    const moreCategories = (sidebarCategories ?? []).slice(2);

    const socials = [
        {
            key: 'facebook',
            url: topbar?.facebook_url,
            label: 'Facebook',
            fallback: 'https://www.facebook.com/',
            Icon: FacebookIcon,
            style: { background: '#1877f2' },
        },
        {
            key: 'instagram',
            url: topbar?.instagram_url,
            label: 'Instagram',
            fallback: 'https://www.instagram.com/',
            Icon: InstagramIcon,
            style: {
                background:
                    'linear-gradient(45deg,#f9a825 0%,#e91e63 55%,#9c27b0 100%)',
            },
        },
        {
            key: 'youtube',
            url: topbar?.youtube_url,
            label: 'YouTube',
            fallback: 'https://www.youtube.com/',
            Icon: YoutubeIcon,
            style: { background: '#ff0000' },
        },
    ];

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get('/shop', { preserveState: true });
    };

    const searchBox = (
        <form onSubmit={submitSearch} className="relative w-full">
            <input
                value={searchForm.data.q}
                onChange={(e) => searchForm.setData('q', e.target.value)}
                placeholder="Search for outfits..."
                className="h-10 w-full rounded-full border border-line bg-white pr-11 pl-5 text-sm transition outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/25"
            />
            <button
                type="submit"
                aria-label="Search"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-ink"
            >
                <Search className="size-5" />
            </button>
        </form>
    );

    const navLink =
        'inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap text-ink transition hover:text-leaf-deep';

    const SocialRow = ({ size = 'size-9' }: { size?: string }) => (
        <div className="flex items-center gap-2.5">
            {socials.map(({ key, url: href, label, Icon, style, fallback }) => (
                <a
                    key={key}
                    href={href || fallback}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    style={style}
                    className={`inline-flex ${size} items-center justify-center rounded-full text-white transition hover:scale-110`}
                >
                    <Icon className="size-1/2" />
                </a>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen">
            {/* Top announcement bar */}
            <div className="bg-sky text-xs text-ink">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center divide-x divide-ink/20">
                        <span className="inline-flex items-center gap-1.5 pr-4">
                            <Truck className="size-4 shrink-0" />
                            {topbar?.announcement_1 ??
                                'Free Delivery on Orders Above ৳1,000'}
                        </span>
                        <span className="hidden items-center gap-1.5 px-4 md:inline-flex">
                            <ShieldCheck className="size-4" />
                            {topbar?.announcement_2 ?? 'Easy Exchange'}
                        </span>
                        <span className="hidden items-center gap-1.5 px-4 md:inline-flex">
                            <Headset className="size-4" />
                            {topbar?.announcement_3 ?? '24/7 Support'}
                        </span>
                    </div>

                    {socials.length > 0 && (
                        <div className="hidden items-center gap-2.5 sm:flex">
                            <span className="font-medium">Follow Us:</span>
                            <SocialRow size="size-6" />
                        </div>
                    )}
                </div>
            </div>

            {/* Main navbar */}
            <header className="sticky top-0 z-40 border-b border-line bg-mist">
                <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
                    <button
                        type="button"
                        aria-label="Menu"
                        className={`${iconBtn} lg:hidden`}
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        {menuOpen ? (
                            <X className="size-5" />
                        ) : (
                            <Menu className="size-5" />
                        )}
                    </button>

                    <Link href="/" className="group shrink-0">
                        {navbar?.logo ? (
                            <img
                                src={navbar.logo}
                                alt={name}
                                className="h-14 w-auto max-w-65 object-contain"
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

                    <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
                        <Link
                            href="/"
                            className={`${navLink} ${isHome ? activePill : ''}`}
                        >
                            Home
                        </Link>

                        {navCategories.map((category) => (
                            <div
                                key={category.id}
                                className="group relative"
                            >
                                <Link
                                    href={`/shop?category=${category.slug}`}
                                    className={`${navLink} ${
                                        categoryActive(category)
                                            ? activePill
                                            : ''
                                    }`}
                                >
                                    {category.name}
                                    {(category.children?.length ?? 0) > 0 && (
                                        <ChevronDown className="size-3.5" />
                                    )}
                                </Link>
                                {(category.children?.length ?? 0) > 0 && (
                                    <div className="invisible absolute top-full left-0 z-50 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                                        <div className="min-w-52 rounded-2xl bg-white p-2 shadow-[0_18px_40px_-18px_rgba(36,50,74,0.4)] ring-1 ring-line">
                                            {category.children!.map((child) => (
                                                <Link
                                                    key={child.id}
                                                    href={`/shop?category=${child.slug}`}
                                                    className={subLink(
                                                        child.slug,
                                                        'block rounded-xl px-3 py-2 text-sm text-ink transition hover:bg-mist hover:text-leaf-deep',
                                                    )}
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {moreCategories.length > 0 && (
                            <div className="group relative">
                                <button
                                    type="button"
                                    className={`${navLink} ${
                                        moreCategories.some(categoryActive)
                                            ? activePill
                                            : ''
                                    }`}
                                >
                                    More
                                    <ChevronDown className="size-3.5" />
                                </button>
                                <div className="invisible absolute top-full left-0 z-50 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                                    <div className="max-h-[70vh] min-w-56 overflow-y-auto rounded-2xl bg-white p-2 shadow-[0_18px_40px_-18px_rgba(36,50,74,0.4)] ring-1 ring-line">
                                        {moreCategories.map((category) => (
                                            <div key={category.id}>
                                                <Link
                                                    href={`/shop?category=${category.slug}`}
                                                    className={subLink(
                                                        category.slug,
                                                        'block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mist hover:text-leaf-deep',
                                                    )}
                                                >
                                                    {category.name}
                                                </Link>
                                                {category.children?.map(
                                                    (child) => (
                                                        <Link
                                                            key={child.id}
                                                            href={`/shop?category=${child.slug}`}
                                                            className={subLink(
                                                                child.slug,
                                                                'block rounded-xl py-1.5 pr-3 pl-6 text-sm text-ink-soft transition hover:bg-mist hover:text-leaf-deep',
                                                            )}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    ),
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <Link
                            href="/shop"
                            className={`${navLink} ${shopActive ? activePill : ''}`}
                        >
                            Shop
                        </Link>
                    </nav>

                    <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
                        <div className="mr-1 hidden w-48 md:block xl:w-64">
                            {searchBox}
                        </div>

                        {auth.user ? (
                            <>
                                {auth.user.is_admin && (
                                    <Link
                                        href="/admin"
                                        prefetch={false}
                                        className="mr-1 hidden h-9 items-center rounded-full bg-sky px-3 text-xs font-semibold text-ink 2xl:inline-flex"
                                    >
                                        Control room
                                    </Link>
                                )}
                                <Link
                                    href="/account/orders"
                                    title={auth.user.name}
                                    className="inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-ink transition hover:bg-white/70"
                                >
                                    <User className="size-5" />
                                    <span className="hidden max-w-24 truncate xl:inline">
                                        {auth.user.name.split(' ')[0]}
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    aria-label="Logout"
                                    title="Logout"
                                    onClick={() => logout.post('/logout')}
                                    className={`${iconBtn} hidden sm:inline-flex`}
                                >
                                    <LogOut className="size-5" />
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                aria-label="Login"
                                title="Login"
                                className={iconBtn}
                            >
                                <User className="size-5" />
                            </Link>
                        )}

                        <Link
                            href="/wishlist"
                            aria-label="Wishlist"
                            title="Wishlist"
                            className={iconBtn}
                        >
                            <Heart className="size-5" />
                            {wishlistIds.length > 0 && (
                                <span className="absolute top-0 right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-leaf px-1 text-[10px] font-bold text-white">
                                    {wishlistIds.length}
                                </span>
                            )}
                        </Link>

                        <Link href="/cart" aria-label="Bag" className={iconBtn}>
                            <ShoppingBag className="size-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-leaf px-1 text-[10px] font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                <div className="border-t border-line px-4 py-2.5 md:hidden">
                    {searchBox}
                </div>

                {menuOpen && (
                    <div className="max-h-[70vh] space-y-1 overflow-y-auto border-t border-line bg-white px-4 py-3 lg:hidden">
                        {[
                            ['Home', '/'],
                            ['Shop', '/shop'],
                            ['About', '/about'],
                            ['Contact', '/contact'],
                        ].map(([label, href]) => (
                            <Link
                                key={href}
                                href={href}
                                className={`block rounded-xl px-3 py-2.5 font-medium ${
                                    (href === '/' && isHome) ||
                                    (href === '/shop' && shopActive) ||
                                    (href !== '/' &&
                                        href !== '/shop' &&
                                        path === href)
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
                                            className={subLink(
                                                category.slug,
                                                'block rounded-xl px-3 py-2 text-sm font-medium',
                                            )}
                                        >
                                            {category.name}
                                        </Link>
                                        {category.children?.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={`/shop?category=${child.slug}`}
                                                className={subLink(
                                                    child.slug,
                                                    'block rounded-xl py-1.5 pr-3 pl-7 text-sm text-ink-soft',
                                                )}
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}

                        {auth.user ? (
                            <>
                                <Link
                                    href="/account/orders"
                                    className="mt-2 block rounded-xl border-t border-line px-3 py-2.5"
                                >
                                    My Orders
                                </Link>
                                {auth.user.is_admin && (
                                    <Link
                                        href="/admin"
                                        prefetch={false}
                                        className="block rounded-xl px-3 py-2.5 font-medium text-leaf-deep"
                                    >
                                        Control room
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    className="block w-full rounded-xl px-3 py-2.5 text-left"
                                    onClick={() => logout.post('/logout')}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="mt-2 block rounded-xl border-t border-line px-3 py-2.5"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                )}
            </header>

            <FlashBanner />

            <div className="mx-auto max-w-[1600px] lg:px-8">
                <main className="min-w-0">{children}</main>
            </div>

            {/* Footer */}
            <footer className="relative mt-24 bg-sky-deep text-ink">
                <svg
                    viewBox="0 0 1440 48"
                    preserveAspectRatio="none"
                    className="absolute inset-x-0 -top-[47px] h-12 w-full fill-sky-deep"
                    aria-hidden="true"
                >
                    <path d="M0 48V26C160 4 320 0 480 14s320 30 480 18 320-26 480-10v26z" />
                </svg>

                <Star className="absolute top-6 left-3 size-5 text-sun" />
                <Star className="absolute top-8 right-4 size-6 text-sun" />
                <Star className="absolute bottom-6 left-6 size-5 text-sun" />
                <Star className="absolute right-6 bottom-8 size-5 text-sun" />

                <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-8 pb-8 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr_1.1fr_1.2fr] lg:gap-0 lg:px-8">
                    <div className="lg:pr-8">
                        {footer?.logo ? (
                            <img
                                src={footer.logo}
                                alt={name}
                                className="h-16 w-auto max-w-55 object-contain"
                            />
                        ) : (
                            <p className="font-display text-3xl font-semibold text-leaf">
                                {name}
                            </p>
                        )}
                        <p className="mt-3 text-sm font-semibold">
                            {footer?.tagline || footer?.blurb}
                        </p>
                        {socials.length > 0 && (
                            <div className="mt-4">
                                <SocialRow />
                            </div>
                        )}
                    </div>

                    <div className="lg:border-l lg:border-ink/15 lg:px-8">
                        <p className="font-display text-lg font-semibold">
                            {footer?.links_title || 'Quick Links'}
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-ink-soft">
                            <Link
                                href="/about"
                                className="block hover:text-leaf-deep"
                            >
                                About Us
                            </Link>
                            <Link
                                href="/shop"
                                className="block hover:text-leaf-deep"
                            >
                                Shop
                            </Link>
                            <Link
                                href="/contact"
                                className="block hover:text-leaf-deep"
                            >
                                Contact Us
                            </Link>
                            <Link
                                href="/wishlist"
                                className="block hover:text-leaf-deep"
                            >
                                My Wishlist
                            </Link>
                        </div>
                    </div>

                    <div className="lg:border-l lg:border-ink/15 lg:px-8">
                        <p className="font-display text-lg font-semibold">
                            {footer?.support_title || 'Customer Support'}
                        </p>
                        <div className="mt-3 space-y-2.5 text-sm text-ink-soft">
                            {footer?.hotline && (
                                <p className="flex items-center gap-2.5">
                                    <Phone className="size-4 shrink-0 text-ink" />
                                    {footer.hotline}
                                </p>
                            )}
                            {footer?.email && (
                                <p className="flex items-center gap-2.5">
                                    <Mail className="size-4 shrink-0 text-ink" />
                                    {footer.email}
                                </p>
                            )}
                            {footer?.note && <p>{footer.note}</p>}
                        </div>
                        {socials.length > 0 && (
                            <>
                                <p className="mt-5 font-display text-lg font-semibold">
                                    Follow Us
                                </p>
                                <div className="mt-3">
                                    <SocialRow />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="lg:border-l lg:border-ink/15 lg:pl-8">
                        <Newsletter
                            title={
                                footer?.newsletter_title ||
                                'Join Our Little Fashion Family!'
                            }
                            text={
                                footer?.newsletter_text ||
                                'Get updates on new arrivals and special offers.'
                            }
                        />
                    </div>
                </div>

                <p className="relative pb-5 text-center text-xs text-ink-soft">
                    © {new Date().getFullYear()} {name}.{' '}
                    {footer?.copyright_suffix}
                </p>

                <div className="relative h-9 bg-leaf">
                    <svg
                        viewBox="0 0 1440 30"
                        preserveAspectRatio="none"
                        className="absolute inset-x-0 -top-[29px] h-8 w-full fill-leaf"
                        aria-hidden="true"
                    >
                        <path d="M0 30V16C180 -2 360 0 540 13s360 12 540-2 270-10 360-4v27z" />
                    </svg>
                </div>
            </footer>
        </div>
    );
}
