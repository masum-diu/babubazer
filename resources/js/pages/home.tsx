import { Head, Link } from '@inertiajs/react';
import { Banknote, ShieldCheck, Truck } from 'lucide-react';
import { ProductCard, type ProductCardData } from '@/components/ProductCard';
import StoreLayout from '@/layouts/StoreLayout';

const promiseIcons = [Truck, Banknote, ShieldCheck];
const promiseAccents = [
    'bg-leaf/12 text-leaf-deep',
    'bg-coral/12 text-coral-deep',
    'bg-sun/25 text-ink',
];

type Category = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    children?: Array<{ id: number; name: string; slug: string }>;
};

type HomeContent = Record<string, string>;

export default function Home({
    content,
    categories,
    featured,
}: {
    content: HomeContent;
    categories: Category[];
    featured: ProductCardData[];
}) {
    const promises = [1, 2, 3].map((n, index) => ({
        icon: promiseIcons[index],
        accent: promiseAccents[index],
        title: content[`promise_${n}_title`],
        text: content[`promise_${n}_text`],
    }));

    return (
        <StoreLayout>
            <Head title="Home" />

            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={content.hero_image}
                        alt={content.hero_brand || 'BabuBazer'}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-transparent" />
                </div>

                <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-4 py-16 sm:px-6 lg:px-8">
                    <div className="max-w-xl text-white">
                        <p className="font-display text-5xl leading-none tracking-tight sm:text-6xl md:text-7xl">
                            {content.hero_brand}
                        </p>
                        <h1 className="mt-5 text-2xl leading-snug font-medium sm:text-3xl">
                            {content.hero_title}
                        </h1>
                        <p className="mt-4 max-w-md text-base text-white/80">
                            {content.hero_text}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={content.hero_cta_primary_url || '/shop'}
                                className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition hover:bg-coral-deep"
                            >
                                {content.hero_cta_primary}
                            </Link>
                            <Link
                                href={content.hero_cta_secondary_url || '/shop'}
                                className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                            >
                                {content.hero_cta_secondary}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                            {content.categories_eyebrow}
                        </p>
                        <h2 className="font-display mt-2 text-3xl text-ink">
                            {content.categories_title}
                        </h2>
                    </div>
                    <Link
                        href="/shop"
                        className="ml-auto text-sm font-medium text-leaf-deep"
                    >
                        View all →
                    </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/shop?category=${category.slug}`}
                            className="group relative min-h-44 overflow-hidden rounded-[1.75rem]"
                        >
                            {category.image && (
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" />
                            <div className="relative flex h-full flex-col justify-end p-5 text-white">
                                <h3 className="font-display text-2xl">
                                    {category.name}
                                </h3>
                                <p className="mt-1 text-sm text-white/75">
                                    {category.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm tracking-[0.2em] text-coral uppercase">
                            {content.featured_eyebrow}
                        </p>
                        <h2 className="font-display mt-2 text-3xl">
                            {content.featured_title}
                        </h2>
                    </div>
                    <Link
                        href="/shop"
                        className="ml-auto text-sm font-medium text-leaf-deep"
                    >
                        View all →
                    </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {featured.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            <section className="relative overflow-hidden border-y border-line/70">
                <div className="absolute inset-0 bg-gradient-to-br from-foam via-white/80 to-mist" />
                <div className="absolute -top-16 right-0 h-48 w-48 rounded-full bg-sun/20 blur-3xl" />
                <div className="absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-leaf/15 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="mb-10 max-w-xl">
                        <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                            {content.promises_eyebrow}
                        </p>
                        <h2 className="font-display mt-2 text-3xl text-ink">
                            {content.promises_title}
                        </h2>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
                        {promises.map((item) => (
                            <div
                                key={item.title}
                                className="group flex flex-col items-start sm:items-center sm:text-center"
                            >
                                <span
                                    className={`inline-flex size-14 items-center justify-center rounded-2xl ${item.accent} transition duration-300 group-hover:-translate-y-1`}
                                >
                                    <item.icon
                                        className="size-6"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                <p className="font-display mt-5 text-xl leading-snug text-ink">
                                    {item.title}
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </StoreLayout>
    );
}
