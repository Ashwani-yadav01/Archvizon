'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  ArrowUpRight,
  Layers,
  Calendar,
  Building,
  RefreshCw,
  Search,
  BarChart3,
  Building2
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import projectService from '../../services/projectService';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import OrganizationWorkspace from '../organization/OrganizationWorkspace';

export default function ClientDashboard({ user }) {
  const [mainSection, setMainSection] = useState('PROJECTS');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectService.getProjects({ limit: 50 });
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error fetching client projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Compute metrics
  const activeCount = projects.filter(
    (p) => !['COMPLETED', 'CANCELLED', 'DRAFT'].includes(p.status)
  ).length;
  const reviewCount = projects.filter((p) => p.status === 'CLIENT_REVIEW').length;
  const revisionCount = projects.filter((p) => p.status === 'REVISION_REQUESTED').length;
  const approvedCount = projects.filter((p) => ['APPROVED', 'COMPLETED'].includes(p.status)).length;

  // Filter projects by tab and search
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectCode?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'DRAFTS') return p.status === 'DRAFT';
    if (activeTab === 'IN_PRODUCTION')
      return ['ASSIGNED', 'IN_PROGRESS', 'INTERNAL_REVIEW'].includes(p.status);
    if (activeTab === 'AWAITING_REVIEW')
      return ['CLIENT_REVIEW', 'SUBMITTED', 'UNDER_REVIEW', 'AWAITING_INFORMATION'].includes(p.status);
    if (activeTab === 'COMPLETED') return ['APPROVED', 'COMPLETED'].includes(p.status);

    return true;
  });

  const getServiceLabel = (type) => {
    switch (type) {
      case 'CGI_RENDERING':
        return 'CGI Render';
      case 'VIRTUAL_STAGING':
        return 'Virtual Staging';
      case 'VIRTUAL_WALKTHROUGH':
        return 'Walkthrough';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, {user?.name}. Submit briefs, track architectural visualization progress, and review deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh projects"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/projects/new" className="arch-button-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>New Visualization Brief</span>
          </Link>
        </div>
      </div>

      {/* Primary Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs overflow-x-auto">
        <button
          onClick={() => setMainSection('PROJECTS')}
          className={`pb-3 px-3 font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            mainSection === 'PROJECTS'
              ? 'border-sky-500 text-sky-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>My Projects ({projects.length})</span>
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
          <span>Team & Organization Workspace</span>
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
          <span>Performance & Analytics</span>
        </button>
      </div>

      {mainSection === 'ORGANIZATION' && (
        <OrganizationWorkspace currentUser={user} />
      )}

      {mainSection === 'ANALYTICS' && (
        <AnalyticsDashboard currentUser={user} />
      )}

      {mainSection === 'PROJECTS' && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Active Projects</p>
              <p className="text-2xl font-bold text-white mt-1">{activeCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-950/80 border border-sky-800/80 text-sky-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Projects currently in production</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Awaiting Review</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{reviewCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Deliverables ready for your feedback</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Revisions Pending</p>
              <p className="text-2xl font-bold text-white mt-1">{revisionCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Changes being implemented by artists</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Approved / Done</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{approvedCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Ready for full-resolution download</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 text-xs">
          {[
            { id: 'ALL', label: 'All Projects' },
            { id: 'DRAFTS', label: 'Drafts' },
            { id: 'AWAITING_REVIEW', label: 'Under Review' },
            { id: 'IN_PRODUCTION', label: 'In Production' },
            { id: 'COMPLETED', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or code..."
            className="arch-input pl-9 text-xs py-2"
          />
        </div>
      </div>

      {/* Projects Grid / List */}
      {loading ? (
        <div className="arch-card p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-sky-400" />
          <p className="text-xs">Loading visualization projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="arch-card p-8 text-center">
          <div className="max-w-md mx-auto py-8">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">
              {projects.length === 0 ? 'No visualization projects yet' : 'No projects match your filter'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {projects.length === 0
                ? 'Create your first project brief to begin collaborating with our architectural visualization and staging team.'
                : 'Try adjusting your search criteria or switching to a different status filter.'}
            </p>
            {projects.length === 0 && (
              <div className="mt-6 flex justify-center gap-3">
                <Link href="/projects/new" className="arch-button-primary text-xs flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Brief</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              className="arch-card p-5 flex flex-col justify-between hover:border-sky-500/50 group transition-all"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="font-mono text-[11px] text-sky-400 font-semibold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                    {project.projectCode || 'DRAFT'}
                  </span>
                  <StatusBadge status={project.status} />
                </div>

                <h3 className="text-base font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                  {project.description || 'No description provided.'}
                </p>

                {/* Service Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {project.services && project.services.length > 0 ? (
                    project.services.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1"
                      >
                        <Layers className="w-3 h-3 text-slate-400" />
                        {getServiceLabel(s.serviceType)}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">No services added yet</span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>{project.propertyType?.replace(/_/g, ' ')}</span>
                </div>

                {project.deadline ? (
                  <div className="flex items-center gap-1.5 text-amber-400/90 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <span className="text-slate-500">Flexible deadline</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}
