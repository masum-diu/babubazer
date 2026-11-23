import { Head, Link, useForm } from '@inertiajs/react';
import StoreLayout from '@/layouts/StoreLayout';

export default function ForgotPassword() {
    const form = useForm({ email: '' });

    return (
        <StoreLayout>
            <Head title="Forgot password" />

            <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
                <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                    Account
                </p>
                <h1 className="mt-2 font-display text-4xl text-ink">
                    Forgot password
                </h1>
                <p className="mt-3 text-sm text-ink-soft">
                    Enter your email and we will send you a link to choose a new
                    password.
                </p>

                <form
                    className="mt-8 space-y-4 rounded-[2rem] border border-line bg-white/85 p-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/forgot-password', {
                            preserveScroll: true,
                            onSuccess: () => form.reset(),
                        });
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
                            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-leaf"
                        />
                        {form.errors.email && (
                            <p className="mt-1 text-xs text-coral">
                                {form.errors.email}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-white hover:bg-coral-deep disabled:opacity-50"
                    >
                        Send reset link
                    </button>
                    <p className="text-center text-sm text-ink-soft">
                        Remembered it?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-leaf-deep"
                        >
                            Back to login
                        </Link>
                    </p>
                </form>
            </div>
        </StoreLayout>
    );
}
