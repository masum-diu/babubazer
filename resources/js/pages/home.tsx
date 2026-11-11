import { Head, Link } from '@inertiajs/react';
import { Banknote, ShieldCheck, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
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
type BannerSlide = {
    brand: string;
    title: string;
    text: string;
    image: string;
    primary: string;
    primary_url: string;
    secondary: string;
    secondary_url: string;
};

export default function Home({
    content,
    categories,
    featured,
    bannerSlides,
}: {
    content: HomeContent;
    categories: Category[];
    featured: ProductCardData[];
    bannerSlides: BannerSlide[];
}) {
    const slides = bannerSlides;
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        if (slides.length < 2) {
            return;
        }

        const timer = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % slides.length);
        }, 5000);

        return () => window.clearInterval(timer);
    }, [slides.length]);

    const showSlide = (index: number) => {
        setActiveSlide((index + slides.length) % slides.length);
    };

    const promises = [1, 2, 3].map((n, index) => ({
        icon: promiseIcons[index],
        accent: promiseAccents[index],
        title: content[`promise_${n}_title`],
        text: content[`promise_${n}_text`],
    }));

    return (
        <StoreLayout>
            <Head title="Home" />

            <section
                className="relative overflow-hidden"
                aria-label="Featured banners"
                aria-roledescription="carousel"
            >
                {slides.map((slide, index) => (
                    <div
                        key={`${slide.title}-${index}`}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                            activeSlide === index
                                ? 'opacity-100'
                                : 'pointer-events-none opacity-0'
                        }`}
                        aria-hidden={activeSlide !== index}
                    >
                        <img
                            src={slide.image}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-transparent" />
                    </div>
                ))}

                <div
                    className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-4 py-16 sm:px-6 lg:px-8"
                    aria-live="polite"
                >
                    <div className="max-w-xl text-white">
                        <p className="font-display text-5xl leading-none tracking-tight sm:text-6xl md:text-7xl">
                            {slides[activeSlide].brand}
                        </p>
                        <h1 className="mt-5 text-2xl leading-snug font-medium sm:text-3xl">
                            {slides[activeSlide].title}
                        </h1>
                        <p className="mt-4 max-w-md text-base text-white/80">
                            {slides[activeSlide].text}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={slides[activeSlide].primary_url}
                                className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition hover:bg-coral-deep"
                            >
                                {slides[activeSlide].primary}
                            </Link>
                            <Link
                                href={slides[activeSlide].secondary_url}
                                className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                            >
                                {slides[activeSlide].secondary}
                            </Link>
                        </div>
                    </div>
                </div>

                {slides.length > 1 && (
                    <div className="absolute right-4 bottom-6 left-4 z-10 mx-auto flex max-w-7xl justify-center sm:right-6 sm:left-6 lg:right-8 lg:left-8">
                        <div
                            className="flex items-center gap-2"
                            aria-label="Choose banner"
                        >
                            {slides.map((slide, index) => (
                                <button
                                    key={`${slide.title}-dot`}
                                    type="button"
                                    aria-label={`Go to banner ${index + 1}`}
                                    aria-current={
                                        activeSlide === index
                                            ? 'true'
                                            : undefined
                                    }
                                    onClick={() => showSlide(index)}
                                    className={`h-2.5 rounded-full transition-all ${
                                        activeSlide === index
                                            ? 'w-7 bg-white'
                                            : 'w-2.5 bg-white/55 hover:bg-white/80'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                            {content.categories_eyebrow}
                        </p>
                        <h2 className="mt-2 font-display text-3xl text-ink">
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
                        <h2 className="mt-2 font-display text-3xl">
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
                        <h2 className="mt-2 font-display text-3xl text-ink">
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
                                <p className="mt-5 font-display text-xl leading-snug text-ink">
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
