'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  Layers,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Building2,
  User,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function RegisterPage() {
  const [accountType, setAccountType] = useState('CLIENT'); // 'CLIENT' | 'FIRM'

  // Client form data
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Firm form data
  const [firmForm, setFirmForm] = useState({
    firmName: '',
    organizationType: 'ARCHITECTURAL_FIRM',
    city: '',
    country: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, registerFirm, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleClientChange = (e) => {
    setClientForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFirmChange = (e) => {
    setFirmForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (clientForm.password !== clientForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (clientForm.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: clientForm.name,
        email: clientForm.email,
        organization: clientForm.organization,
        phone: clientForm.phone,
        password: clientForm.password
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFirmSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (firmForm.password !== firmForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (firmForm.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!firmForm.firmName.trim()) {
      setError('Firm / Studio name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerFirm({
        firmName: firmForm.firmName.trim(),
        organizationType: firmForm.organizationType,
        city: firmForm.city.trim(),
        country: firmForm.country.trim(),
        name: firmForm.name.trim(),
        email: firmForm.email.trim(),
        phone: firmForm.phone.trim(),
        password: firmForm.password
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Firm registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 arch-card p-6 sm:p-10 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white mx-auto shadow-lg mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Archvizon Account</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
            Select how you plan to use Archvizon: as an individual client or as a firm/studio.
          </p>
        </div>

        {/* Account Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setAccountType('CLIENT');
              setError('');
            }}
            className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              accountType === 'CLIENT'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Individual Client</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAccountType('FIRM');
              setError('');
            }}
            className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              accountType === 'FIRM'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Firm / Studio</span>
          </button>
        </div>

        {/* Mode Explainer Banner */}
        {accountType === 'CLIENT' ? (
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/70 rounded-xl text-sky-900 dark:text-sky-300 text-xs flex items-start gap-2.5">
            <User className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Client Account:</strong> For individual developers, architects, or representatives submitting briefs, requesting CGI rendering & virtual staging, and reviewing deliverables.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 rounded-xl text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Firm / Studio Account:</strong> Creates an Organization Workspace. As the firm administrator, you can directly provision <strong>Project Managers</strong>, <strong>Visualization Artists</strong>, and team members with login credentials.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ---------------- FORM 1: INDIVIDUAL CLIENT ---------------- */}
        {accountType === 'CLIENT' && (
          <form className="space-y-4" onSubmit={handleClientSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="name">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={handleClientChange}
                  placeholder="Sarah Connor"
                  className="arch-input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="organization">
                  Practice / Firm (Optional)
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={clientForm.organization}
                  onChange={handleClientChange}
                  placeholder="Apex Developments"
                  className="arch-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={clientForm.email}
                  onChange={handleClientChange}
                  placeholder="sarah@firm.com"
                  className="arch-input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={clientForm.phone}
                  onChange={handleClientChange}
                  placeholder="+1 (555) 019-2834"
                  className="arch-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
                  Password * (min. 8 chars)
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={clientForm.password}
                    onChange={handleClientChange}
                    placeholder="••••••••"
                    className="arch-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={clientForm.confirmPassword}
                    onChange={handleClientChange}
                    placeholder="••••••••"
                    className="arch-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full arch-button-primary mt-4"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Client Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Register Client Account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>
        )}

        {/* ---------------- FORM 2: FIRM / STUDIO ---------------- */}
        {accountType === 'FIRM' && (
          <form className="space-y-4" onSubmit={handleFirmSubmit}>
            <div className="space-y-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                1. Firm & Practice Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="firmName">
                    Firm / Studio Name *
                  </label>
                  <input
                    id="firmName"
                    name="firmName"
                    type="text"
                    required
                    value={firmForm.firmName}
                    onChange={handleFirmChange}
                    placeholder="e.g. Apex CGI Studio"
                    className="arch-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="organizationType">
                    Organization Type
                  </label>
                  <select
                    id="organizationType"
                    name="organizationType"
                    value={firmForm.organizationType}
                    onChange={handleFirmChange}
                    className="arch-input text-xs"
                  >
                    <option value="ARCHITECTURAL_FIRM">Architectural Practice / Firm</option>
                    <option value="DEVELOPER">Real Estate Developer</option>
                    <option value="INTERIOR_STUDIO">Interior Design Studio</option>
                    <option value="MARKETING_AGENCY">CGI / Property Marketing Agency</option>
                    <option value="OTHER">3D Visualization Studio / Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="city">
                    City (Optional)
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={firmForm.city}
                    onChange={handleFirmChange}
                    placeholder="New York / London"
                    className="arch-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="country">
                    Country (Optional)
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={firmForm.country}
                    onChange={handleFirmChange}
                    placeholder="United States / UK"
                    className="arch-input"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                2. Firm Administrator Account
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="ownerName">
                    Administrator Full Name *
                  </label>
                  <input
                    id="ownerName"
                    name="name"
                    type="text"
                    required
                    value={firmForm.name}
                    onChange={handleFirmChange}
                    placeholder="David Director"
                    className="arch-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="firmPhone">
                    Contact Phone
                  </label>
                  <input
                    id="firmPhone"
                    name="phone"
                    type="tel"
                    value={firmForm.phone}
                    onChange={handleFirmChange}
                    placeholder="+1 (555) 019-2834"
                    className="arch-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="ownerEmail">
                  Firm / Admin Work Email *
                </label>
                <input
                  id="ownerEmail"
                  name="email"
                  type="email"
                  required
                  value={firmForm.email}
                  onChange={handleFirmChange}
                  placeholder="director@apexcgi.com"
                  className="arch-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="firmPassword">
                    Password * (min. 8 chars)
                  </label>
                  <div className="relative">
                    <input
                      id="firmPassword"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={firmForm.password}
                      onChange={handleFirmChange}
                      placeholder="••••••••"
                      className="arch-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="firmConfirmPassword">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      id="firmConfirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={firmForm.confirmPassword}
                      onChange={handleFirmChange}
                      placeholder="••••••••"
                      className="arch-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full arch-button-primary mt-4"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Firm Workspace...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Register Firm Workspace
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-600 dark:text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}