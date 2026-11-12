import React from 'react';

const statusStyles = {
  // Project statuses
  DRAFT: 'bg-slate-800 text-slate-300 border-slate-700',
  SUBMITTED: 'bg-sky-950/80 text-sky-400 border-sky-800',
  UNDER_REVIEW: 'bg-amber-950/80 text-amber-400 border-amber-800',
  AWAITING_INFORMATION: 'bg-orange-950/80 text-orange-400 border-orange-800',
  ASSIGNED: 'bg-indigo-950/80 text-indigo-400 border-indigo-800',
  IN_PROGRESS: 'bg-blue-950/80 text-blue-400 border-blue-800',
  INTERNAL_REVIEW: 'bg-purple-950/80 text-purple-400 border-purple-800',
  CLIENT_REVIEW: 'bg-cyan-950/80 text-cyan-400 border-cyan-800',
  REVISION_REQUESTED: 'bg-rose-950/80 text-rose-400 border-rose-800',
  APPROVED: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
  COMPLETED: 'bg-green-950/80 text-green-400 border-green-800',
  CANCELLED: 'bg-red-950/80 text-red-400 border-red-800',

  // Roles
  CLIENT: 'bg-slate-800 text-slate-300 border-slate-700',
  VISUALIZATION_ARTIST: 'bg-violet-950/80 text-violet-300 border-violet-800',
  PROJECT_MANAGER: 'bg-blue-950/80 text-blue-300 border-blue-800',
  ADMIN: 'bg-amber-950/80 text-amber-300 border-amber-800'
};

export default function StatusBadge({ status, label }) {
  const displayLabel = label || (status ? status.replace(/_/g, ' ') : '');
  const style = statusStyles[status] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {displayLabel}
    </span>
  );
}
