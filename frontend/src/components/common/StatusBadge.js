import React from 'react';

const statusStyles = {
  // Project statuses
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  SUBMITTED: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/80 dark:text-sky-400 dark:border-sky-800',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800',
  AWAITING_INFORMATION: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/80 dark:text-orange-400 dark:border-orange-800',
  ASSIGNED: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-400 dark:border-indigo-800',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-400 dark:border-blue-800',
  INTERNAL_REVIEW: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/80 dark:text-purple-400 dark:border-purple-800',
  CLIENT_REVIEW: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/80 dark:text-cyan-400 dark:border-cyan-800',
  REVISION_REQUESTED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/80 dark:text-green-400 dark:border-green-800',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/80 dark:text-red-400 dark:border-red-800',

  // Roles & Account Types
  CLIENT: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  FIRM: 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700 font-semibold',
  FIRM_ADMIN: 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700 font-semibold',
  VISUALIZATION_ARTIST: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/80 dark:text-violet-300 dark:border-violet-800',
  PROJECT_MANAGER: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800',
  ADMIN: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
};

export default function StatusBadge({ status, label }) {
  const displayLabel = label || (status ? status.replace(/_/g, ' ') : '');
  const style = statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {displayLabel}
    </span>
  );
}
