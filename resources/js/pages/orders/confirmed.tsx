import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import StoreLayout from '@/layouts/StoreLayout';

export default function OrderConfirmed({
    orderNumber,
    firstName,
}: {
    orderNumber: string;
    firstName: string;
}) {
    const { auth } = usePage().props as unknown as {
        auth: { user: unknown | null };
    };

    return (
        <StoreLayout>
            <Head title="Order placed" />

            <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
                <span className="mx-auto inline-flex size-20 items-center justify-center rounded-full bg-leaf/15 text-leaf-deep">
                    <CheckCircle2 className="size-11" strokeWidth={1.75} />
                </span>

                <h1 className="mt-6 font-display text-3xl font-semibold text-ink sm:text-4xl">
                    Thank you{firstName ? `, ${firstName}` : ''}!
                </h1>
                <p className="mt-3 text-base text-ink-soft">
                    Your order has been placed successfully.
                </p>

                <p className="mt-5 inline-block rounded-full bg-white px-4 py-2 text-sm font-medium text-ink ring-1 ring-line">
                    Order number{' '}
                    <span className="font-semibold text-leaf-deep">
                        {orderNumber}
                    </span>
                </p>

                <p className="mt-5 text-sm text-ink-soft">
                    We will contact you shortly to confirm your order. Please
                    keep your phone nearby.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    {auth.user ? (
                        <Link
                            href={`/track-order/${orderNumber}`}
                            className="inline-flex h-11 items-center rounded-full bg-leaf px-7 text-sm font-semibold text-white transition hover:bg-leaf-deep"
                        >
                            Track your order
                        </Link>
                    ) : null}
                    <Link
                        href="/shop"
                        className={`inline-flex h-11 items-center rounded-full px-7 text-sm font-semibold transition ${
                            auth.user
                                ? 'border border-line bg-white text-ink hover:border-leaf'
                                : 'bg-leaf text-white hover:bg-leaf-deep'
                        }`}
                    >
                        Continue shopping
                    </Link>
                </div>
            </div>
        </StoreLayout>
    );
}
