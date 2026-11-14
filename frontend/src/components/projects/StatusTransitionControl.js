'use client';

import React, { useState } from 'react';
import { Play, Check, AlertCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import projectService from '../../services/projectService';
import revisionService from '../../services/revisionService';
import ClarificationModal from './ClarificationModal';

export default function StatusTransitionControl({ project, onStatusChanged }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClarifyOpen, setIsClarifyOpen] = useState(false);

  const status = project?.status || 'DRAFT';

  const handleTransition = async (nextStatus, notes = '') => {
    if (!window.confirm(`Transition project to '${nextStatus}'?`)) return;

    try {
      setLoading(true);
      setError('');
      if (nextStatus === 'COMPLETED') {
        await revisionService.completeProject(project._id);
      } else {
        await projectService.updateStatus(project._id, { status: nextStatus, notes });
      }
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Status transition failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="arch-card p-5 border-l-4 border-l-sky-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Production Lifecycle</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 font-mono font-medium border border-slate-700">
              Current: {status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage workflow progression, request missing information, or advance deliverable phases.
          </p>
        </div>

        {/* Transition Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {status === 'SUBMITTED' && (
            <>
              <button
                onClick={() => handleTransition('UNDER_REVIEW', 'Production manager started brief triage')}
                disabled={loading}
                className="arch-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Start Review
              </button>
              <button
                onClick={() => setIsClarifyOpen(true)}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-amber-950/80 border border-amber-700 text-amber-300 hover:bg-amber-900 transition flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Request Clarification
              </button>
            </>
          )}

          {status === 'UNDER_REVIEW' && (
            <>
              <button
                onClick={() => setIsClarifyOpen(true)}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-amber-950/80 border border-amber-700 text-amber-300 hover:bg-amber-900 transition flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Request Clarification
              </button>
              <button
                onClick={() => handleTransition('ASSIGNED', 'Assigned production artists')}
                disabled={loading}
                className="arch-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Move to Assigned
              </button>
            </>
          )}

          {status === 'AWAITING_INFORMATION' && (
            <span className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Awaiting Client Response
            </span>
          )}

          {status === 'ASSIGNED' && (
            <button
              onClick={() => handleTransition('IN_PROGRESS', 'Artist initiated 3D modeling and rendering')}
              disabled={loading}
              className="arch-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Start Production
            </button>
          )}

          {status === 'IN_PROGRESS' && (
            <>
              <button
                onClick={() => handleTransition('INTERNAL_REVIEW', 'Initial render drafts ready for team quality check')}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Internal Review
              </button>
              <button
                onClick={() => handleTransition('CLIENT_REVIEW', 'Previews submitted to client for feedback')}
                disabled={loading}
                className="arch-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Send for Client Review
              </button>
            </>
          )}

          {status === 'INTERNAL_REVIEW' && (
            <>
              <button
                onClick={() => handleTransition('IN_PROGRESS', 'Revisions required by production manager')}
                disabled={loading}
                className="arch-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                Return to Production
              </button>
              <button
                onClick={() => handleTransition('CLIENT_REVIEW', 'Output approved internally; submitted to client')}
                disabled={loading}
                className="arch-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Submit to Client
              </button>
            </>
          )}

          {status === 'CLIENT_REVIEW' && (
            <span className="text-xs text-cyan-400 font-medium">
              Deliverables with Client for Review
            </span>
          )}

          {status === 'APPROVED' && (
            <button
              onClick={() => handleTransition('COMPLETED', 'All deliverables completed and delivered')}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Mark Completed
            </button>
          )}

          {status === 'COMPLETED' && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-4 h-4" />
              Project Completed
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Clarification Modal */}
      <ClarificationModal
        projectId={project?._id}
        isOpen={isClarifyOpen}
        onClose={() => setIsClarifyOpen(false)}
        onSuccess={onStatusChanged}
      />
    </div>
  );
}
