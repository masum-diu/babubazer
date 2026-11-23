import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import StoreLayout from '@/layouts/StoreLayout';

export default function Login() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const fieldClass =
        'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-leaf';

    return (
        <StoreLayout>
            <Head title="Login" />

            <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
                <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                    Account
                </p>
                <h1 className="mt-2 font-display text-4xl text-ink">Login</h1>
                <p className="mt-3 text-sm text-ink-soft">
                    No account yet?{' '}
                    <Link
                        href="/register"
                        className="font-medium text-leaf-deep"
                    >
                        Register
                    </Link>
                </p>

                <form
                    className="mt-8 space-y-4 rounded-[2rem] border border-line bg-white/85 p-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/login');
                    }}
                >
                    <div>
                        <input
                            required
                            type="email"
                            autoComplete="section-customer username"
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
                    <div className="relative">
                        <input
                            required
                            type={passwordVisible ? 'text' : 'password'}
                            autoComplete="section-customer current-password"
                            placeholder="Password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            className={`${fieldClass} pr-12`}
                        />
                        <button
                            type="button"
                            aria-label={
                                passwordVisible
                                    ? 'Hide password'
                                    : 'Show password'
                            }
                            aria-pressed={passwordVisible}
                            onClick={() =>
                                setPasswordVisible((visible) => !visible)
                            }
                            className="absolute inset-y-0 right-3 flex items-center text-ink-soft hover:text-ink"
                        >
                            {passwordVisible ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm text-ink-soft">
                            <input
                                type="checkbox"
                                checked={form.data.remember}
                                onChange={(e) =>
                                    form.setData('remember', e.target.checked)
                                }
                                className="accent-leaf"
                            />
                            Remember me
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-leaf-deep"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-white hover:bg-coral-deep disabled:opacity-50"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <div className="flex items-center gap-3 text-xs text-ink-soft">
                        <span className="h-px flex-1 bg-line" />
                        or
                        <span className="h-px flex-1 bg-line" />
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post('/guest')}
                        className="mt-4 inline-flex w-full items-center justify-center rounded-full border-2 border-leaf py-2.5 text-sm font-semibold text-leaf-deep transition hover:bg-leaf hover:text-white"
                    >
                        Continue as guest
                    </button>
                    <p className="mt-2 text-[11px] text-ink-soft">
                        Order without an account. Wishlist and order history
                        need an account.
                    </p>
                </div>
            </div>
        </StoreLayout>
    );
}
