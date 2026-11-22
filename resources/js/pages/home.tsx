import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ProductCard, type ProductCardData } from '@/components/ProductCard';
import StoreLayout from '@/layouts/StoreLayout';

const promiseIcons = [Truck, Banknote, ShieldCheck];
const promiseAccents = [
    'bg-sky text-ink',
    'bg-blush text-ink',
    'bg-sun/40 text-ink',
];
const categoryTints = ['bg-sky', 'bg-blush', 'bg-sun/35'];

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
    const railRef = useRef<HTMLDivElement>(null);
    const scrollRail = (dir: number) =>
        railRef.current?.scrollBy({
            left: dir * (railRef.current.clientWidth * 0.8),
            behavior: 'smooth',
        });
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
                className="relative mx-4 mt-4 overflow-hidden rounded-2xl sm:mx-6 sm:mt-6 lg:mx-0"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    </div>
                ))}

                <div
                    className="relative flex aspect-[4/5] items-end justify-center px-5 pb-14 text-center sm:aspect-[16/9] sm:pb-16 lg:aspect-[2.3/1]"
                    aria-live="polite"
                >
                    <div className="max-w-3xl text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.45)]">
                        <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                            {slides[activeSlide].brand}
                        </h1>
                        <p className="mt-2 text-sm font-medium sm:text-xl lg:text-2xl">
                            {slides[activeSlide].title}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-5">
                            <Link
                                href={slides[activeSlide].primary_url}
                                className="inline-block bg-leaf px-6 py-3 text-xs font-bold tracking-[0.2em] text-white uppercase transition [text-shadow:none] hover:bg-leaf-deep sm:px-9"
                            >
                                {slides[activeSlide].primary}
                            </Link>
                            <Link
                                href={slides[activeSlide].secondary_url}
                                className="inline-block border border-white bg-white/10 px-6 py-3 text-xs font-bold tracking-[0.2em] text-white uppercase backdrop-blur-sm transition [text-shadow:none] hover:bg-white hover:text-black sm:px-9"
                            >
                                {slides[activeSlide].secondary}
                            </Link>
                        </div>
                    </div>
                </div>

                {slides.length > 1 && (
                    <>
                        <div
                            className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-2"
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
                    </>
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
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {categories.map((category, index) => (
                        <Link
                            key={category.id}
                            href={`/shop?category=${category.slug}`}
                            className={`group flex flex-col overflow-hidden rounded-3xl p-3 transition hover:-translate-y-1 hover:shadow-lg ${categoryTints[index % categoryTints.length]}`}
                        >
                            <div className="aspect-square overflow-hidden rounded-2xl bg-white/50">
                                {category.image && (
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                )}
                            </div>
                            <span className="mt-3 rounded-full bg-white/70 px-3 py-1.5 text-center text-sm font-semibold text-ink">
                                {category.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs tracking-[0.2em] text-leaf-deep uppercase">
                            {content.featured_eyebrow}
                        </p>
                        <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
                            {content.featured_title}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/shop"
                            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-leaf px-4 text-sm font-semibold text-white transition hover:bg-leaf-deep"
                        >
                            View All
                            <ArrowRight className="size-3.5" />
                        </Link>
                        <button
                            type="button"
                            aria-label="Scroll left"
                            onClick={() => scrollRail(-1)}
                            className="hidden size-9 items-center justify-center rounded-full bg-white ring-1 ring-line transition hover:ring-leaf sm:inline-flex"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="Scroll right"
                            onClick={() => scrollRail(1)}
                            className="hidden size-9 items-center justify-center rounded-full bg-white ring-1 ring-line transition hover:ring-leaf sm:inline-flex"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                </div>
                <div
                    ref={railRef}
                    className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {featured.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23.5%]"
                        />
                    ))}
                </div>
            </section>

            <section className="relative overflow-hidden border-y border-line/70">
                <div className="absolute inset-0 bg-gradient-to-br from-sky/40 via-mist to-blush/50" />

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
