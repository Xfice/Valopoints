'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Spinner } from '@/components/Spinner';
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from '@/lib/passwordPolicy';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!isValidPassword(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || 'Registration failed');
      return;
    }
    const signInRes = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.ok) {
      router.push('/dashboard');
      router.refresh();
    } else {
      router.push('/login');
      router.refresh();
    }
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
        <h1 className="text-3xl font-bold text-valo-red mb-2">RankUp ValoPoints</h1>
        <p className="text-gray-400 mb-4">Track your Valorant ranked progress with our dojo-style points system.</p>
        <p className="home-point-legend text-gray-500 text-sm mb-6">
          <span>Win: +3 pts</span><span>Loss: -1.5 pts</span><span>MVP: +1 pt</span><span>Team MVP: +0.5 pt</span><span>Ace: +0.5 pt</span>
        </p>
      <div className="w-full max-w-md bg-valo-panel border border-gray-600 rounded-lg p-6 text-left">
        <h2 className="text-xl font-semibold mb-4">Register</h2>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              required
            />
          </div>
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
            <label className="block text-sm text-gray-400 mb-1">Password</label>
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
            <p className="text-xs text-gray-500 mt-1">8+ characters, letters and numbers only</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-valo-red hover:bg-red-600 rounded font-medium transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <><Spinner className="w-4 h-4" /> Registering...</> : 'Register'}
          </button>
        </form>
        <p className="mt-3 text-sm text-gray-500 text-center">
          Already have an account? <Link href="/login" className="text-valo-red hover:underline">Log in</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
