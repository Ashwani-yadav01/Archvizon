'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Clock,
  Play,
  AlertCircle,
  Users,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Building,
  Calendar,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import projectService from '../../services/projectService';
import ClarificationModal from '../projects/ClarificationModal';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import OrganizationWorkspace from '../organization/OrganizationWorkspace';
import { BarChart3, Building2, FolderKanban } from 'lucide-react';

export default function ManagerDashboard({ user }) {
  const [mainSection, setMainSection] = useState('QUEUE');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('ALL');

  // Clarification modal state
  const [clarifyProjectId, setClarifyProjectId] = useState(null);
  const [isClarifyOpen, setIsClarifyOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectService.getProjects({ limit: 50 });
      setProjects(data?.projects || []);
    } catch (err) {
      console.error('Failed to load projects for manager:', err);
      setError(err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleStartReview = async (projectId) => {
    try {
      await projectService.updateStatus(projectId, {
        status: 'UNDER_REVIEW',
        notes: 'Production manager commenced brief and specifications review'
      });
      await fetchProjects();
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed to start review');
    }
  };

  const handleOpenClarification = (projectId) => {
    setClarifyProjectId(projectId);
    setIsClarifyOpen(true);
  };

  // Metrics calculation
  const incomingCount = projects.filter((p) => p.status === 'SUBMITTED').length;
  const underReviewCount = projects.filter((p) => p.status === 'UNDER_REVIEW').length;
  const awaitingInfoCount = projects.filter((p) => p.status === 'AWAITING_INFORMATION').length;
  const inProductionCount = projects.filter((p) => ['ASSIGNED', 'IN_PROGRESS', 'INTERNAL_REVIEW'].includes(p.status)).length;
  const clientReviewCount = projects.filter((p) => ['CLIENT_REVIEW', 'REVISION_REQUESTED'].includes(p.status)).length;
  const completedCount = projects.filter((p) => ['APPROVED', 'COMPLETED'].includes(p.status)).length;

  // Filter triage items: SUBMITTED or UNDER_REVIEW
  const triageProjects = projects.filter((p) => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW');

  // Filtered projects for the full workspace table
  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (propertyTypeFilter !== 'ALL' && p.propertyType !== propertyTypeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchCode = p.projectCode?.toLowerCase().includes(q);
      const matchClient = p.clientId?.name?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchClient) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Production Management</h1>
            <StatusBadge status={user?.role} />
          </div>
          <p className="text-xs text-slate-400">
            Triage submitted briefs, request clarifications, assign artists, and track production lifecycles.
          </p>
        </div>

        <button
          onClick={fetchProjects}
          disabled={loading}
          className="arch-btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
          title="Refresh project list"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Primary Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs overflow-x-auto">
        <button
          onClick={() => setMainSection('QUEUE')}
          className={`pb-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            mainSection === 'QUEUE'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Production Pipeline ({projects.length})</span>
        </button>

        <button
          onClick={() => setMainSection('ANALYTICS')}
          className={`pb-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            mainSection === 'ANALYTICS'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Production Analytics</span>
        </button>

        <button
          onClick={() => setMainSection('ORGANIZATION')}
          className={`pb-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            mainSection === 'ORGANIZATION'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organization Workspaces</span>
        </button>
      </div>

      {mainSection === 'ANALYTICS' && (
        <AnalyticsDashboard currentUser={user} />
      )}

      {mainSection === 'ORGANIZATION' && (
        <OrganizationWorkspace currentUser={user} />
      )}

      {mainSection === 'QUEUE' && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="arch-card p-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Incoming Briefs</p>
          <p className="text-2xl font-bold text-sky-400 mt-1">{incomingCount}</p>
          <p className="text-[10px] text-slate-500 mt-2">Requires triage</p>
        </div>

        <div className="arch-card p-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Under Review</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{underReviewCount}</p>
          <p className="text-[10px] text-slate-500 mt-2">PM reviewing files</p>
        </div>

        <div className="arch-card p-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Awaiting Info</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{awaitingInfoCount}</p>
          <p className="text-[10px] text-slate-500 mt-2">Client clarification</p>
        </div>

        <div className="arch-card p-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">In Production</p>
          <p className="text-2xl font-bold text-white mt-1">{inProductionCount}</p>
          <p className="text-[10px] text-slate-500 mt-2">3D artists active</p>
        </div>

        <div className="arch-card p-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Client Review</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{clientReviewCount}</p>
          <p className="text-[10px] text-slate-500 mt-2">Pending feedback</p>
        </div>

        <div className="arch-card p-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</p>
          <p className="text-[10px] text-slate-500 mt-2">Approved & delivered</p>
        </div>
      </div>

      {/* Triage Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Intake Triage Queue</h2>
            <span className="px-2 py-0.5 text-xs bg-sky-950 text-sky-400 border border-sky-800 rounded-full font-mono">
              {triageProjects.length} pending
            </span>
          </div>
          <span className="text-xs text-slate-400">Briefs awaiting acceptance or artist allocation</span>
        </div>

        {triageProjects.length === 0 ? (
          <div className="arch-card p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Triage Queue Clean</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All submitted client briefs have been reviewed and allocated to production.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {triageProjects.map((p) => (
              <div
                key={p._id}
                className="arch-card p-5 border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                        {p.projectCode}
                      </span>
                      <StatusBadge status={p.status} />
                      <span className="text-[11px] text-slate-400 font-mono">
                        Client: <strong className="text-slate-200">{p.clientId?.name || 'Client'}</strong> ({p.clientId?.email})
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white hover:text-sky-300 transition">
                      <Link href={`/projects/${p._id}`}>{p.name}</Link>
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleStartReview(p._id)}
                        className="arch-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Start Review
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenClarification(p._id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 hover:bg-amber-900 transition flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Request Clarification
                    </button>

                    <Link
                      href={`/projects/${p._id}?tab=TEAM`}
                      className="arch-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Assign Team
                    </Link>

                    <Link
                      href={`/projects/${p._id}`}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="Open full project details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {p.propertyType?.replace(/_/g, ' ')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'Flexible'}
                    </span>
                    <span>
                      Services: <strong className="text-slate-300">{p.services?.length || 0}</strong> requested
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    Submitted: {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Projects Management Workspace */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">All Production Projects</h2>
            <span className="text-xs text-slate-400 font-mono">({filteredProjects.length})</span>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search projects or clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="arch-input pl-9 text-xs py-1.5 w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="arch-input text-xs py-1.5"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="AWAITING_INFORMATION">Awaiting Info</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Production</option>
              <option value="CLIENT_REVIEW">Client Review</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={propertyTypeFilter}
              onChange={(e) => setPropertyTypeFilter(e.target.value)}
              className="arch-input text-xs py-1.5"
            >
              <option value="ALL">All Property Types</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="MIXED_USE">Mixed Use</option>
              <option value="HOSPITALITY">Hospitality</option>
            </select>
          </div>
        </div>

        {/* Project Table / List */}
        {loading ? (
          <div className="arch-card p-12 text-center text-slate-400 text-xs">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
            Loading project briefs...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="arch-card p-8 text-center text-xs text-slate-400">
            No projects match the selected filters.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="arch-card p-4 hover:border-slate-700 transition flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                      {project.projectCode}
                    </span>
                    <StatusBadge status={project.status} />
                    <span className="text-xs text-slate-400">
                      Client: <span className="text-slate-200 font-medium">{project.clientId?.name || 'Client'}</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    <Link href={`/projects/${project._id}`} className="hover:text-sky-300 transition">
                      {project.name}
                    </Link>
                  </h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>{project.propertyType?.replace(/_/g, ' ')}</span>
                    <span>&bull;</span>
                    <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'}</span>
                    <span>&bull;</span>
                    <span>Services: {project.services?.length || 0}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/projects/${project._id}`}
                    className="arch-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    Manage
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* Clarification Modal */}
      <ClarificationModal
        projectId={clarifyProjectId}
        isOpen={isClarifyOpen}
        onClose={() => {
          setIsClarifyOpen(false);
          setClarifyProjectId(null);
        }}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
