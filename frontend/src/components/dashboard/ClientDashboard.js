'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Box,
  Sparkles,
  Camera,
  Compass,
  Copy,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  FolderKanban,
  Calendar,
  Building,
  Layers,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import projectService from '../../services/projectService';
import { getAssetUrl } from '../../utils/assetUrl';

export default function ClientDashboard({ user }) {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Rename modal state
  const [renamingProject, setRenamingProject] = useState(null);
  const [newName, setNewName] = useState('');
  const [renamingLoading, setRenamingLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectService.getProjects({ limit: 100 });
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

  const handleDuplicate = async (projectId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
    try {
      const data = await projectService.duplicateProject(projectId);
      setActionSuccess('Project duplicated successfully!');
      setTimeout(() => setActionSuccess(''), 3500);
      await fetchProjects();
    } catch (err) {
      setError(err.message || 'Failed to duplicate project');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleDelete = async (projectId, projectName, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
    if (!confirm(`Are you sure you want to delete "${projectName}"?`)) return;

    try {
      await projectService.deleteProject(projectId);
      setActionSuccess('Project deleted successfully.');
      setTimeout(() => setActionSuccess(''), 3500);
      await fetchProjects();
    } catch (err) {
      setError(err.message || 'Failed to delete project. Projects past draft cannot be deleted.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleOpenRename = (project, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
    setRenamingProject(project);
    setNewName(project.name);
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !renamingProject) return;
    try {
      setRenamingLoading(true);
      await projectService.updateProject(renamingProject._id, { name: newName.trim() });
      setRenamingProject(null);
      setActionSuccess('Project renamed successfully');
      setTimeout(() => setActionSuccess(''), 3000);
      await fetchProjects();
    } catch (err) {
      setError(err.message || 'Failed to rename project');
    } finally {
      setRenamingLoading(false);
    }
  };

  // Filter projects by search and property type
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.projectCode && p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = propertyFilter === 'ALL' || p.propertyType === propertyFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Architectural Project Workspace</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Welcome back, {user?.name}. Model 3D environments, perform virtual staging, and generate architectural renders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Refresh projects"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/projects/new"
            className="arch-button-primary flex items-center gap-2 shadow-lg shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New 3D Project</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{projects.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/80 text-sky-600 dark:text-sky-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Architectural workspaces created</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">3D Models</p>
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                {projects.filter((p) => p.status !== 'CANCELLED').length}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/80 text-sky-600 dark:text-sky-400">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Active modeling workspaces</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Virtual Staging</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">Ready</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">AI room photo transformation</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Render Studio</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">4K / 8K</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Multi-angle lighting engine</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 text-xs">
          {[
            { id: 'ALL', label: 'All Types' },
            { id: 'RESIDENTIAL', label: 'Residential' },
            { id: 'COMMERCIAL', label: 'Commercial' },
            { id: 'MIXED_USE', label: 'Mixed-Use' },
            { id: 'HOSPITALITY', label: 'Hospitality' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPropertyFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                propertyFilter === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or codes..."
            className="arch-input pl-9 text-xs py-2"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="arch-card p-12 text-center text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-sky-600 dark:text-sky-400" />
          <p className="text-xs">Loading architectural workspaces...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="arch-card p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 flex items-center justify-center text-sky-600 dark:text-sky-400 mx-auto">
              <Box className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {projects.length === 0 ? 'No 3D architectural projects yet' : 'No matching projects found'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {projects.length === 0
                ? 'Create your first 3D project to begin modeling architectural structures, arranging furniture, and generating renders.'
                : 'Try adjusting your search criteria or resetting the property type filter.'}
            </p>
            {projects.length === 0 && (
              <div className="pt-2">
                <Link href="/projects/new" className="arch-button-primary text-xs inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Create First 3D Project</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="arch-card flex flex-col justify-between overflow-hidden group hover:border-sky-500/60 transition-all shadow-md hover:shadow-xl"
            >
              {/* Card Header & Preview Graphic */}
              <div className="p-5 pb-4 space-y-4">
                {/* Top strip */}
                <div className="flex justify-between items-center relative">
                  <span className="font-mono text-[11px] text-sky-700 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/70 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800/60">
                    {project.projectCode || 'DRAFT'}
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={project.status} />
                    {/* Action dropdown menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveMenuId(activeMenuId === project._id ? null : project._id);
                        }}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        title="Project options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === project._id && (
                        <div
                          className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 py-1 text-xs divide-y divide-slate-100 dark:divide-slate-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleOpenRename(project, e)}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={(e) => handleDuplicate(project._id, e)}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                          >
                            <Copy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Duplicate</span>
                          </button>
                          {project.status === 'DRAFT' && (
                            <button
                              onClick={(e) => handleDelete(project._id, project.name, e)}
                              className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3D Scene Isometric Thumbnail Banner */}
                <Link
                  href={`/projects/${project._id}/editor`}
                  className="block relative h-32 rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50 dark:from-slate-900 dark:via-slate-950 dark:to-sky-950/40 border border-slate-200 dark:border-slate-800/80 group-hover:border-sky-500/40 transition-colors overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {project.thumbnailUrl ? (
                    <img
                      src={getAssetUrl(project.thumbnailUrl)}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center space-y-1 select-none pointer-events-none">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 border border-sky-200 dark:border-sky-700/60 flex items-center justify-center text-sky-600 dark:text-sky-400 mx-auto group-hover:scale-110 transition-transform shadow-inner">
                        <Box className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                        Interactive 3D Workspace
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-white/80 dark:bg-black/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1 shadow-sm">
                    <span>Open Editor</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </div>
                </Link>

                {/* Title and metadata */}
                <div>
                  <Link
                    href={`/projects/${project._id}`}
                    className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors line-clamp-1"
                  >
                    {project.name}
                  </Link>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                    {project.description || 'Architectural scene workspace ready for 3D modeling.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{project.propertyType?.replace(/_/g, ' ')}</span>
                  </div>
                  {project.updatedAt && (
                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                      Mod: {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Launch Action Strip */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/70 border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 gap-1.5 text-center text-xs">
                <Link
                  href={`/projects/${project._id}/editor`}
                  className="py-1.5 px-1 rounded-lg bg-sky-50 hover:bg-sky-600 dark:bg-sky-600/20 dark:hover:bg-sky-600 border border-sky-200 hover:border-sky-600 dark:border-sky-500/40 dark:hover:border-sky-500 text-sky-700 hover:text-white dark:text-sky-300 dark:hover:text-white transition flex flex-col items-center gap-1"
                  title="Open in 3D Modeling Workspace"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">3D Editor</span>
                </Link>

                <Link
                  href={`/projects/${project._id}?tab=STAGING`}
                  className="py-1.5 px-1 rounded-lg bg-amber-50 hover:bg-amber-600 dark:bg-amber-600/10 dark:hover:bg-amber-600/30 border border-amber-200 hover:border-amber-600 dark:border-amber-500/30 dark:hover:border-amber-500/60 text-amber-700 hover:text-white dark:text-amber-300 transition flex flex-col items-center gap-1"
                  title="Virtual Staging Studio"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">Staging</span>
                </Link>

                <Link
                  href={`/projects/${project._id}?tab=RENDER`}
                  className="py-1.5 px-1 rounded-lg bg-slate-100 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 hover:border-slate-700 dark:border-slate-700 text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white transition flex flex-col items-center gap-1"
                  title="Architectural Rendering Studio"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">Render</span>
                </Link>

                <Link
                  href={`/projects/${project._id}?tab=WALKTHROUGH`}
                  className="py-1.5 px-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-600/10 dark:hover:bg-emerald-600/30 border border-emerald-200 hover:border-emerald-600 dark:border-emerald-500/30 dark:hover:border-emerald-500/60 text-emerald-700 hover:text-white dark:text-emerald-300 transition flex flex-col items-center gap-1"
                  title="First-Person 3D Walkthrough"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">Tour</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Modal */}
      {renamingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm">
          <div className="max-w-sm w-full arch-card p-6 space-y-4 border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Rename 3D Project</h3>
            <form onSubmit={handleSaveRename} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="arch-input text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenamingProject(null)}
                  className="arch-button-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renamingLoading}
                  className="arch-button-primary text-xs"
                >
                  {renamingLoading ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
