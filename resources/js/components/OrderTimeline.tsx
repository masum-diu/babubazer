import { Check, ClipboardList, PackageCheck, Truck, XCircle } from 'lucide-react';
import { Home } from 'lucide-react';

const steps = [
    {
        key: 'pending',
        label: 'Order placed',
        hint: 'We received your order',
        icon: ClipboardList,
    },
    {
        key: 'confirmed',
        label: 'Confirmed',
        hint: 'Your order is confirmed',
        icon: PackageCheck,
    },
    {
        key: 'shipped',
        label: 'Shipped',
        hint: 'On its way to you',
        icon: Truck,
    },
    {
        key: 'delivered',
        label: 'Delivered',
        hint: 'Order delivered',
        icon: Home,
    },
];

export const statusMessage: Record<string, string> = {
    pending:
        'We have received your order and will confirm it shortly. Please keep your phone nearby.',
    confirmed: 'Your order is confirmed and is being prepared.',
    shipped: 'Your order has been handed to the courier and is on its way.',
    delivered: 'Your order has been delivered. Thank you for shopping with us!',
    cancelled: 'This order was cancelled.',
};

export function OrderTimeline({ status }: { status: string }) {
    if (status === 'cancelled') {
        return (
            <div className="flex items-center gap-3 rounded-2xl bg-blush px-4 py-4 text-[#c0344c]">
                <XCircle className="size-6 shrink-0" />
                <div>
                    <p className="text-sm font-semibold">Order cancelled</p>
                    <p className="text-xs">
                        If you did not ask for this, please contact us.
                    </p>
                </div>
            </div>
        );
    }

    const current = Math.max(
        0,
        steps.findIndex((step) => step.key === status),
    );

    return (
        <ol className="grid grid-cols-4 gap-1">
            {steps.map((step, index) => {
                const done = index < current;
                const active = index === current;
                const Icon = step.icon;

                return (
                    <li
                        key={step.key}
                        className="relative flex flex-col items-center text-center"
                        aria-current={active ? 'step' : undefined}
                    >
                        {index > 0 && (
                            <span
                                aria-hidden="true"
                                className={`absolute top-5 right-1/2 h-1 w-full -translate-y-1/2 rounded-full ${
                                    index <= current ? 'bg-leaf' : 'bg-line'
                                }`}
                            />
                        )}
                        <span
                            className={`relative z-10 inline-flex size-10 items-center justify-center rounded-full transition ${
                                done
                                    ? 'bg-leaf text-white'
                                    : active
                                      ? 'bg-leaf text-white ring-4 ring-leaf/25'
                                      : 'bg-white text-ink-soft ring-2 ring-line'
                            }`}
                        >
                            {done ? (
                                <Check className="size-5" />
                            ) : (
                                <Icon className="size-5" />
                            )}
                        </span>
                        <span
                            className={`mt-2 text-xs font-semibold sm:text-sm ${
                                done || active ? 'text-ink' : 'text-ink-soft'
                            }`}
                        >
                            {step.label}
                        </span>
                        <span className="mt-0.5 hidden text-[11px] text-ink-soft sm:block">
                            {step.hint}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}
