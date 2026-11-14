'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  Calendar,
  Layers,
  UploadCloud,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Camera,
  Sofa,
  Video,
  FileText,
  History,
  Copy,
  Check,
  Users,
  Sparkles,
  Box,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import TeamAssignmentPanel from '../../../components/projects/TeamAssignmentPanel';
import StatusTransitionControl from '../../../components/projects/StatusTransitionControl';
import ClarificationBanner from '../../../components/projects/ClarificationBanner';
import DeliverablePanel from '../../../components/deliverables/DeliverablePanel';
import FeedbackCommentsSection from '../../../components/comments/FeedbackCommentsSection';
import RevisionTimeline from '../../../components/revisions/RevisionTimeline';
import projectService from '../../../services/projectService';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id;

  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('BRIEF');
  const [copiedCode, setCopiedCode] = useState(false);

  // File upload state
  const [uploadCategory, setUploadCategory] = useState('SOURCE_FILE');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectService.getProjectById(projectId);
      setProjectData(data);
    } catch (err) {
      console.error('Failed to load project details:', err);
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const tabParam = sp.get('tab');
      if (tabParam) setActiveTab(tabParam.toUpperCase());
    }
  }, [projectId]);

  const handleCopyCode = () => {
    if (projectData?.project?.projectCode) {
      navigator.clipboard.writeText(projectData.project.projectCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSubmitBrief = async () => {
    try {
      setActionLoading(true);
      setError('');
      await projectService.submitProject(projectId);
      setSuccessMsg('Project brief successfully submitted for production triage!');
      await fetchProjectDetails();
    } catch (err) {
      console.error('Failed to submit brief:', err);
      setError(err.message || 'Failed to submit project brief');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('category', uploadCategory);

      await projectService.uploadAsset(projectId, formData);
      setUploadFile(null);
      // Reset input element
      e.target.reset();
      await fetchProjectDetails();
      setSuccessMsg('Asset uploaded successfully');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to upload asset:', err);
      setError(err.message || 'Failed to upload asset');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!confirm('Are you sure you want to remove this asset?')) return;
    try {
      await projectService.deleteAsset(projectId, assetId);
      await fetchProjectDetails();
      setSuccessMsg('Asset deleted successfully');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to delete asset:', err);
      setError(err.message || 'Failed to delete asset');
    }
  };

  const handleDownloadAsset = (assetId) => {
    const downloadUrl = projectService.getAssetDownloadUrl(assetId);
    const token = typeof window !== 'undefined' ? localStorage.getItem('archvizon_token') : null;

    // Fetch using bearer auth then download blob
    fetch(downloadUrl, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Download failed');
        const filename = res.headers.get('content-disposition')?.split('filename=')[1] || 'asset';
        return res.blob().then((blob) => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/"/g, '');
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => {
        console.error('Download error:', err);
        setError('Failed to download asset');
      });
  };

  if (loading) {
    return (
      <div className="arch-card p-12 text-center text-slate-400 my-8">
        <Clock className="w-6 h-6 animate-spin mx-auto mb-3 text-sky-400" />
        <p className="text-xs">Loading project brief and specifications...</p>
      </div>
    );
  }

  if (error && !projectData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 rounded-xl bg-rose-950/60 border border-rose-800 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-base font-bold text-white">Project Not Accessible</h2>
        <p className="text-xs text-rose-300">{error}</p>
        <Link href="/dashboard" className="arch-button-secondary inline-block text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const {
    project,
    serviceRequests = [],
    assets = [],
    assignments = [],
    deliverables = [],
    revisions = [],
    comments = [],
    recentActivity = []
  } = projectData || {};

  const isStaff = user?.role === 'PROJECT_MANAGER' || user?.role === 'ADMIN';
  const isArtist = user?.role === 'VISUALIZATION_ARTIST';
  const isClient = user?.role === 'CLIENT';

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Back button and Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="arch-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-sky-400 font-semibold bg-sky-950/80 px-2.5 py-0.5 rounded border border-sky-800 flex items-center gap-1.5">
                  <span>{project.projectCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="hover:text-white transition-colors"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
                <StatusBadge status={project.status} />
              </div>

              <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
            </div>

            {/* Status Actions */}
            {project.status === 'DRAFT' && isClient && (
              <button
                onClick={handleSubmitBrief}
                disabled={actionLoading}
                className="arch-button-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{actionLoading ? 'Submitting...' : 'Submit Brief for Review'}</span>
              </button>
            )}

            {project.status === 'SUBMITTED' && (
              <div className="text-xs font-mono text-sky-400 bg-sky-950/60 border border-sky-800/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Submitted &bull; Awaiting PM Triage</span>
              </div>
            )}
          </div>

          {/* Quick Info Strip */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400">
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-500">Property Type</p>
              <p className="text-slate-200 font-medium mt-0.5">
                {project.propertyType?.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-500">Location</p>
              <p className="text-slate-200 font-medium mt-0.5">
                {project.location?.city ? `${project.location.city}, ${project.location.country}` : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-500">Target Deadline</p>
              <p className="text-amber-400/90 font-mono font-medium mt-0.5">
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-500">Client</p>
              <p className="text-slate-200 font-medium mt-0.5">{project.clientId?.name || 'You'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clarification Alert Banner */}
      <ClarificationBanner
        project={project}
        isClient={isClient}
        onClarificationResponded={fetchProjectDetails}
      />

      {/* PM / Admin Workflow Transition Control */}
      {isStaff && (
        <StatusTransitionControl
          project={project}
          onStatusChanged={fetchProjectDetails}
        />
      )}

      {/* Artist Assigned Banner */}
      {isArtist && (
        <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/60 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-900/60 text-sky-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Visualization Artist Workspace</p>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              You are assigned to production on this project. Review client materials and source CAD/3D drawings in the Assets tab.
            </p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('BRIEF')}
          className={`pb-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'BRIEF'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Brief & Specifications ({serviceRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DELIVERABLES')}
          className={`pb-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'DELIVERABLES'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Deliverables ({deliverables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('REVISIONS')}
          className={`pb-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'REVISIONS'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Revisions ({revisions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FEEDBACK')}
          className={`pb-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'FEEDBACK'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback ({comments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ASSETS')}
          className={`pb-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ASSETS'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Source Materials ({assets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TEAM')}
          className={`pb-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'TEAM'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ACTIVITY')}
          className={`pb-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ACTIVITY'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Activity Timeline ({recentActivity.length})</span>
        </button>
      </div>

      {/* TAB 1: BRIEF & SPECIFICATIONS */}
      {activeTab === 'BRIEF' && (
        <div className="space-y-6">
          {project.description && (
            <div className="arch-card p-6">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-2">
                Project Design Concept
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          )}

          {/* Service Requests List */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Requested Visualization Services ({serviceRequests.length})
            </h3>

            {serviceRequests.length === 0 ? (
              <div className="arch-card p-8 text-center text-slate-500 text-xs">
                No visualization services added to this project yet.
              </div>
            ) : (
              serviceRequests.map((srv) => (
                <div key={srv._id} className="arch-card p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      {srv.serviceType === 'CGI_RENDERING' && <Camera className="w-5 h-5 text-sky-400" />}
                      {srv.serviceType === 'VIRTUAL_STAGING' && <Sofa className="w-5 h-5 text-amber-400" />}
                      {srv.serviceType === 'VIRTUAL_WALKTHROUGH' && <Video className="w-5 h-5 text-emerald-400" />}
                      <h4 className="text-sm font-semibold text-white">
                        {srv.serviceType === 'CGI_RENDERING' && 'Architectural CGI Rendering'}
                        {srv.serviceType === 'VIRTUAL_STAGING' && 'Manual Virtual Staging'}
                        {srv.serviceType === 'VIRTUAL_WALKTHROUGH' && 'Virtual Walkthrough'}
                      </h4>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Status: {srv.status}
                    </span>
                  </div>

                  {/* Requirements details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {srv.serviceType === 'CGI_RENDERING' && (
                      <>
                        <div>
                          <p className="text-[10px] uppercase font-mono text-slate-500">Perspectives</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {srv.requirements?.viewTypes?.map((v, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 text-[11px]">
                                {v.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-mono text-slate-500">Lighting & Resolution</p>
                          <p className="text-slate-300 mt-1 font-mono">
                            {srv.requirements?.dayNight} Lighting &bull; {srv.outputSpecifications?.resolution || '4K'}
                          </p>
                        </div>
                      </>
                    )}

                    {srv.serviceType === 'VIRTUAL_STAGING' && (
                      <>
                        <div>
                          <p className="text-[10px] uppercase font-mono text-slate-500">Design Style & Rooms</p>
                          <p className="text-slate-200 mt-1">
                            {srv.requirements?.furnitureStyle || 'Modern'} style &bull; Rooms:{' '}
                            {srv.requirements?.roomTypes?.join(', ') || 'Living area'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-mono text-slate-500">Color Palette</p>
                          <p className="text-slate-300 mt-1">{srv.requirements?.colorPalette || 'Neutral'}</p>
                        </div>
                      </>
                    )}

                    {srv.serviceType === 'VIRTUAL_WALKTHROUGH' && (
                      <div>
                        <p className="text-[10px] uppercase font-mono text-slate-500">Output Format</p>
                        <p className="text-emerald-400 font-mono mt-1">
                          {srv.requirements?.walkthroughType?.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {srv.requirements?.notes && (
                    <div className="pt-2 border-t border-slate-800 text-xs">
                      <p className="text-[10px] uppercase font-mono text-slate-500 mb-1">Specific Instructions</p>
                      <p className="text-slate-300 whitespace-pre-wrap">{srv.requirements.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DELIVERABLES & PREVIEWS (PHASE 4 & 5) */}
      {activeTab === 'DELIVERABLES' && (
        <DeliverablePanel
          projectId={project._id}
          deliverables={deliverables}
          serviceRequests={serviceRequests}
          canUpload={isStaff || isArtist}
          canManage={isStaff}
          isClient={isClient}
          onDeliverablesChanged={fetchProjectDetails}
        />
      )}

      {/* TAB: REVISIONS & CHANGE REQUESTS (PHASE 5) */}
      {activeTab === 'REVISIONS' && (
        <RevisionTimeline
          revisions={revisions}
          canManage={isStaff || isArtist}
          onRevisionResponded={fetchProjectDetails}
        />
      )}

      {/* TAB: DISCUSSIONS & FEEDBACK (PHASE 5) */}
      {activeTab === 'FEEDBACK' && (
        <FeedbackCommentsSection
          projectId={project._id}
          comments={comments}
          currentUser={user}
          onCommentAdded={fetchProjectDetails}
        />
      )}

      {/* TAB 3: ASSETS & FILES */}
      {activeTab === 'ASSETS' && (
        <div className="space-y-6">
          {/* Upload Form */}
          <div className="arch-card p-6">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-3">
              Upload Source CAD Drawings or Reference Images
            </h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Choose File</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="arch-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="arch-input text-xs"
                  >
                    <option value="SOURCE_FILE">Source CAD / Drawing</option>
                    <option value="REFERENCE_IMAGE">Style Reference Image</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="arch-button-primary text-xs flex items-center gap-2"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Asset List */}
          <div className="arch-card p-6 space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Attached Project Files ({assets.length})
            </h3>

            {assets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No source drawings or reference files attached to this project.
              </div>
            ) : (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
                {assets.map((asset) => (
                  <div key={asset._id} className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-white truncate">{asset.originalName}</p>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {asset.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        {(asset.size / (1024 * 1024)).toFixed(2)} MB &bull; Uploaded on{' '}
                        {new Date(asset.createdAt).toLocaleDateString()} by {asset.uploadedBy?.name || 'You'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadAsset(asset._id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {project.status === 'DRAFT' && (
                        <button
                          onClick={() => handleDeleteAsset(asset._id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TEAM & ASSIGNMENTS */}
      {activeTab === 'TEAM' && (
        <TeamAssignmentPanel
          projectId={project._id}
          assignments={assignments}
          serviceRequests={serviceRequests}
          canManage={isStaff}
          onAssignmentChanged={fetchProjectDetails}
        />
      )}

      {/* TAB 4: ACTIVITY TIMELINE */}
      {activeTab === 'ACTIVITY' && (
        <div className="arch-card p-6 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Audit & Workflow History
          </h3>

          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No logged activity recorded for this project yet.
            </div>
          ) : (
            <div className="space-y-4 border-l-2 border-slate-800 ml-3 pl-4 py-1">
              {recentActivity.map((log) => (
                <div key={log._id} className="relative">
                  <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-slate-950" />
                  <div>
                    <p className="text-xs font-medium text-slate-200">
                      {log.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      By {log.actorId?.name || 'System'} &bull;{' '}
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
