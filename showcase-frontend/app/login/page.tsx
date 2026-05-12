'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Window } from '@/components/Window';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get("message");

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

        setStatus('Logging in...');

        try {
            const apiBase =
                process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5162';

            const res = await fetch(`${apiBase}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await res.json();

            // todo: store token, should be http-only cookie
            localStorage.setItem('token', data.token);

            setStatus('Success!');

            router.push('/');
        } catch (err: any) {
            setStatus(err.message ?? 'Something went wrong.');
        }
    };

    return (
        <main className="min-h-screen bg-[#008080] p-4 pb-24">
            <div className="mx-auto max-w-md">
                <Window title="login.exe">
                    <h1 className="mb-6 text-2xl font-bold">
                        Login
                    </h1>

                    {message && (
                        <div className="mb-4 border-2 border-black bg-yellow-100 p-2">
                            {message}
                        </div>
                    )}

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
                            Login
                        </button>
                    </form>

                    {status && (
                        <p className="mt-4 font-medium">
                            {status}
                        </p>
                    )}

                    <p className="mt-6 text-sm">
                        Not registered yet?{' '}
                        <a
                            href="/register"
                            className="underline"
                        >
                            Create account
                        </a>
                    </p>
                </Window>
            </div>
        </main>
    );
}