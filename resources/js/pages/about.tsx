import { Head, Link } from '@inertiajs/react';
import { HeartHandshake, ShieldCheck, Truck } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';

const pillarIcons = [ShieldCheck, HeartHandshake, Truck];

export default function About({
    content,
}: {
    content: Record<string, string>;
}) {
    const pillars = [1, 2, 3].map((n, index) => ({
        icon: pillarIcons[index],
        title: content[`pillar_${n}_title`],
        text: content[`pillar_${n}_text`],
    }));

    return (
        <StoreLayout>
            <Head title="About Us" />

            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={content.hero_image}
                        alt={content.hero_brand || 'BabuBazer'}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/25" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,200,87,0.22),transparent_35%)]" />
                </div>

                <div className="relative mx-auto flex min-h-[58vh] max-w-7xl items-end px-4 py-16 sm:px-6 lg:px-8">
                    <div className="max-w-2xl text-white">
                        <p className="font-display text-5xl leading-none tracking-tight sm:text-6xl md:text-7xl">
                            {content.hero_brand}
                        </p>
                        <h1 className="mt-5 max-w-xl text-2xl leading-snug font-medium sm:text-3xl">
                            {content.hero_title}
                        </h1>
                        <p className="mt-4 max-w-lg text-base text-white/80">
                            {content.hero_text}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                    <div>
                        <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                            {content.story_eyebrow}
                        </p>
                        <h2 className="font-display mt-3 text-4xl text-ink sm:text-5xl">
                            {content.story_title}
                        </h2>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
                            {content.story_text}
                        </p>
                    </div>
                    <div className="relative overflow-hidden rounded-[2rem]">
                        <img
                            src={content.story_image}
                            alt={content.story_image_caption || 'About'}
                            className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-[1.03]"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-6">
                            <p className="font-display text-2xl text-white">
                                {content.story_image_caption}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-line/70 bg-white/55">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
                    {pillars.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="group"
                                style={{
                                    animationDelay: `${index * 80}ms`,
                                }}
                            >
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foam text-leaf transition group-hover:-translate-y-1 group-hover:bg-leaf group-hover:text-white">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-display text-2xl text-ink">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                                    {item.text}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink via-[#164048] to-leaf px-6 py-10 text-white sm:px-10">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-xl">
                            <p className="text-[11px] tracking-[0.2em] text-white/55 uppercase">
                                {content.cta_eyebrow}
                            </p>
                            <h2 className="font-display mt-2 text-3xl sm:text-4xl">
                                {content.cta_title}
                            </h2>
                            <p className="mt-3 text-sm text-white/75">
                                {content.cta_text}
                            </p>
                        </div>
                        <Link
                            href={content.cta_button_url || '/shop'}
                            className="inline-flex rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition hover:bg-coral-deep"
                        >
                            {content.cta_button}
                        </Link>
                    </div>
                </div>
            </section>
        </StoreLayout>
    );
}
