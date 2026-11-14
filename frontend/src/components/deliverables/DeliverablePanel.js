'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  Eye,
  Download,
  History,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Video,
  Box,
  Layers,
  Sparkles,
  Plus
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import deliverableService from '../../services/deliverableService';
import revisionService from '../../services/revisionService';
import DeliverableUploadModal from './DeliverableUploadModal';
import DeliverablePreviewModal from './DeliverablePreviewModal';
import DeliverableVersionList from './DeliverableVersionList';
import RevisionRequestModal from '../revisions/RevisionRequestModal';
import FormatLimitationsModal from '../walkthrough/FormatLimitationsModal';
import { HelpCircle } from 'lucide-react';

export default function DeliverablePanel({
  projectId,
  deliverables = [],
  serviceRequests = [],
  canUpload = false,
  canManage = false,
  isClient = false,
  onDeliverablesChanged
}) {
  const [selectedType, setSelectedType] = useState('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFormatGuideOpen, setIsFormatGuideOpen] = useState(false);
  const [targetDeliverableForVersion, setTargetDeliverableForVersion] = useState(null);
  const [previewDeliverable, setPreviewDeliverable] = useState(null);
  const [versionHistoryId, setVersionHistoryId] = useState(null);
  const [revisionModalDeliverable, setRevisionModalDeliverable] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const filteredDeliverables = deliverables.filter((d) => {
    if (selectedType !== 'ALL' && d.deliverableType !== selectedType) return false;
    return true;
  });

  const handleDownload = async (deliverable) => {
    try {
      setDownloadingId(deliverable._id);
      await deliverableService.downloadDeliverableFile(deliverable._id, deliverable.title);
    } catch (err) {
      alert(err?.message || 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleQuickRelease = async (deliverableId) => {
    try {
      await deliverableService.updateDeliverableStatus(deliverableId, {
        reviewStatus: 'READY_FOR_CLIENT'
      });
      if (onDeliverablesChanged) onDeliverablesChanged();
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed to release deliverable');
    }
  };

  const handleApprove = async (deliverableId, deliverableTitle) => {
    if (!window.confirm(`Are you sure you want to approve "${deliverableTitle}" as final output?`)) return;
    try {
      setApprovingId(deliverableId);
      await revisionService.approveDeliverable(deliverableId);
      if (onDeliverablesChanged) onDeliverablesChanged();
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Approval failed');
    } finally {
      setApprovingId(null);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'WALKTHROUGH_VIDEO':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'PANORAMA_360':
      case 'MODEL_3D':
        return <Box className="w-4 h-4 text-purple-400" />;
      case 'STAGED_IMAGE':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      default:
        return <FileImage className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition ${
              selectedType === 'ALL'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Deliverables ({deliverables.length})
          </button>
          <button
            onClick={() => setSelectedType('IMAGE_RENDER')}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition ${
              selectedType === 'IMAGE_RENDER'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            CGI Renders
          </button>
          <button
            onClick={() => setSelectedType('STAGED_IMAGE')}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition ${
              selectedType === 'STAGED_IMAGE'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Virtual Staging
          </button>
          <button
            onClick={() => setSelectedType('WALKTHROUGH_VIDEO')}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition ${
              selectedType === 'WALKTHROUGH_VIDEO'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Walkthroughs
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFormatGuideOpen(true)}
            className="p-2 text-slate-400 hover:text-sky-300 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition flex items-center gap-1.5 text-xs font-mono"
            title="View 3D & Walkthrough Supported Format Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Format Guide</span>
          </button>

          {canUpload && (
            <button
              onClick={() => {
                setTargetDeliverableForVersion(null);
                setIsUploadModalOpen(true);
              }}
              className="arch-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload Deliverable
            </button>
          )}
        </div>
      </div>

      {/* Deliverable Grid / Cards */}
      {filteredDeliverables.length === 0 ? (
        <div className="arch-card p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No deliverables available</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {canUpload
              ? 'Upload your initial rendering preview or completed outputs to share with the client.'
              : 'The visualization artists are currently producing renders. Completed drafts will appear here for review.'}
          </p>
          {canUpload && (
            <button
              onClick={() => {
                setTargetDeliverableForVersion(null);
                setIsUploadModalOpen(true);
              }}
              className="arch-btn-primary text-xs py-2 px-4 mt-4 inline-flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload First Deliverable
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeliverables.map((deliv) => {
            const previewUrl = deliverableService.getDeliverablePreviewUrl(deliv._id);
            const isImage = ['IMAGE_RENDER', 'STAGED_IMAGE'].includes(deliv.deliverableType) ||
              deliv.assetId?.mimeType?.startsWith('image/');

            return (
              <div
                key={deliv._id}
                className="arch-card overflow-hidden flex flex-col justify-between hover:border-slate-700 transition group"
              >
                {/* Thumbnail Preview Banner */}
                <div
                  onClick={() => setPreviewDeliverable(deliv)}
                  className="h-44 w-full bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer relative border-b border-slate-800/80"
                >
                  {isImage ? (
                    <img
                      src={previewUrl}
                      alt={deliv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : deliv.deliverableType === 'WALKTHROUGH_VIDEO' ? (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto mb-2">
                        <Video className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-medium text-slate-300">Click to Play Video</span>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <Box className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                      <span className="text-xs font-medium text-slate-300">3D Asset / Scene</span>
                    </div>
                  )}

                  {/* Version Tag */}
                  <span className="absolute top-2.5 left-2.5 font-mono text-xs font-bold text-white bg-slate-950/90 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-700 shadow">
                    v{deliv.version}
                  </span>

                  {/* Status Tag */}
                  <div className="absolute top-2.5 right-2.5">
                    <StatusBadge status={deliv.reviewStatus} />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      {getTypeIcon(deliv.deliverableType)}
                      <span>{deliv.deliverableType?.replace(/_/g, ' ')}</span>
                    </div>

                    <h4
                      onClick={() => setPreviewDeliverable(deliv)}
                      className="text-sm font-bold text-white hover:text-sky-300 cursor-pointer transition line-clamp-1"
                    >
                      {deliv.title}
                    </h4>

                    {deliv.notes && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {deliv.notes}
                      </p>
                    )}
                  </div>

                  {/* Meta & Actions */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>By {deliv.uploadedBy?.name || 'Artist'}</span>
                      <span>{new Date(deliv.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewDeliverable(deliv)}
                          className="arch-btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1"
                          title="Preview full screen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                        </button>

                        <button
                          onClick={() => setVersionHistoryId(deliv._id)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                          title="View version iterations"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {canManage && deliv.reviewStatus === 'PENDING_INTERNAL_REVIEW' && (
                          <button
                            onClick={() => handleQuickRelease(deliv._id)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 transition flex items-center gap-1"
                            title="Release to client"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Release
                          </button>
                        )}

                        {isClient && ['READY_FOR_CLIENT', 'REVISION_REQUESTED'].includes(deliv.reviewStatus) && (
                          <>
                            <button
                              onClick={() => setRevisionModalDeliverable(deliv)}
                              className="px-2 py-1 text-[11px] font-medium rounded-lg bg-amber-950/80 border border-amber-800 text-amber-300 hover:bg-amber-900 transition flex items-center gap-1"
                              title="Request modifications"
                            >
                              <AlertCircle className="w-3 h-3" />
                              Revision
                            </button>

                            <button
                              onClick={() => handleApprove(deliv._id, deliv.title)}
                              disabled={approvingId === deliv._id}
                              className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 transition flex items-center gap-1"
                              title="Approve deliverable"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {approvingId === deliv._id ? 'Approving...' : 'Approve'}
                            </button>
                          </>
                        )}

                        {deliv.reviewStatus === 'APPROVED' && (
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}

                        {canUpload && (
                          <button
                            onClick={() => {
                              setTargetDeliverableForVersion(deliv);
                              setIsUploadModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-400 transition"
                            title="Upload new iteration version"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDownload(deliv)}
                          disabled={downloadingId === deliv._id}
                          className="arch-btn-primary text-xs py-1.5 px-2.5 flex items-center gap-1"
                          title="Download authorized file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal (new deliverable or new version) */}
      <DeliverableUploadModal
        projectId={projectId}
        serviceRequests={serviceRequests}
        targetDeliverable={targetDeliverableForVersion}
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setTargetDeliverableForVersion(null);
        }}
        onSuccess={onDeliverablesChanged}
      />

      {/* Full Preview Modal */}
      <DeliverablePreviewModal
        deliverable={previewDeliverable}
        isOpen={Boolean(previewDeliverable)}
        onClose={() => setPreviewDeliverable(null)}
        onStatusUpdated={onDeliverablesChanged}
        canManage={canManage}
      />

      {/* Version History Modal */}
      <DeliverableVersionList
        deliverableId={versionHistoryId}
        isOpen={Boolean(versionHistoryId)}
        onClose={() => setVersionHistoryId(null)}
        onUploadNewVersion={(target) => {
          setTargetDeliverableForVersion(target);
          setIsUploadModalOpen(true);
        }}
        canManage={canUpload}
      />

      {/* Revision Request Modal */}
      <RevisionRequestModal
        deliverable={revisionModalDeliverable}
        isOpen={Boolean(revisionModalDeliverable)}
        onClose={() => setRevisionModalDeliverable(null)}
        onSuccess={onDeliverablesChanged}
      />

      {/* 3D & Walkthrough Format Limitations Modal */}
      <FormatLimitationsModal
        isOpen={isFormatGuideOpen}
        onClose={() => setIsFormatGuideOpen(false)}
      />
    </div>
  );
}
