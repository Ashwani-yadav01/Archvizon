'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Palette,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Building,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import projectService from '../../services/projectService';

export default function ArtistDashboard({ user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAssignedProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectService.getProjects({ limit: 50 });
      setProjects(data?.projects || []);
    } catch (err) {
      console.error('Failed to load artist projects:', err);
      setError(err?.message || 'Failed to load assigned projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  const inProductionCount = projects.filter((p) =>
    ['ASSIGNED', 'IN_PROGRESS', 'INTERNAL_REVIEW'].includes(p.status)
  ).length;
  const revisionCount = projects.filter((p) => p.status === 'REVISION_REQUESTED').length;
  const completedCount = projects.filter((p) =>
    ['APPROVED', 'COMPLETED'].includes(p.status)
  ).length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Artist Studio</h1>
            <StatusBadge status={user?.role} />
          </div>
          <p className="text-xs text-slate-400">
            Assigned visualization work, scene source files, revision requests, and deliverable uploads.
          </p>
        </div>

        <button
          onClick={fetchAssignedProjects}
          disabled={loading}
          className="arch-btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
          title="Refresh assigned projects"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Assigned Tasks</p>
              <p className="text-2xl font-bold text-white mt-1">{projects.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-950/80 border border-sky-800/80 text-sky-400">
              <Palette className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Total project briefs assigned to you</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">In Production</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{inProductionCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Under active 3D development</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Revision Backlog</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{revisionCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Client modification requests to fulfill</p>
        </div>

        <div className="arch-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Approved Renders</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Completed and accepted outputs</p>
        </div>
      </div>

      {/* Production Task Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Your Assigned Projects</h2>
            <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded-full font-mono">
              {projects.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="arch-card p-12 text-center text-slate-400 text-xs">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
            Loading assigned projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="arch-card p-10 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white">No active tasks assigned</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                When a project manager assigns a CGI rendering, staging, or walkthrough brief to you, it will appear here with downloadable source files and requirements.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="arch-card p-5 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded border border-sky-800">
                        {project.projectCode}
                      </span>
                      <StatusBadge status={project.status} />
                    </div>
                    <h3 className="text-base font-bold text-white hover:text-sky-300 transition">
                      <Link href={`/projects/${project._id}`}>{project.name}</Link>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/projects/${project._id}?tab=DELIVERABLES`}
                      className="arch-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
                      Deliverables
                    </Link>

                    <Link
                      href={`/projects/${project._id}`}
                      className="arch-btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
                    >
                      Workspace
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {project.propertyType?.replace(/_/g, ' ')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      Services: <strong className="text-slate-300">{project.services?.length || 0}</strong>
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    Client: {project.clientId?.name || 'Client'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
