import { Head, Link, useForm } from '@inertiajs/react';
import StoreLayout from '@/layouts/StoreLayout';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const form = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const fieldClass =
        'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-leaf';

    return (
        <StoreLayout>
            <Head title="Reset password" />

            <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
                <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                    Account
                </p>
                <h1 className="mt-2 font-display text-4xl text-ink">
                    Choose a new password
                </h1>

                <form
                    className="mt-8 space-y-4 rounded-[2rem] border border-line bg-white/85 p-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/reset-password');
                    }}
                >
                    <div>
                        <input
                            required
                            type="email"
                            autoComplete="email"
                            placeholder="Email address"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            className={fieldClass}
                        />
                        {form.errors.email && (
                            <p className="mt-1 text-xs text-coral">
                                {form.errors.email}
                            </p>
                        )}
                    </div>
                    <div>
                        <input
                            required
                            type="password"
                            autoComplete="new-password"
                            placeholder="New password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            className={fieldClass}
                        />
                        {form.errors.password && (
                            <p className="mt-1 text-xs text-coral">
                                {form.errors.password}
                            </p>
                        )}
                    </div>
                    <input
                        required
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        value={form.data.password_confirmation}
                        onChange={(e) =>
                            form.setData('password_confirmation', e.target.value)
                        }
                        className={fieldClass}
                    />
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-white hover:bg-coral-deep disabled:opacity-50"
                    >
                        Reset password
                    </button>
                    <p className="text-center text-sm text-ink-soft">
                        <Link
                            href="/forgot-password"
                            className="font-medium text-leaf-deep"
                        >
                            Request a new link
                        </Link>
                    </p>
                </form>
            </div>
        </StoreLayout>
    );
}
