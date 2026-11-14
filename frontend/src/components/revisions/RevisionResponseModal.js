'use client';

import React, { useState } from 'react';
import { MessageSquare, X, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import revisionService from '../../services/revisionService';

export default function RevisionResponseModal({ revision, isOpen, onClose, onSuccess }) {
  const [responseMsg, setResponseMsg] = useState('');
  const [status, setStatus] = useState('RESOLVED');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !revision) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!responseMsg.trim()) {
      setError('Please provide a response explaining the changes made.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await revisionService.respondToRevision(revision._id, {
        responseMessage: responseMsg.trim(),
        status
      });
      setResponseMsg('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-800 text-sky-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Respond to Revision Request</h3>
            <p className="text-xs text-slate-400">
              Deliverable: <span className="text-white font-medium">{revision.deliverableId?.title || 'Deliverable'}</span>
            </p>
          </div>
        </div>

        {/* Client's Request Quote */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-800/40 text-xs mb-4">
          <span className="text-amber-400 font-semibold block mb-1">Client Requested:</span>
          <p className="text-slate-200 leading-relaxed italic">"{revision.description}"</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Resolution Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('RESOLVED')}
                className={`py-2 px-3 text-xs rounded-xl border font-medium transition ${
                  status === 'RESOLVED'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                Mark as Resolved
              </button>
              <button
                type="button"
                onClick={() => setStatus('IN_PROGRESS')}
                className={`py-2 px-3 text-xs rounded-xl border font-medium transition ${
                  status === 'IN_PROGRESS'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                In Progress (Rendering)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Artist / PM Explanation to Client
            </label>
            <textarea
              value={responseMsg}
              onChange={(e) => setResponseMsg(e.target.value)}
              placeholder="e.g. Swapped sofa material to beige linen and adjusted sunlight angle. Uploaded version 2 for your review."
              rows={4}
              required
              className="arch-input text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="arch-btn-secondary text-xs py-2 px-4">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="arch-btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Saving...' : 'Send Response'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
