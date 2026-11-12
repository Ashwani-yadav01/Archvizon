'use client';

import React from 'react';
import { Palette, UploadCloud, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function ArtistDashboard({ user }) {
  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Artist Studio</h1>
            <StatusBadge status={user?.role} />
          </div>
          <p className="text-xs text-slate-400">
            Assigned visualization work, scene source files, revision requests, and deliverable uploads.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Assigned Tasks</p>
              <p className="text-2xl font-bold text-white mt-1">0</p>
            </div>
            <div className="p-2.5 rounded-lg bg-violet-950/80 border border-violet-800/80 text-violet-400">
              <Palette className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Active production briefs in queue</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Revision Backlog</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">0</p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Client modification requests to fulfill</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Approved Renders</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">0</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Completed and accepted outputs</p>
        </div>
      </div>

      {/* Production Task Board (Empty state) */}
      <div className="arch-card p-8 text-center">
        <div className="max-w-md mx-auto py-8">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No active tasks assigned</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            When a project manager assigns a CGI rendering, staging, or walkthrough brief to you, it will appear here with downloadable source files and requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
