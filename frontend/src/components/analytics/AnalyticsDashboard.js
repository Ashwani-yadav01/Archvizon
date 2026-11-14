'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Users,
  Calendar,
  Sparkles,
  RefreshCw,
  Camera,
  Sofa,
  Video
} from 'lucide-react';
import analyticsService from '../../services/analyticsService';

export default function AnalyticsDashboard({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [services, setServices] = useState(null);
  const [velocity, setVelocity] = useState([]);
  const [risks, setRisks] = useState(null);

  const isStaff = currentUser?.role === 'ADMIN' || currentUser?.role === 'PROJECT_MANAGER';

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const [ovData, distData, srvData, riskData] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getStatusDistribution(),
        analyticsService.getServiceDemand(),
        analyticsService.getDeadlineRisks()
      ]);

      setOverview(ovData);
      setDistribution(distData);
      setServices(srvData);
      setRisks(riskData);

      if (isStaff) {
        const velData = await analyticsService.getArtistVelocity();
        setVelocity(velData);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load analytics metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="arch-card p-12 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-sky-400" />
        <p className="text-xs font-mono">Aggregating production velocity and project metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="arch-card p-6 bg-rose-950/40 border-rose-800 text-rose-300 text-xs text-center space-y-2">
        <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
        <p>{error}</p>
        <button onClick={loadAnalytics} className="arch-btn-secondary text-xs py-1 px-3 mt-2">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span>Production & Performance Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time pipeline metrics, approval rates, artist workload, and deadline health.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="arch-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          title="Refresh metrics"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="arch-card p-4 space-y-1 border-l-4 border-l-sky-500">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Projects</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{overview.totalProjects}</span>
              <span className="text-xs font-mono text-sky-400">{overview.activeProjects} Active</span>
            </div>
            <p className="text-[10px] text-slate-500">
              {overview.completedProjects} delivered &bull; {overview.totalProjects - overview.activeProjects - overview.completedProjects} drafts/cancelled
            </p>
          </div>

          <div className="arch-card p-4 space-y-1 border-l-4 border-l-emerald-500">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Approval Rate</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-400">{overview.approvalRate}%</span>
              <span className="text-xs font-mono text-slate-400">{overview.approvedDeliverables}/{overview.totalDeliverables}</span>
            </div>
            <p className="text-[10px] text-slate-500">Client satisfaction on first or second iteration</p>
          </div>

          <div className="arch-card p-4 space-y-1 border-l-4 border-l-amber-500">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Revisions</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-400">{overview.totalRevisions}</span>
              <span className="text-xs font-mono text-slate-400">Iterations</span>
            </div>
            <p className="text-[10px] text-slate-500">Tracked client change requests addressed</p>
          </div>

          <div className="arch-card p-4 space-y-1 border-l-4 border-l-purple-500">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Avg Delivery Speed</p>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-purple-400">{overview.avgTurnaroundDays}</span>
              <span className="text-xs font-mono text-slate-400">Days</span>
            </div>
            <p className="text-[10px] text-slate-500">From brief submission to final client approval</p>
          </div>
        </div>
      )}

      {/* Deadline Risks & Overdue Alerts */}
      {risks && (risks.overdueCount > 0 || risks.approachingCount > 0 || risks.blockedCount > 0) && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Pipeline Attention Required ({risks.overdueCount + risks.approachingCount + risks.blockedCount})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {risks.overdueCount > 0 && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-rose-900/60">
                <span className="text-rose-400 font-mono font-bold block mb-1">
                  Overdue Projects ({risks.overdueCount})
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {risks.overdueProjects.map((p) => (
                    <p key={p._id} className="text-slate-300 text-[11px] truncate">
                      <strong>{p.projectCode}</strong>: {p.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {risks.approachingCount > 0 && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-900/60">
                <span className="text-amber-400 font-mono font-bold block mb-1">
                  Due Within 3 Days ({risks.approachingCount})
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {risks.approachingProjects.map((p) => (
                    <p key={p._id} className="text-slate-300 text-[11px] truncate">
                      <strong>{p.projectCode}</strong>: {p.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {risks.blockedCount > 0 && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-900/60">
                <span className="text-sky-400 font-mono font-bold block mb-1">
                  Awaiting Client Info ({risks.blockedCount})
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {risks.blockedProjects.map((p) => (
                    <p key={p._id} className="text-slate-300 text-[11px] truncate">
                      <strong>{p.projectCode}</strong>: {p.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid: Status Distribution & Service Demand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Breakdown */}
        {distribution && (
          <div className="arch-card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Project Pipeline Status
            </h3>
            <div className="space-y-2 text-xs">
              {Object.entries(distribution).map(([statusKey, count]) => {
                if (count === 0 && !['IN_PROGRESS', 'CLIENT_REVIEW', 'COMPLETED'].includes(statusKey)) return null;
                const total = overview?.totalProjects || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={statusKey} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 font-mono">{statusKey.replace(/_/g, ' ')}</span>
                      <span className="text-slate-400 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          statusKey === 'COMPLETED'
                            ? 'bg-emerald-500'
                            : statusKey === 'IN_PROGRESS'
                            ? 'bg-sky-500'
                            : statusKey === 'CLIENT_REVIEW'
                            ? 'bg-amber-500'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Service Type Demand */}
        {services && (
          <div className="arch-card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Service Category Distribution
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-950 text-sky-400">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Architectural CGI Rendering</span>
                    <span className="text-[11px] text-slate-400">Photorealistic interior & exterior stills</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-sky-400 font-mono">{services.CGI_RENDERING}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-950 text-amber-400">
                    <Sofa className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Manual Virtual Staging</span>
                    <span className="text-[11px] text-slate-400">Professionally furnished scene decoration</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-amber-400 font-mono">{services.VIRTUAL_STAGING}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Virtual Walkthroughs</span>
                    <span className="text-[11px] text-slate-400">Cinematic videos & 360° interactive scenes</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-emerald-400 font-mono">{services.VIRTUAL_WALKTHROUGH}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Artist Workload & Throughput (Staff Only) */}
      {isStaff && velocity.length > 0 && (
        <div className="arch-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Visualization Artist Production Velocity
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <tr>
                  <th className="pb-2.5">Artist</th>
                  <th className="pb-2.5">Active Assignments</th>
                  <th className="pb-2.5">Deliverables Uploaded</th>
                  <th className="pb-2.5">Revisions Addressed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {velocity.map((v) => (
                  <tr key={v.artistId} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 font-medium text-white">{v.name}</td>
                    <td className="py-2.5 text-sky-400">{v.assignedProjects} projects</td>
                    <td className="py-2.5 text-emerald-400">{v.deliverablesUploaded} versions</td>
                    <td className="py-2.5 text-amber-400">{v.revisionsResponded} resolved</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
