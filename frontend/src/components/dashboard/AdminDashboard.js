'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderKanban,
  Search,
  ExternalLink,
  Edit2,
  UserCheck,
  UserX,
  Building,
  Filter
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import api from '../../services/api';
import userService from '../../services/userService';
import projectService from '../../services/projectService';

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('USERS'); // 'USERS' | 'PROJECTS'
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [healthStatus, setHealthStatus] = useState(null);

  // User filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Project filters
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('');

  // User action loading
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError('');
    try {
      const res = await userService.getUsers({
        limit: 50,
        search: userSearch || undefined,
        role: userRoleFilter || undefined
      });
      setUsers(res?.users || []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch user directory');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    setError('');
    try {
      const res = await projectService.getProjects({
        limit: 50,
        search: projectSearch || undefined,
        status: projectStatusFilter || undefined
      });
      setProjects(res?.projects || []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch projects');
    } finally {
      setIsLoadingProjects(false);
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
  }, [userRoleFilter]);

  useEffect(() => {
    if (activeTab === 'PROJECTS') {
      fetchProjects();
    }
  }, [activeTab, projectStatusFilter]);

  const handleRoleChange = async (targetUser, newRole) => {
    if (targetUser.role === newRole) return;
    try {
      setUpdatingUserId(targetUser._id);
      setError('');
      await userService.updateUserRole(targetUser._id, newRole);
      setSuccessMsg(`Role for ${targetUser.name} updated to ${newRole}`);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusToggle = async (targetUser) => {
    const nextStatus = targetUser.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setUpdatingUserId(targetUser._id);
      setError('');
      await userService.updateUserStatus(targetUser._id, nextStatus);
      setSuccessMsg(`Account for ${targetUser.name} is now ${nextStatus}`);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to update user status');
    } finally {
      setUpdatingUserId(null);
    }
  };

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
            System administration, user account management, RBAC enforcement, and project triage oversight.
          </p>
        </div>

        <button
          onClick={() => {
            fetchUsers();
            if (activeTab === 'PROJECTS') fetchProjects();
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
          <p className="text-[11px] text-slate-500 mt-3">Express API & MongoDB connectivity active</p>
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
          <p className="text-[11px] text-slate-500 mt-3">Clients, Artists, PMs & Admins registered</p>
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
          <p className="text-[11px] text-slate-500 mt-3">Server-side rate limiting & IDOR protection</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'USERS'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory & RBAC ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PROJECTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'PROJECTS'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Platform Projects Oversight</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: USERS */}
      {activeTab === 'USERS' && (
        <div className="arch-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">Registered User Directory</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit roles, modify access permissions, and toggle account suspension status
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchUsers();
                  }}
                  placeholder="Search user / email..."
                  className="arch-input !pl-8 text-xs !py-1.5"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="arch-input text-xs !py-1.5 w-32"
              >
                <option value="">All Roles</option>
                <option value="CLIENT">Client</option>
                <option value="VISUALIZATION_ARTIST">Artist</option>
                <option value="PROJECT_MANAGER">PM</option>
                <option value="ADMIN">Admin</option>
              </select>

              <button
                type="button"
                onClick={fetchUsers}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
              >
                Filter
              </button>
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading user accounts...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No users match filter criteria</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Organization</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/30">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-200">{u.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <select
                          value={u.role}
                          disabled={updatingUserId === u._id}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-sky-500"
                        >
                          <option value="CLIENT">CLIENT</option>
                          <option value="VISUALIZATION_ARTIST">VISUALIZATION_ARTIST</option>
                          <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{u.organization || '—'}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                            u.accountStatus === 'ACTIVE'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {u.accountStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          disabled={updatingUserId === u._id}
                          onClick={() => handleStatusToggle(u)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                            u.accountStatus === 'ACTIVE'
                              ? 'bg-rose-900/40 hover:bg-rose-900/70 text-rose-300 border border-rose-800'
                              : 'bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {u.accountStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROJECTS OVERSIGHT */}
      {activeTab === 'PROJECTS' && (
        <div className="arch-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">Platform Projects Oversight</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Global view of all projects across clients, team assignments, and production stages
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchProjects();
                  }}
                  placeholder="Search project name / code..."
                  className="arch-input !pl-8 text-xs !py-1.5"
                />
              </div>

              <select
                value={projectStatusFilter}
                onChange={(e) => setProjectStatusFilter(e.target.value)}
                className="arch-input text-xs !py-1.5 w-36"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="CLIENT_REVIEW">CLIENT_REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>

              <button
                type="button"
                onClick={fetchProjects}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
              >
                Filter
              </button>
            </div>
          </div>

          {isLoadingProjects ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No projects found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                    <th className="pb-3 font-semibold">Project Code & Title</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Property Type</th>
                    <th className="pb-3 font-semibold">Services</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {projects.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-800/30">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-200">{p.name}</p>
                        <p className="text-[11px] font-mono text-sky-400">{p.projectCode}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-slate-300">{p.clientId?.name || 'Client'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{p.clientId?.email}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 font-mono text-[11px]">
                        {p.propertyType}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-[11px] text-slate-300">
                          {p.services?.length || 0} service(s)
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/projects/${p._id}`}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 inline-flex items-center gap-1"
                          >
                            <span>Brief</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <Link
                            href={`/projects/${p._id}/editor`}
                            className="px-2.5 py-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 text-[11px] font-medium border border-sky-800 inline-flex items-center gap-1"
                          >
                            <span>3D</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
