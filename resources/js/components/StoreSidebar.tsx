import { Link } from '@inertiajs/react';
import { Info, LayoutGrid, Mail, Plus, Minus, Store } from 'lucide-react';
import { useState } from 'react';

export type SidebarCategory = {
    id: number;
    name: string;
    slug: string;
    children?: Array<{ id: number; name: string; slug: string }>;
};

const topLinks = [
    { label: 'Home', href: '/', icon: Store },
    { label: 'About', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: Mail },
];

export function StoreSidebar({
    categories,
    activeSlug,
    allActive = false,
}: {
    categories: SidebarCategory[];
    activeSlug?: string | null;
    allActive?: boolean;
}) {
    const [closed, setClosed] = useState<number[]>([]);

    const toggle = (id: number) =>
        setClosed((current) =>
            current.includes(id)
                ? current.filter((x) => x !== id)
                : [...current, id],
        );

    const itemBase =
        'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition';

    return (
        <aside className="sticky top-22 mt-6 hidden max-h-[calc(100vh-104px)] w-60 shrink-0 self-start overflow-y-auto rounded-2xl bg-white p-3 ring-1 ring-line lg:block">
            <nav className="space-y-0.5">
                {topLinks.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`${itemBase} gap-3 text-ink hover:bg-mist`}
                    >
                        <Icon className="size-[18px] text-leaf" />
                        {label}
                    </Link>
                ))}
            </nav>

            <div className="my-3 border-t border-line" />

            <nav className="space-y-0.5">
                <Link
                    href="/shop"
                    className={`${itemBase} gap-3 ${
                        allActive && !activeSlug
                            ? 'bg-leaf/12 font-semibold text-leaf-deep'
                            : 'text-ink hover:bg-mist'
                    }`}
                >
                    <LayoutGrid className="size-[18px]" />
                    All Products
                </Link>

                {categories.map((category) => {
                    const hasChildren = (category.children?.length ?? 0) > 0;
                    const isOpen = !closed.includes(category.id);
                    const isActive = activeSlug === category.slug;

                    return (
                        <div key={category.id}>
                            <div
                                className={`flex items-center rounded-lg transition ${
                                    isActive
                                        ? 'bg-leaf/12 text-leaf-deep'
                                        : 'text-ink hover:bg-mist'
                                }`}
                            >
                                <Link
                                    href={`/shop?category=${category.slug}`}
                                    className="flex-1 px-3 py-2 text-sm font-medium"
                                >
                                    {category.name}
                                </Link>
                                {hasChildren && (
                                    <button
                                        type="button"
                                        onClick={() => toggle(category.id)}
                                        aria-label={`Toggle ${category.name}`}
                                        aria-expanded={isOpen}
                                        className="px-3 py-2 text-ink-soft hover:text-ink"
                                    >
                                        {isOpen ? (
                                            <Minus className="size-3.5" />
                                        ) : (
                                            <Plus className="size-3.5" />
                                        )}
                                    </button>
                                )}
                            </div>

                            {hasChildren && isOpen && (
                                <div className="mt-0.5 mb-1 ml-4 space-y-0.5 border-l border-line pl-2">
                                    {category.children!.map((child) => (
                                        <Link
                                            key={child.id}
                                            href={`/shop?category=${child.slug}`}
                                            className={`block rounded-lg px-3 py-1.5 text-sm transition ${
                                                activeSlug === child.slug
                                                    ? 'bg-leaf/12 font-semibold text-leaf-deep'
                                                    : 'text-ink-soft hover:bg-mist hover:text-ink'
                                            }`}
                                        >
                                            {child.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
