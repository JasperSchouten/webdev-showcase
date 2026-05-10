'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5162';
      const res = await fetch(`${apiBase}/api/mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FirstName: form.firstName,
          LastName: form.lastName,
          Email: form.email,
          Phone: form.phone
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }

      setStatus('sent');
      setForm({ firstName: '', lastName: '', email: '', phone: '' });
    } catch (err: any) {
      setStatus('error: ' + (err.message ?? 'unknown'));
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl mb-4">Contact</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Voornaam" required className="w-full" />
        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Achternaam" required className="w-full" />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="E-mail" className="w-full" />
        <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Telefoon" className="w-full" />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Verstuur</button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </main>
  );
}