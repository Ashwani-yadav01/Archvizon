'use client';

import React from 'react';
import { UserCheck, Inbox, ShieldAlert, Users, Layers } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function ManagerDashboard({ user }) {
  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Production Management</h1>
            <StatusBadge status={user?.role} />
          </div>
          <p className="text-xs text-slate-400">
            Triage submitted briefs, request clarifications, assign artists, and coordinate client deliverables.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="arch-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Incoming Briefs</p>
          <p className="text-2xl font-bold text-sky-400 mt-1">0</p>
          <p className="text-[11px] text-slate-500 mt-3">Requires triage & clarification</p>
        </div>

        <div className="arch-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Unassigned</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">0</p>
          <p className="text-[11px] text-slate-500 mt-3">Ready for artist allocation</p>
        </div>

        <div className="arch-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">In Production</p>
          <p className="text-2xl font-bold text-white mt-1">0</p>
          <p className="text-[11px] text-slate-500 mt-3">Underway with visualization team</p>
        </div>

        <div className="arch-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Client Review</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">0</p>
          <p className="text-[11px] text-slate-500 mt-3">Awaiting client sign-off</p>
        </div>
      </div>

      {/* Triage Queue */}
      <div className="arch-card p-8 text-center">
        <div className="max-w-md mx-auto py-8">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Intake Queue Clean</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            All submitted client briefs have been triaged. New requests will appear here with source drawings and specification documents.
          </p>
        </div>
      </div>
    </div>
  );
}
