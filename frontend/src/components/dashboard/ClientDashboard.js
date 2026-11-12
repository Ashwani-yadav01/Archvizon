'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, FolderKanban, CheckCircle2, Clock, AlertTriangle, Eye, ArrowUpRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function ClientDashboard({ user }) {
  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, {user?.name}. Manage your visualization projects, review deliverables, and approve outputs.
          </p>
        </div>

        <button className="arch-button-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>New Visualization Brief</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Active Projects</p>
              <p className="text-2xl font-bold text-white mt-1">0</p>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-950/80 border border-sky-800/80 text-sky-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Projects currently in production</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Awaiting Review</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">0</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Deliverables ready for your feedback</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Revisions Pending</p>
              <p className="text-2xl font-bold text-white mt-1">0</p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Changes being implemented by artists</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Approved Deliverables</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">0</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Ready for full-resolution download</p>
        </div>
      </div>

      {/* Projects Container (Empty state for Phase 1) */}
      <div className="arch-card p-8 text-center">
        <div className="max-w-md mx-auto py-8">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No active projects yet</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Create your first project brief to begin collaborating with our architectural visualization and staging team.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button className="arch-button-primary text-xs flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Brief</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
