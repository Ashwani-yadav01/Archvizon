'use client';

import React, { useState } from 'react';
import { History, Download, Eye, UploadCloud, ChevronRight, X, Clock, User, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import deliverableService from '../../services/deliverableService';
import DeliverablePreviewModal from './DeliverablePreviewModal';

export default function DeliverableVersionList({
  deliverableId,
  isOpen,
  onClose,
  onUploadNewVersion,
  canManage = false
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [previewingDeliverable, setPreviewingDeliverable] = useState(null);

  React.useEffect(() => {
    if (isOpen && deliverableId) {
      loadVersionHistory();
    }
  }, [isOpen, deliverableId]);

  const loadVersionHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await deliverableService.getDeliverableById(deliverableId);
      setData(res);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const current = data?.deliverable;
  const versions = data?.versions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950 border border-sky-800 text-sky-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Version History</h3>
              <p className="text-xs text-slate-400 truncate max-w-sm">
                {current?.title || 'Deliverable iterations'}
              </p>
            </div>
          </div>

          {canManage && (
            <button
              onClick={() => {
                onClose();
                if (onUploadNewVersion) onUploadNewVersion(current);
              }}
              className="arch-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload New Version
            </button>
          )}
        </div>

        {error && (
          <div className="my-4 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Versions Timeline */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">
              <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
              Loading iteration history...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No versions found.</div>
          ) : (
            <div className="space-y-3">
              {versions.map((ver, idx) => (
                <div
                  key={ver._id}
                  className={`p-4 rounded-xl border transition ${
                    idx === 0
                      ? 'bg-slate-950/80 border-sky-800/80'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded border border-sky-800">
                        v{ver.version}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Latest Iteration
                        </span>
                      )}
                      <StatusBadge status={ver.reviewStatus} />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewingDeliverable(ver)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>

                      <button
                        onClick={() => deliverableService.downloadDeliverableFile(ver._id, ver.title)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {ver.notes && (
                    <p className="text-xs text-slate-300 mt-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                      <span className="text-slate-500 font-medium">Changelog: </span>
                      {ver.notes}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ver.uploadedBy?.name || 'Artist'}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ver.createdAt).toLocaleString()}
                    </span>
                    {ver.assetId?.size && (
                      <>
                        <span>&bull;</span>
                        <span>{(ver.assetId.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal for selected historical version */}
      <DeliverablePreviewModal
        deliverable={previewingDeliverable}
        isOpen={Boolean(previewingDeliverable)}
        onClose={() => setPreviewingDeliverable(null)}
        canManage={canManage}
      />
    </div>
  );
}
