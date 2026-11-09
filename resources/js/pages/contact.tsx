import { Head, Link } from '@inertiajs/react';
import { Clock3, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import StoreLayout from '@/layouts/StoreLayout';

export default function Contact({
    content,
}: {
    content: Record<string, string>;
}) {
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const fieldClass =
        'w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-sm outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20';

    const phoneHref = `tel:${(content.phone || '').replace(/[^\d+]/g, '')}`;

    return (
        <StoreLayout>
            <Head title="Contact Us" />

            <section className="relative overflow-hidden border-b border-line/70">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(255,200,87,0.2),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(31,138,112,0.14),transparent_30%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                    <p className="font-display text-5xl leading-none text-ink sm:text-6xl">
                        {content.hero_brand}
                    </p>
                    <h1 className="mt-4 max-w-2xl text-2xl font-medium text-ink sm:text-3xl">
                        {content.hero_title}
                    </h1>
                    <p className="mt-3 max-w-xl text-ink-soft">
                        {content.hero_text}
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
                    <div className="space-y-8">
                        <div>
                            <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                                {content.reach_eyebrow}
                            </p>
                            <h2 className="font-display mt-2 text-3xl text-ink">
                                {content.reach_title}
                            </h2>
                        </div>

                        <div className="space-y-5">
                            <div className="flex gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foam text-leaf">
                                    <MapPin className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="font-medium text-ink">
                                        {content.address_label}
                                    </p>
                                    <p className="mt-1 text-sm text-ink-soft">
                                        {content.address}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foam text-leaf">
                                    <Phone className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="font-medium text-ink">
                                        {content.phone_label}
                                    </p>
                                    <a
                                        href={phoneHref}
                                        className="mt-1 block text-sm text-ink-soft hover:text-leaf-deep"
                                    >
                                        {content.phone}
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foam text-leaf">
                                    <Mail className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="font-medium text-ink">
                                        {content.email_label}
                                    </p>
                                    <a
                                        href={`mailto:${content.email}`}
                                        className="mt-1 block text-sm text-ink-soft hover:text-leaf-deep"
                                    >
                                        {content.email}
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foam text-leaf">
                                    <Clock3 className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="font-medium text-ink">
                                        {content.hours_label}
                                    </p>
                                    <p className="mt-1 text-sm text-ink-soft">
                                        {content.hours}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[1.75rem]">
                            <img
                                src={content.side_image}
                                alt="BabuBazer support"
                                className="aspect-[5/3] w-full object-cover"
                            />
                        </div>
                    </div>

                    <form
                        className="rounded-[2rem] border border-line bg-white/90 p-6 shadow-[0_30px_70px_-48px_rgba(18,50,58,0.45)] sm:p-8"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setSent(true);
                            setForm({
                                name: '',
                                email: '',
                                subject: '',
                                message: '',
                            });
                        }}
                    >
                        <p className="text-sm tracking-[0.18em] text-ink-soft uppercase">
                            {content.form_eyebrow}
                        </p>
                        <h2 className="font-display mt-2 text-3xl text-ink">
                            {content.form_title}
                        </h2>

                        {sent && (
                            <div className="mt-5 rounded-2xl border border-leaf/25 bg-leaf/10 px-4 py-3 text-sm text-leaf-deep">
                                {content.form_success}
                            </div>
                        )}

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <label className="block space-y-1.5 text-sm sm:col-span-1">
                                <span className="font-medium text-ink">
                                    Full name
                                </span>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    className={fieldClass}
                                />
                            </label>
                            <label className="block space-y-1.5 text-sm">
                                <span className="font-medium text-ink">
                                    Email
                                </span>
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    className={fieldClass}
                                />
                            </label>
                            <label className="block space-y-1.5 text-sm sm:col-span-2">
                                <span className="font-medium text-ink">
                                    Subject
                                </span>
                                <input
                                    required
                                    value={form.subject}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            subject: e.target.value,
                                        }))
                                    }
                                    className={fieldClass}
                                />
                            </label>
                            <label className="block space-y-1.5 text-sm sm:col-span-2">
                                <span className="font-medium text-ink">
                                    Message
                                </span>
                                <textarea
                                    required
                                    rows={6}
                                    value={form.message}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            message: e.target.value,
                                        }))
                                    }
                                    className={`${fieldClass} resize-y`}
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition hover:bg-coral-deep"
                            >
                                <Send className="h-4 w-4" />
                                {content.form_button}
                            </button>
                            <Link
                                href="/shop"
                                className="rounded-full px-4 py-3 text-sm font-medium text-ink-soft hover:text-ink"
                            >
                                Or keep shopping →
                            </Link>
                        </div>
                    </form>
                </div>
            </section>
        </StoreLayout>
    );
}
