'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  SlidersHorizontal
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import deliverableService from '../../services/deliverableService';
import projectService from '../../services/projectService';
import WalkthroughPlayer from '../walkthrough/WalkthroughPlayer';
import BeforeAfterComparison from '../walkthrough/BeforeAfterComparison';
import PanoramaViewer from '../walkthrough/PanoramaViewer';
import FormatLimitationsModal from '../walkthrough/FormatLimitationsModal';

export default function DeliverablePreviewModal({
  deliverable,
  isOpen,
  onClose,
  onStatusUpdated,
  canManage = false
}) {
  const [downloading, setDownloading] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState('');
  const [isLimitationsModalOpen, setIsLimitationsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('SPLIT'); // 'SPLIT' or 'STANDARD' for staging

  if (!isOpen || !deliverable) return null;

  const previewUrl = deliverableService.getDeliverablePreviewUrl(deliverable._id);
  const isImage =
    ['IMAGE_RENDER', 'STAGED_IMAGE'].includes(deliverable.deliverableType) ||
    deliverable.assetId?.mimeType?.startsWith('image/');
  const isVideo =
    deliverable.deliverableType === 'WALKTHROUGH_VIDEO' ||
    deliverable.assetId?.mimeType?.startsWith('video/');
  const is360 = deliverable.deliverableType === 'PANORAMA_360';

  const originalAssetId = deliverable.originalAssetId?._id || deliverable.originalAssetId;
  const originalAssetUrl = originalAssetId
    ? projectService.getAssetDownloadUrl(originalAssetId)
    : null;
  const hasStagingComparison = deliverable.deliverableType === 'STAGED_IMAGE' && originalAssetUrl;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError('');
      await deliverableService.downloadDeliverableFile(deliverable._id, deliverable.title);
    } catch (err) {
      setError(err?.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleReleaseToClient = async () => {
    try {
      setReleasing(true);
      setError('');
      await deliverableService.updateDeliverableStatus(deliverable._id, {
        reviewStatus: 'READY_FOR_CLIENT'
      });
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to release deliverable');
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                v{deliverable.version}
              </span>
              <StatusBadge status={deliverable.reviewStatus} />
              <span className="text-xs text-slate-400 font-mono">
                {deliverable.deliverableType?.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white truncate mt-1">{deliverable.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {hasStagingComparison && (
              <button
                onClick={() => setViewMode(viewMode === 'SPLIT' ? 'STANDARD' : 'SPLIT')}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-amber-950/80 border border-amber-700 text-amber-300 hover:bg-amber-900 transition flex items-center gap-1.5 font-medium shadow"
                title="Toggle split before/after view"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{viewMode === 'SPLIT' ? 'Single View' : 'Compare Before/After'}</span>
              </button>
            )}

            <button
              onClick={() => setIsLimitationsModalOpen(true)}
              className="p-2 text-slate-400 hover:text-sky-400 rounded-xl hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
              title="Deliverable format compatibility guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="arch-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Downloading...' : 'Download File'}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Media Preview Viewport */}
        <div className="flex-1 min-h-[360px] max-h-[64vh] bg-slate-950 flex items-center justify-center overflow-hidden p-2 relative">
          {isVideo || deliverable.hostedTourUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <WalkthroughPlayer
                videoSrc={previewUrl}
                title={deliverable.title}
                hostedTourUrl={deliverable.hostedTourUrl}
                metadata={deliverable.metadata || {}}
              />
            </div>
          ) : is360 ? (
            <div className="w-full h-full flex items-center justify-center">
              <PanoramaViewer
                panoramaSrc={previewUrl}
                title={deliverable.title}
              />
            </div>
          ) : hasStagingComparison && viewMode === 'SPLIT' ? (
            <div className="w-full h-full p-2 flex items-center justify-center">
              <BeforeAfterComparison
                beforeImageSrc={originalAssetUrl}
                afterImageSrc={previewUrl}
                beforeLabel="Original Empty Photograph"
                afterLabel="Virtually Staged Output"
              />
            </div>
          ) : isImage ? (
            <img
              src={previewUrl}
              alt={deliverable.title}
              className="max-h-full max-w-full object-contain rounded-lg shadow-lg select-none"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
                e.target.alt = 'Preview not available for this format';
              }}
            />
          ) : (
            <div className="text-center p-8 text-slate-400">
              <Sparkles className="w-10 h-10 text-sky-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">Interactive 3D / Asset Deliverable</p>
              <p className="text-xs text-slate-500 mt-1">
                Download file to view in external 3D engine or CAD viewer.
              </p>
              <button
                onClick={() => setIsLimitationsModalOpen(true)}
                className="mt-3 text-xs text-sky-400 hover:underline inline-flex items-center gap-1 font-mono"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                View format compatibility specifications
              </button>
            </div>
          )}
        </div>

        {/* Footer Details */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Uploaded by {deliverable.uploadedBy?.name || 'Artist'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {new Date(deliverable.createdAt).toLocaleDateString()}
              </span>
              {deliverable.assetId?.size && (
                <span className="font-mono">
                  {(deliverable.assetId.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              )}
            </div>

            {deliverable.notes && (
              <p className="text-slate-300 mt-1">
                <span className="text-slate-500">Notes: </span>
                {deliverable.notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canManage && deliverable.reviewStatus === 'PENDING_INTERNAL_REVIEW' && (
              <button
                onClick={handleReleaseToClient}
                disabled={releasing}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                {releasing ? 'Releasing...' : 'Release to Client'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Format Limitations Modal */}
      <FormatLimitationsModal
        isOpen={isLimitationsModalOpen}
        onClose={() => setIsLimitationsModalOpen(false)}
      />
    </div>
  );
}
