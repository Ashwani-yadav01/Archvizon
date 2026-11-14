'use client';

import React, { useState } from 'react';
import { UploadCloud, X, AlertCircle, CheckCircle2, FileImage, Layers } from 'lucide-react';
import deliverableService from '../../services/deliverableService';

export default function DeliverableUploadModal({
  projectId,
  serviceRequests = [],
  targetDeliverable = null, // If set, we are uploading a new version of this deliverable
  isOpen,
  onClose,
  onSuccess
}) {
  const isNewVersion = Boolean(targetDeliverable);

  const [title, setTitle] = useState(targetDeliverable?.title || '');
  const [deliverableType, setDeliverableType] = useState(targetDeliverable?.deliverableType || 'IMAGE_RENDER');
  const [serviceRequestId, setServiceRequestId] = useState(targetDeliverable?.serviceRequestId?._id || '');
  const [notes, setNotes] = useState('');
  const [hostedTourUrl, setHostedTourUrl] = useState(targetDeliverable?.hostedTourUrl || '');
  const [cameraViewsStr, setCameraViewsStr] = useState(
    Array.isArray(targetDeliverable?.metadata?.cameraViews) ? targetDeliverable.metadata.cameraViews.join(', ') : ''
  );
  const [reviewStatus, setReviewStatus] = useState('READY_FOR_CLIENT');
  const [isFinal, setIsFinal] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title && !isNewVersion) {
        // Auto-fill title from filename
        const nameWithoutExt = e.target.files[0].name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a deliverable file to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('notes', notes);
      formData.append('reviewStatus', reviewStatus);
      if (hostedTourUrl.trim()) {
        formData.append('hostedTourUrl', hostedTourUrl.trim());
      }
      if (cameraViewsStr.trim()) {
        const views = cameraViewsStr.split(',').map((s) => s.trim()).filter(Boolean);
        formData.append('metadata', JSON.stringify({ cameraViews: views }));
      }

      if (isNewVersion) {
        await deliverableService.uploadNewVersion(targetDeliverable._id, formData);
      } else {
        formData.append('title', title.trim());
        formData.append('deliverableType', deliverableType);
        if (serviceRequestId) formData.append('serviceRequestId', serviceRequestId);
        if (isFinal) formData.append('isFinal', 'true');

        await deliverableService.uploadDeliverable(projectId, formData);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to upload deliverable');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-800 text-sky-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isNewVersion ? `Upload Version ${(targetDeliverable.version || 1) + 1}` : 'Upload New Deliverable'}
            </h3>
            <p className="text-xs text-slate-400">
              {isNewVersion
                ? `Iterate on "${targetDeliverable.title}" with updated renders or files.`
                : 'Upload visual renders, staged scenes, or virtual walkthrough files.'}
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
          {!isNewVersion && (
            <>
              {/* Deliverable Title */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Deliverable Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Living Room Daytime CGI"
                  required
                  className="arch-input text-xs"
                />
              </div>

              {/* Type and Service Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Deliverable Type</label>
                  <select
                    value={deliverableType}
                    onChange={(e) => setDeliverableType(e.target.value)}
                    className="arch-input text-xs"
                  >
                    <option value="IMAGE_RENDER">Image Render (CGI)</option>
                    <option value="STAGED_IMAGE">Staged Image</option>
                    <option value="WALKTHROUGH_VIDEO">Walkthrough Video</option>
                    <option value="PANORAMA_360">360° Panorama</option>
                    <option value="MODEL_3D">3D Model Scene</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Linked Service (Optional)</label>
                  <select
                    value={serviceRequestId}
                    onChange={(e) => setServiceRequestId(e.target.value)}
                    className="arch-input text-xs"
                  >
                    <option value="">General Project Deliverable</option>
                    {serviceRequests.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.serviceType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Walkthrough / 360 Specific Options */}
              {['WALKTHROUGH_VIDEO', 'PANORAMA_360'].includes(deliverableType) && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-sky-400 mb-1">
                      Hosted Virtual Tour URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={hostedTourUrl}
                      onChange={(e) => setHostedTourUrl(e.target.value)}
                      placeholder="e.g. https://my.matterport.com/show/?m=... or Kuula tour link"
                      className="arch-input text-xs"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Enables in-browser embedded interactive 3D tour alongside video preview.
                    </p>
                  </div>

                  {deliverableType === 'WALKTHROUGH_VIDEO' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Camera Perspectives / Chapter Markers (Optional)
                      </label>
                      <input
                        type="text"
                        value={cameraViewsStr}
                        onChange={(e) => setCameraViewsStr(e.target.value)}
                        placeholder="e.g. Entrance Foyer, Living Room, Master Suite, Sunset Terrace"
                        className="arch-input text-xs"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Comma-separated camera scenes for 1-click video jump points.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* File Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Output File</label>
            <div className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-950/40">
              <input
                type="file"
                id="deliverable-file"
                onChange={handleFileChange}
                required
                className="hidden"
              />
              <label htmlFor="deliverable-file" className="cursor-pointer block">
                <FileImage className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                {file ? (
                  <p className="text-xs font-semibold text-sky-400 truncate max-w-xs mx-auto">
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                ) : (
                  <>
                    <p className="text-xs font-medium text-slate-300">Click to select deliverable file</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP, MP4, MOV, OBJ, GLB (up to 500MB)
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Review Status Radio */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Release Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReviewStatus('READY_FOR_CLIENT')}
                className={`py-2 px-3 text-xs rounded-xl border text-left font-medium transition ${
                  reviewStatus === 'READY_FOR_CLIENT'
                    ? 'bg-sky-600/20 border-sky-500 text-sky-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span className="block font-semibold">Ready for Client</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Visible to client for review</span>
              </button>
              <button
                type="button"
                onClick={() => setReviewStatus('PENDING_INTERNAL_REVIEW')}
                className={`py-2 px-3 text-xs rounded-xl border text-left font-medium transition ${
                  reviewStatus === 'PENDING_INTERNAL_REVIEW'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span className="block font-semibold">Internal Review</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Draft visible only to staff</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Production Notes / Change Log</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Rendered at 4K resolution using Corona renderer; warm sunset lighting applied."
              rows={3}
              className="arch-input text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="arch-btn-secondary text-xs py-2 px-4">
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="arch-btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : isNewVersion ? 'Upload Iteration' : 'Upload Deliverable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
