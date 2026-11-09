import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { formatBdt } from '@/lib/money';
import StoreLayout from '@/layouts/StoreLayout';

type Cart = {
    items: Array<{
        id: number;
        quantity: number;
        line_total: number;
        color?: { id: number; name: string; hex?: string | null } | null;
        size?: { id: number; name: string } | null;
        product: { name: string };
    }>;
    subtotal: number;
    shipping_fee: number;
    total: number;
};

type DivisionTree = Record<string, string[]>;

export default function Checkout({
    cart,
    user,
    divisionTree = {},
    shippingRates = { dhaka: 60, outside: 120 },
}: {
    cart: Cart;
    user: { name: string; email: string; phone?: string | null } | null;
    divisionTree?: DivisionTree;
    shippingRates?: { dhaka: number; outside: number };
}) {
    const divisions = useMemo(
        () => Object.keys(divisionTree),
        [divisionTree],
    );
    const defaultDivision = divisions.includes('Dhaka')
        ? 'Dhaka'
        : divisions[0] || '';
    const defaultDistrict =
        divisionTree[defaultDivision]?.find((d) => d === 'Dhaka') ||
        divisionTree[defaultDivision]?.[0] ||
        '';

    const form = useForm({
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
        shipping_address: '',
        division: defaultDivision,
        city: defaultDistrict,
        payment_method: 'cod',
        notes: '',
    });

    const districts = divisionTree[form.data.division] || [];
    const shippingFee =
        form.data.division === 'Dhaka'
            ? shippingRates.dhaka
            : shippingRates.outside;
    const orderTotal = Number(cart.subtotal) + shippingFee;

    const fieldClass =
        'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-leaf';

    return (
        <StoreLayout>
            <Head title="Checkout" />

            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr] sm:px-6 lg:px-8">
                <form
                    className="rounded-[2rem] border border-line bg-white/85 p-6 sm:p-8"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/checkout');
                    }}
                >
                    <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                        Checkout
                    </p>
                    <h1 className="font-display mt-2 text-3xl text-ink">
                        Delivery details
                    </h1>

                    <div className="mt-6 space-y-4">
                        <div>
                            <input
                                required
                                placeholder="Full name"
                                value={form.data.customer_name}
                                onChange={(e) =>
                                    form.setData(
                                        'customer_name',
                                        e.target.value,
                                    )
                                }
                                className={fieldClass}
                            />
                            {form.errors.customer_name && (
                                <p className="mt-1 text-xs text-coral">
                                    {form.errors.customer_name}
                                </p>
                            )}
                        </div>
                        <div>
                            <input
                                required
                                type="email"
                                placeholder="Email address"
                                value={form.data.customer_email}
                                onChange={(e) =>
                                    form.setData(
                                        'customer_email',
                                        e.target.value,
                                    )
                                }
                                className={fieldClass}
                            />
                            {form.errors.customer_email && (
                                <p className="mt-1 text-xs text-coral">
                                    {form.errors.customer_email}
                                </p>
                            )}
                        </div>
                        <div>
                            <input
                                required
                                placeholder="Phone"
                                value={form.data.customer_phone}
                                onChange={(e) =>
                                    form.setData(
                                        'customer_phone',
                                        e.target.value,
                                    )
                                }
                                className={fieldClass}
                            />
                            {form.errors.customer_phone && (
                                <p className="mt-1 text-xs text-coral">
                                    {form.errors.customer_phone}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-ink">
                                    Division
                                </label>
                                <select
                                    required
                                    value={form.data.division}
                                    onChange={(e) => {
                                        const nextDivision = e.target.value;
                                        const nextDistricts =
                                            divisionTree[nextDivision] || [];
                                        form.setData({
                                            ...form.data,
                                            division: nextDivision,
                                            city: nextDistricts[0] || '',
                                        });
                                    }}
                                    className={fieldClass}
                                >
                                    <option value="" disabled>
                                        Select division
                                    </option>
                                    {divisions.map((division) => (
                                        <option key={division} value={division}>
                                            {division}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.division && (
                                    <p className="mt-1 text-xs text-coral">
                                        {form.errors.division}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-ink">
                                    District
                                </label>
                                <select
                                    required
                                    value={form.data.city}
                                    onChange={(e) =>
                                        form.setData('city', e.target.value)
                                    }
                                    disabled={!form.data.division}
                                    className={`${fieldClass} disabled:opacity-50`}
                                >
                                    <option value="" disabled>
                                        Select district
                                    </option>
                                    {districts.map((district) => (
                                        <option key={district} value={district}>
                                            {district}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.city && (
                                    <p className="mt-1 text-xs text-coral">
                                        {form.errors.city}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div>
                            <textarea
                                required
                                rows={3}
                                placeholder="Delivery address"
                                value={form.data.shipping_address}
                                onChange={(e) =>
                                    form.setData(
                                        'shipping_address',
                                        e.target.value,
                                    )
                                }
                                className={fieldClass}
                            />
                            {form.errors.shipping_address && (
                                <p className="mt-1 text-xs text-coral">
                                    {form.errors.shipping_address}
                                </p>
                            )}
                        </div>

                        <fieldset>
                            <legend className="mb-2 text-sm font-medium text-ink">
                                Payment method
                            </legend>
                            <div className="space-y-2">
                                {[
                                    ['cod', 'Cash on delivery'],
                                    ['bkash', 'bKash'],
                                    ['nagad', 'Nagad'],
                                ].map(([value, label]) => (
                                    <label
                                        key={value}
                                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line px-4 py-3 text-sm"
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value={value}
                                            checked={
                                                form.data.payment_method ===
                                                value
                                            }
                                            onChange={() =>
                                                form.setData(
                                                    'payment_method',
                                                    value,
                                                )
                                            }
                                            className="accent-leaf"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <textarea
                            rows={2}
                            placeholder="Notes (optional)"
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData('notes', e.target.value)
                            }
                            className={fieldClass}
                        />

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-full bg-coral px-7 py-3 text-sm font-semibold text-white hover:bg-coral-deep disabled:opacity-50"
                        >
                            Place order
                        </button>
                    </div>
                </form>

                <aside className="h-fit rounded-[2rem] border border-line bg-white/85 p-6">
                    <h2 className="font-display text-2xl">Order summary</h2>
                    <div className="mt-4 space-y-3 text-sm">
                        {cart.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between gap-3"
                            >
                                <span className="text-ink-soft">
                                    {item.product.name}
                                    {(item.color || item.size) && (
                                        <>
                                            {' '}
                                            (
                                            {[
                                                item.color?.name,
                                                item.size?.name,
                                            ]
                                                .filter(Boolean)
                                                .join(' / ')}
                                            )
                                        </>
                                    )}{' '}
                                    × {item.quantity}
                                </span>
                                <span>{formatBdt(item.line_total)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between border-t border-line pt-3">
                            <span>Subtotal</span>
                            <span>{formatBdt(cart.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>
                                Delivery
                                <span className="mt-0.5 block text-[11px] font-normal text-ink-soft">
                                    {form.data.division === 'Dhaka'
                                        ? 'Inside Dhaka'
                                        : 'Outside Dhaka'}
                                </span>
                            </span>
                            <span>{formatBdt(shippingFee)}</span>
                        </div>
                        <p className="rounded-2xl bg-mist px-3 py-2 text-[11px] text-ink-soft">
                            Dhaka {formatBdt(shippingRates.dhaka)} · Outside
                            Dhaka {formatBdt(shippingRates.outside)}
                        </p>
                        <div className="flex justify-between text-base font-semibold">
                            <span>Total</span>
                            <span className="text-leaf-deep">
                                {formatBdt(orderTotal)}
                            </span>
                        </div>
                    </div>
                </aside>
            </div>
        </StoreLayout>
    );
}
