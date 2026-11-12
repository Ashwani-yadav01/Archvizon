'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Layers, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 arch-card p-8 sm:p-10">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white mx-auto shadow-lg mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to Archvizon</h2>
          <p className="text-xs text-slate-400 mt-2">
            Access your architectural visualization workspace
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@firm.com"
              className="arch-input"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-slate-300" htmlFor="password">
                Password
              </label>
              <span className="text-[11px] text-sky-400 hover:text-sky-300 cursor-pointer">
                Forgot password?
              </span>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="arch-input"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full arch-button-primary mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          New client?{' '}
          <Link href="/register" className="text-sky-400 hover:text-sky-300 font-medium">
            Register your practice
          </Link>
        </div>
      </div>
    </div>
  );
}
