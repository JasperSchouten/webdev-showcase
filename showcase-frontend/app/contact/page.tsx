// app/contact/page.tsx
'use client';

import { useState } from 'react';
import { Window } from '@/components/Window';

export default function ContactPage() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
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

        setStatus('Sending...');

        try {
            const apiBase =
                process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5162';

            const res = await fetch(`${apiBase}/api/mail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    FirstName: form.firstName,
                    LastName: form.lastName,
                    Email: form.email,
                    Phone: form.phone
                })
            });

            if (!res.ok) {
                throw new Error('Failed to send form');
            }

            setStatus('Message sent successfully.');
            setForm({
                firstName: '',
                lastName: '',
                email: '',
                phone: ''
            });
        } catch (err: any) {
            setStatus(err.message ?? 'Something went wrong.');
        }
    };

    return (
        <main className="min-h-screen bg-[#008080] p-4 pb-24">
            <div className="mx-auto max-w-2xl">
                <Window title="contact.exe">
                    <section aria-labelledby="contact-form-heading">
                        <h1
                            id="contact-form-heading"
                            className="mb-6 text-2xl font-bold"
                        >
                            Contact Me
                        </h1>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="mb-1 block font-medium"
                                >
                                    First Name
                                </label>

                                <input
                                    id="firstName"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    required
                                    className="win95-input"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="mb-1 block font-medium"
                                >
                                    Last Name
                                </label>

                                <input
                                    id="lastName"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    required
                                    className="win95-input"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1 block font-medium"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="win95-input"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-1 block font-medium"
                                >
                                    Phone
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="win95-input"
                                />
                            </div>

                            <button
                                type="submit"
                                className="win95-button"
                            >
                                Send
                            </button>
                        </form>

                        {status && (
                            <p className="mt-4 font-medium">
                                {status}
                            </p>
                        )}
                    </section>
                </Window>
            </div>
        </main>
    );
}