'use client';

import React, { useState } from 'react';
import { AlertCircle, X, Send } from 'lucide-react';
import projectService from '../../services/projectService';

export default function ClarificationModal({ projectId, isOpen, onClose, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please specify what details or CAD drawings are missing.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await projectService.updateStatus(projectId, {
        status: 'AWAITING_INFORMATION',
        notes: notes.trim()
      });
      setNotes('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to request clarification');
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
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Request Client Clarification</h3>
            <p className="text-xs text-slate-400">
              Project will transition to <span className="font-mono text-amber-300">AWAITING_INFORMATION</span>.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Specify Missing Information or Files Needed
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please upload the updated AutoCAD (.dwg) floor plans for the second level, and confirm the living room lighting preference (daylight vs dusk)."
              rows={4}
              required
              className="arch-input text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              The client will receive an in-app alert with these notes and can attach additional source files.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="arch-btn-secondary text-xs py-2 px-4">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Sending Request...' : 'Send Clarification Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
