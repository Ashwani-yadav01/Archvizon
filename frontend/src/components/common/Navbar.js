'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from './StatusBadge';
import { Layers, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md group-hover:bg-sky-500 transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-wider text-white">ARCHVIZON</span>
              <span className="block text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                Visualization Platform
              </span>
            </div>
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <div className="h-4 w-px bg-slate-800" />

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-medium text-slate-200">{user?.name}</p>
                    <StatusBadge status={user?.role} />
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="arch-button-primary text-xs !py-2 !px-4"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
