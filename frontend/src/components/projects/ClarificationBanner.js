'use client';

import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import projectService from '../../services/projectService';

export default function ClarificationBanner({ project, isClient, onClarificationResponded }) {
  const [responseMsg, setResponseMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (project?.status !== 'AWAITING_INFORMATION') return null;

  const clarification = project?.clarificationRequest || {};

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseMsg.trim()) {
      setError('Please provide response notes for the production team.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await projectService.respondToClarification(project._id, {
        responseMessage: responseMsg.trim()
      });
      setSuccess('Clarification submitted successfully! Project status restored to SUBMITTED.');
      setTimeout(() => {
        if (onClarificationResponded) onClarificationResponded();
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to submit clarification response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-amber-950/30 border border-amber-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />

      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-amber-200">
              Clarification & Missing Information Requested
            </h3>
            {clarification.requestedAt && (
              <span className="text-[11px] text-amber-400/80 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(clarification.requestedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="mt-2.5 p-3.5 rounded-xl bg-slate-950/70 border border-amber-900/40 text-xs text-slate-200 leading-relaxed">
            <span className="text-amber-400 font-semibold block mb-1">Production Manager Request:</span>
            {clarification.message || 'Please review missing requirements or files and submit clarification.'}
          </div>

          {isClient ? (
            <div className="mt-4 pt-4 border-t border-amber-800/40">
              {error && (
                <div className="mb-3 p-2.5 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-3 p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmitResponse} className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  Your Response to the Visualization Team:
                </label>
                <textarea
                  value={responseMsg}
                  onChange={(e) => setResponseMsg(e.target.value)}
                  placeholder="e.g. Uploaded the requested Level 2 DWG plans in the Assets tab above. Confirmed daylight lighting setting."
                  rows={3}
                  required
                  className="arch-input text-xs"
                />

                <div className="flex items-center justify-between gap-4 pt-1">
                  <p className="text-[11px] text-slate-400">
                    💡 Tip: If you need to attach drawings, upload them in the Assets tab above before submitting.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? 'Submitting...' : 'Submit Clarification'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-300/80">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Awaiting client to address notes and re-submit for review.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
