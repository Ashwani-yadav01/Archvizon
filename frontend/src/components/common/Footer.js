import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-950 py-8 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300">© {new Date().getFullYear()} Archvizon. All rights reserved.</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">
            Architectural CGI Rendering • Virtual Staging • Virtual Walkthroughs
          </p>
        </div>
        <div className="flex gap-6 text-slate-500 dark:text-slate-400">
          <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors">Security Standards</span>
          <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors">Production SLA</span>
        </div>
      </div>
    </footer>
  );
}
