'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ClientDashboard from '../../components/dashboard/ClientDashboard';
import ArtistDashboard from '../../components/dashboard/ArtistDashboard';
import ManagerDashboard from '../../components/dashboard/ManagerDashboard';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
        <p className="text-xs">Authenticating workspace...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {user.role === 'ADMIN' && <AdminDashboard user={user} />}
      {user.role === 'PROJECT_MANAGER' && <ManagerDashboard user={user} />}
      {user.role === 'VISUALIZATION_ARTIST' && <ArtistDashboard user={user} />}
      {user.role === 'CLIENT' && <ClientDashboard user={user} />}
    </div>
  );
}
