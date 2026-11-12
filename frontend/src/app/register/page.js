'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Layers, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        phone: formData.phone,
        password: formData.password
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 arch-card p-8 sm:p-10">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white mx-auto shadow-lg mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Client Account</h2>
          <p className="text-xs text-slate-400 mt-2">
            Submit architectural visualization briefs and track deliverables
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="name">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Sarah Connor"
                className="arch-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="organization">
                Practice / Firm
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Apex Developments"
                className="arch-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="email">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="sarah@firm.com"
                className="arch-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 019-2834"
                className="arch-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="password">
                Password * (min. 8 chars)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="arch-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="confirmPassword">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="arch-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full arch-button-primary mt-4"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Register Account
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
