import { Head, Link, useForm } from '@inertiajs/react';
import StoreLayout from '@/layouts/StoreLayout';

export default function Register() {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const fieldClass =
        'w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-leaf';

    return (
        <StoreLayout>
            <Head title="Register" />

            <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
                <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                    Account
                </p>
                <h1 className="font-display mt-2 text-4xl text-ink">
                    Register
                </h1>
                <p className="mt-3 text-sm text-ink-soft">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-leaf-deep">
                        Login
                    </Link>
                </p>

                <form
                    className="mt-8 space-y-4 rounded-[2rem] border border-line bg-white/85 p-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/register');
                    }}
                >
                    <div>
                        <input
                            required
                            placeholder="Full name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            className={fieldClass}
                        />
                        {form.errors.name && (
                            <p className="mt-1 text-xs text-coral">
                                {form.errors.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <input
                            required
                            type="email"
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
                            placeholder="Phone"
                            value={form.data.phone}
                            onChange={(e) =>
                                form.setData('phone', e.target.value)
                            }
                            className={fieldClass}
                        />
                        {form.errors.phone && (
                            <p className="mt-1 text-xs text-coral">
                                {form.errors.phone}
                            </p>
                        )}
                    </div>
                    <div>
                        <input
                            required
                            type="password"
                            placeholder="Password"
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
                        placeholder="Confirm password"
                        value={form.data.password_confirmation}
                        onChange={(e) =>
                            form.setData(
                                'password_confirmation',
                                e.target.value,
                            )
                        }
                        className={fieldClass}
                    />
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-white hover:bg-coral-deep disabled:opacity-50"
                    >
                        Create account
                    </button>
                </form>
            </div>
        </StoreLayout>
    );
}
