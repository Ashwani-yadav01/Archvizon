import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <p>© {new Date().getFullYear()} Archvizon. All rights reserved.</p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Architectural CGI Rendering • Virtual Staging • Virtual Walkthroughs
          </p>
        </div>
        <div className="flex gap-6">
          <span className="hover:text-slate-400 cursor-pointer">Security Standards</span>
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Production SLA</span>
        </div>
      </div>
    </footer>
  );
}
