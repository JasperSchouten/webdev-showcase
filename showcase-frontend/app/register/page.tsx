//app/register/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Window } from '@/components/Window';

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        userName: '',
        password: ''
    });

    const [status, setStatus] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setStatus('Creating account...');

        try {
            const apiBase =
                process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5162';

            const res = await fetch(`${apiBase}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const message = await res.text();
                throw new Error(message || 'Registration failed');
            }

            setStatus('Account created! Redirecting to login...');

            setTimeout(() => {
                router.push('/login');
            }, 1000);
        } catch (err: any) {
            setStatus(err.message ?? 'Something went wrong.');
        }
    };

    return (
        <main className="min-h-screen bg-[#008080] p-4 pb-24">
            <div className="mx-auto max-w-md">
                <Window title="register.exe">
                    <h1 className="mb-6 text-2xl font-bold"
                        data-testid="register-header"
                    >
                        Create Account
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block font-medium">
                                Username
                            </label>

                            <input
                                name="userName"
                                value={form.userName}
                                onChange={handleChange}
                                className="win95-input"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="win95-input"
                                required
                            />
                        </div>

                        <button type="submit" className="win95-button">
                            Register
                        </button>
                    </form>

                    {status && (
                        <p className="mt-4 font-medium">
                            {status}
                        </p>
                    )}

                    <p className="mt-6 text-sm">
                        Already have an account?{' '}
                        <a href="/login" className="underline">
                            Login here
                        </a>
                    </p>
                </Window>
            </div>
        </main>
    );
}