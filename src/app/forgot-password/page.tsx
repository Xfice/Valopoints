'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/Spinner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Request failed');
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b-2 border-valo-red py-3 px-4" style={{ background: 'linear-gradient(180deg, var(--valo-dark) 0%, var(--valo-black) 100%)' }}>
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <Link href="/" className="font-bold text-valo-red">RankUp ValoPoints</Link>
          <div className="flex gap-4">
            <Link href="/prizes" className="text-gray-300 hover:text-valo-red">Prizes</Link>
            <Link href="/login" className="text-gray-400 hover:text-white">Login</Link>
          </div>
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="home-hero-images mb-4">
          <img src="/images/sprites/rankup.jfif" alt="Rank Up" className="home-hero-img" />
          <span className="valorant-img-wrap">
            <img src="/images/sprites/valorant.png" alt="Valorant" className="home-hero-img valorant-img" />
          </span>
        </div>
        <h1 className="text-3xl font-bold text-valo-red mb-2">Forgot Password</h1>
        <p className="text-gray-400 mb-6">Enter your email to receive a reset code.</p>
        {sent ? (
          <div className="w-full max-w-md bg-valo-panel border border-gray-600 rounded-lg p-6">
            <p className="text-green-400 mb-4">Check your email for the 6-digit code.</p>
            <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="text-valo-red hover:underline">Enter code to reset password</Link>
          </div>
        ) : (
          <div className="w-full max-w-md bg-valo-panel border border-gray-600 rounded-lg p-6 text-left">
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 bg-valo-red hover:bg-red-600 rounded font-medium transition disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? <><Spinner className="w-4 h-4" /> Sending...</> : 'Send reset code'}
              </button>
            </form>
          </div>
        )}
        <p className="mt-4 text-sm text-gray-500">
          <Link href="/login" className="text-valo-red hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
