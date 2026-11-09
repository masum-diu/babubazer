import { Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    FileText,
    FolderTree,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Palette,
    Ruler,
    ShoppingBag,
    Store,
    X,
} from 'lucide-react';
import { type PropsWithChildren, useState } from 'react';
import { FlashBanner } from '@/components/FlashBanner';

const links = [
    {
        href: '/admin',
        label: 'Overview',
        hint: 'Home',
        icon: LayoutDashboard,
    },
    {
        href: '/admin/products',
        label: 'Catalog',
        hint: 'Items',
        icon: Package,
    },
    {
        href: '/admin/categories',
        label: 'Groups',
        hint: 'Tree',
        icon: FolderTree,
    },
    {
        href: '/admin/colors',
        label: 'Colors',
        hint: 'Swatches',
        icon: Palette,
    },
    {
        href: '/admin/sizes',
        label: 'Sizes',
        hint: 'Fit',
        icon: Ruler,
    },
    {
        href: '/admin/orders',
        label: 'Sales',
        hint: 'Orders',
        icon: ShoppingBag,
    },
    {
        href: '/admin/pages',
        label: 'Pages',
        hint: 'Content',
        icon: FileText,
    },
];

function isActive(pathname: string, href: string) {
    if (href === '/admin') {
        return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({
    children,
    title,
    backHref,
    backLabel = 'Back',
}: PropsWithChildren<{
    title: string;
    backHref?: string;
    backLabel?: string;
}>) {
    const page = usePage();
    const { name, auth } = page.props as {
        name: string;
        auth?: { user?: { name?: string } | null };
    };
    const pathname = page.url.split('?')[0];
    const logout = useForm({});
    const [menuOpen, setMenuOpen] = useState(false);

    const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
        <nav className="space-y-1.5">
            {links.map((link) => {
                const active = isActive(pathname, link.href);
                const Icon = link.icon;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={onNavigate}
                        className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm transition ${
                            active
                                ? 'bg-leaf text-white shadow-[0_12px_28px_-16px_rgba(31,138,112,0.9)]'
                                : 'text-white/70 hover:bg-white/8 hover:text-white'
                        }`}
                    >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                        <span className="min-w-0 flex-1 font-medium">
                            {link.label}
                        </span>
                        <span
                            className={`text-[10px] tracking-[0.16em] uppercase ${
                                active ? 'text-white/70' : 'text-white/35'
                            }`}
                        >
                            {link.hint}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0c242b] text-ink print:overflow-visible print:bg-white">
            <div className="pointer-events-none absolute inset-0 print:hidden">
                <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-leaf/25 blur-3xl" />
                <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-coral/20 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sun/15 blur-3xl" />
            </div>

            <div className="relative mx-auto flex min-h-screen max-w-[1400px] gap-0 lg:gap-6 lg:px-4 lg:py-4 print:block print:max-w-none print:p-0">
                <aside className="hidden w-72 shrink-0 flex-col rounded-[1.75rem] border border-white/10 bg-ink/80 p-5 backdrop-blur-xl lg:flex print:hidden">
                    <Link
                        href="/admin"
                        prefetch={false}
                        className="block"
                        onClick={(e) => {
                            if (pathname === '/admin' || pathname === '/admin/') {
                                e.preventDefault();
                            }
                        }}
                    >
                        <span className="font-display block text-xl leading-none text-white">
                            {name}
                        </span>
                        <span className="mt-1 block text-[11px] tracking-[0.18em] text-white/45 uppercase">
                            Control room
                        </span>
                    </Link>

                    <div className="mt-8 flex-1">
                        <p className="mb-3 px-1 text-[11px] tracking-[0.2em] text-white/35 uppercase">
                            Navigate
                        </p>
                        <NavLinks />
                    </div>

                    <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm text-white/65 transition hover:bg-white/8 hover:text-white"
                        >
                            <Store className="h-4 w-4" />
                            Storefront
                        </Link>
                        <button
                            type="button"
                            onClick={() => logout.post('/logout')}
                            className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-sm text-coral transition hover:bg-coral/10"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </aside>

                <div className="min-w-0 flex-1 lg:py-0 print:w-full">
                    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0c242b]/85 px-4 py-3 backdrop-blur-xl lg:static lg:mb-4 lg:rounded-[1.75rem] lg:border lg:bg-ink/55 lg:px-5 lg:py-4 print:hidden">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <Link
                                    href="/admin"
                                    prefetch={false}
                                    className="mb-2 block lg:hidden"
                                >
                                    <span className="font-display text-lg leading-none text-white">
                                        {name}
                                    </span>
                                    <span className="mt-0.5 block text-[10px] tracking-[0.18em] text-white/45 uppercase">
                                        Control room
                                    </span>
                                </Link>
                                {backHref && (
                                    <Link
                                        href={backHref}
                                        className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        {backLabel}
                                    </Link>
                                )}
                                <p className="text-[11px] tracking-[0.2em] text-leaf uppercase">
                                    Admin
                                </p>
                                <h1 className="font-display truncate text-2xl text-white sm:text-3xl">
                                    {title}
                                </h1>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 sm:block">
                                    {auth?.user?.name || 'Admin'}
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2 text-sm text-white lg:hidden"
                                    onClick={() => setMenuOpen((v) => !v)}
                                >
                                    {menuOpen ? (
                                        <X className="h-4 w-4" />
                                    ) : (
                                        <Menu className="h-4 w-4" />
                                    )}
                                    {menuOpen ? 'Close' : 'Menu'}
                                </button>
                            </div>
                        </div>

                        {menuOpen && (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-ink/90 p-3 lg:hidden">
                                <NavLinks onNavigate={() => setMenuOpen(false)} />
                                <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
                                    <Link
                                        href="/"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70"
                                    >
                                        <Store className="h-4 w-4" />
                                        Storefront
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => logout.post('/logout')}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-coral"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </header>

                    <main className="px-4 pb-8 lg:px-0 print:p-0">
                        <div className="mb-4 print:hidden [&_.mx-auto]:mx-0 [&_.mx-auto]:max-w-none [&_.mx-auto]:px-0 [&_.pt-4]:pt-0">
                            <FlashBanner />
                        </div>
                        <div className="rounded-[1.75rem] border border-white/10 bg-mist/95 p-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)] backdrop-blur sm:p-6 print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
