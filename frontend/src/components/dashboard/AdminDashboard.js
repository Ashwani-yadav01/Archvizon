'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Server, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import api from '../../services/api';

export default function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [healthStatus, setHealthStatus] = useState(null);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError('');
    try {
      const res = await api.get('/users?limit=10');
      setUsers(res.data?.users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch user directory');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await api.get('/health');
      setHealthStatus(res.data);
    } catch (err) {
      setHealthStatus({ status: 'offline', error: err.message });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Platform Administration</h1>
            <StatusBadge status={user?.role} />
          </div>
          <p className="text-xs text-slate-400">
            System administration, user account management, RBAC enforcement, and service monitoring.
          </p>
        </div>

        <button
          onClick={() => {
            fetchUsers();
            fetchHealth();
          }}
          className="arch-button-secondary text-xs flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh System State</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Platform Health</p>
              <p className="text-lg font-bold text-emerald-400 mt-1 capitalize">
                {healthStatus?.status || 'Checking...'}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Express API & MongoDB connectivity</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Total Users</p>
              <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-950/80 border border-sky-800/80 text-sky-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Clients, Artists & Managers enrolled</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Security Model</p>
              <p className="text-lg font-bold text-indigo-400 mt-1">RBAC Enforced</p>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-800/80 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Strict server-side privilege validation</p>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="arch-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-semibold text-white">Registered User Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Authorized view for platform administrators to audit roles and account statuses
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {isLoadingUsers ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Organization</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-200">{u.name}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={u.role} />
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{u.organization || '—'}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-emerald-400 border border-emerald-900/40">
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
