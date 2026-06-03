'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

import { Spinner } from '@/components/Spinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) {
        setError('Invalid credentials');
        return;
      }
      if (res?.ok) {
        router.push('/documents');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    await signIn('google', { callbackUrl: '/documents' });
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
      <div className="flex-1 flex flex-col items-center justify-start pt-8 p-4 text-center">
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
        <h2 className="text-xl font-semibold mb-4">Log in</h2>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
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
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-valo-red hover:bg-red-600 rounded font-medium transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <><Spinner className="w-4 h-4" /> Logging in...</> : 'Log in'}
          </button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-valo-panel text-gray-500">or</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-2 flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 rounded font-medium transition border border-gray-300 disabled:opacity-70"
          >
            {googleLoading ? <><Spinner className="w-5 h-5 text-gray-600" /> Signing in...</> : <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </>}
          </button>
          <p className="text-sm text-center mt-2">
            <Link href="/forgot-password" className="text-valo-red hover:underline">Forgot password?</Link>
          </p>
        </form>
        <p className="mt-3 text-sm text-gray-500 text-center">
          Don&apos;t have an account? <Link href="/register" className="text-valo-red hover:underline">Register</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
