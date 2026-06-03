'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '@/components/Spinner';
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from '@/lib/passwordPolicy';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!isValidPassword(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Reset failed');
      return;
    }
    router.push('/login');
    router.refresh();
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
        <h1 className="text-3xl font-bold text-valo-red mb-2">Reset Password</h1>
        <p className="text-gray-400 mb-6">Enter the code from your email and your new password.</p>
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
            <div>
              <label className="block text-sm text-gray-400 mb-1">Reset code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                pattern="[a-zA-Z0-9]{8,}"
                title={PASSWORD_POLICY_MESSAGE}
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                pattern="[a-zA-Z0-9]{8,}"
                title={PASSWORD_POLICY_MESSAGE}
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2 bg-valo-red hover:bg-red-600 rounded font-medium transition disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? <><Spinner className="w-4 h-4" /> Resetting...</> : 'Reset password'}
            </button>
          </form>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          <Link href="/login" className="text-valo-red hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
