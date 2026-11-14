'use client';

import React, { useState } from 'react';
import { RefreshCw, X, AlertCircle, Send } from 'lucide-react';
import revisionService from '../../services/revisionService';

export default function RevisionRequestModal({ deliverable, isOpen, onClose, onSuccess }) {
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !deliverable) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide specific feedback describing what changes you would like to see.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await revisionService.requestRevision(deliverable._id, {
        description: description.trim()
      });
      setDescription('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to submit revision request');
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
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Request Deliverable Revisions</h3>
            <p className="text-xs text-slate-400">
              For: <span className="text-white font-medium">{deliverable.title}</span> (v{deliverable.version})
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Specific Changes & Design Adjustments Needed
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Please adjust the sofa fabric texture to beige linen, increase the natural daylight through the balcony windows, and soften the interior spotlight shadows."
              rows={4}
              required
              className="arch-input text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Your assigned visualization artist will receive an alert and prepare iteration v{deliverable.version + 1} incorporating your feedback.
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
              {submitting ? 'Submitting...' : 'Submit Revision Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
