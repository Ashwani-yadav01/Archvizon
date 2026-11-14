'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, Clock, MessageSquare, AlertCircle, User, ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import RevisionResponseModal from './RevisionResponseModal';

export default function RevisionTimeline({
  revisions = [],
  canManage = false,
  onRevisionResponded
}) {
  const [selectedRevisionForResponse, setSelectedRevisionForResponse] = useState(null);

  if (revisions.length === 0) {
    return (
      <div className="arch-card p-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">No Revisions Requested</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Client modification requests and production team responses will be logged here for full accountability.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Revision History & Change Requests</h3>
          <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded-full font-mono">
            {revisions.length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {revisions.map((rev) => (
          <div
            key={rev._id}
            className="arch-card p-5 border border-slate-800 hover:border-slate-700 transition space-y-3.5"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                    {rev.deliverableId?.title || 'Deliverable'}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded uppercase border ${
                      rev.status === 'RESOLVED'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : rev.status === 'IN_PROGRESS'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : 'bg-rose-950/80 text-rose-300 border-rose-800'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Requested by <strong className="text-slate-200">{rev.requestedBy?.name || 'Client'}</strong> &bull;{' '}
                  {new Date(rev.createdAt).toLocaleString()}
                </p>
              </div>

              {canManage && rev.status !== 'RESOLVED' && (
                <button
                  onClick={() => setSelectedRevisionForResponse(rev)}
                  className="arch-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Respond to Revision
                </button>
              )}
            </div>

            {/* Description */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
              <span className="text-amber-400 font-medium block mb-0.5">Client Feedback:</span>
              <p>{rev.description}</p>
            </div>

            {/* Artist Response if present */}
            {rev.response?.message && (
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/60 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-sky-400 font-mono">
                  <span>
                    Team Response by {rev.response.respondedBy?.name || 'Visualization Artist'}
                  </span>
                  {rev.response.respondedAt && (
                    <span>{new Date(rev.response.respondedAt).toLocaleDateString()}</span>
                  )}
                </div>
                <p className="text-slate-300 leading-relaxed">{rev.response.message}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Response Modal */}
      <RevisionResponseModal
        revision={selectedRevisionForResponse}
        isOpen={Boolean(selectedRevisionForResponse)}
        onClose={() => setSelectedRevisionForResponse(null)}
        onSuccess={onRevisionResponded}
      />
    </div>
  );
}
