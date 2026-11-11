import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function AdminLogin() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const fieldClass =
        'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-leaf';

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0c242b] px-4 py-12 text-white">
            <Head title="Admin login" />
            <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur sm:p-9">
                <p className="text-sm tracking-[0.2em] text-leaf uppercase">
                    BabuBazer
                </p>
                <h1 className="mt-2 font-display text-4xl">Admin login</h1>
                <p className="mt-3 text-sm text-white/60">
                    Sign in to open the control room.
                </p>

                <form
                    className="mt-8 space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post('/admin/login');
                    }}
                >
                    <div>
                        <input
                            required
                            type="email"
                            autoComplete="section-admin username"
                            placeholder="Admin email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
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
                            autoComplete="section-admin current-password"
                            placeholder="Password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
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
                            className="absolute inset-y-0 right-3 flex items-center text-white/60 hover:text-white"
                        >
                            {passwordVisible ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-white/65">
                        <input
                            type="checkbox"
                            checked={form.data.remember}
                            onChange={(event) =>
                                form.setData('remember', event.target.checked)
                            }
                            className="accent-leaf"
                        />
                        Remember me
                    </label>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded-full bg-leaf py-3 text-sm font-semibold text-white hover:bg-leaf-deep disabled:opacity-50"
                    >
                        Sign in to control room
                    </button>
                </form>
            </section>
        </main>
    );
}
