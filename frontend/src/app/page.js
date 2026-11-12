import Link from 'next/link';
import { Eye, Sparkles, Video, ArrowRight, CheckCircle2, ShieldCheck, Clock, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 border-b border-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(2,132,199,0.15),rgba(255,255,255,0))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-800/80 bg-sky-950/50 text-sky-400 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Architectural Production Management
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Turn architectural concepts into <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">photorealistic realities</span>.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-light">
            A single, structured platform for real estate developers and architects to submit materials, collaborate with master 3D artists, track revisions, and approve deliverables.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="arch-button-primary text-base !py-3.5 !px-8 shadow-lg shadow-sky-600/30">
              Start a Project
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/login" className="arch-button-secondary text-base !py-3.5 !px-8">
              Sign In to Portal
            </Link>
          </div>

          {/* Quick trust metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-slate-800/60">
            <div>
              <p className="text-2xl font-bold text-white font-mono">100%</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Traceable Briefs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono">4K / 8K</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Render Outputs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono">V1 to Final</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Strict Versioning</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono">RBAC</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Secure Isolation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Core Services Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-sky-400 mb-2">Service Offerings</h2>
            <p className="text-3xl font-bold text-white tracking-tight">Built for Professional Visualization Workflows</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="arch-card p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-sky-950/80 border border-sky-800/80 flex items-center justify-center text-sky-400 mb-6">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Architectural CGI Rendering</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Photorealistic interior, exterior, and aerial imagery produced from CAD drawings, BIM models, and detailed finishes.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-800/60 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Day, dusk & night lighting scenarios
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Precise material specification
                </li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="arch-card p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Manual Virtual Staging</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Human-crafted furnishing and interior decoration for empty or dated rooms, complete with side-by-side before/after comparison.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-800/60 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Modern, luxury & Scandinavian palettes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Curated designer furniture pieces
                </li>
              </ul>
            </div>

            {/* Service 3 */}
            <div className="arch-card p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-indigo-950/80 border border-indigo-800/80 flex items-center justify-center text-indigo-400 mb-6">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Virtual Walkthroughs</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Cinematic camera flights, 360-degree interactive panorama tours, and browser-viewable 3D property experiences.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-800/60 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> High-frame-rate video playback
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Hosted immersive link integration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Production Lifecycle Section */}
      <section className="py-20 border-t border-slate-900 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-sky-400 mb-2">Transparent Production</h2>
            <p className="text-3xl font-bold text-white tracking-tight">Structured from Intake to Approval</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-mono text-sky-400 font-bold">01 / SUBMIT</span>
              <h4 className="text-base font-semibold text-white mt-2">Brief & Source Files</h4>
              <p className="text-xs text-slate-400 mt-2">
                Clients upload CAD drawings, reference images, camera preferences, and desired styles.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-mono text-sky-400 font-bold">02 / TRIAGE</span>
              <h4 className="text-base font-semibold text-white mt-2">PM Review & Assign</h4>
              <p className="text-xs text-slate-400 mt-2">
                Project managers clarify missing information and assign specialized visualization artists.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-mono text-sky-400 font-bold">03 / REVIEW</span>
              <h4 className="text-base font-semibold text-white mt-2">Versioned Feedback</h4>
              <p className="text-xs text-slate-400 mt-2">
                Watermarked previews are submitted; clients comment and request specific revisions.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-mono text-sky-400 font-bold">04 / DELIVER</span>
              <h4 className="text-base font-semibold text-white mt-2">Approval & Secure DL</h4>
              <p className="text-xs text-slate-400 mt-2">
                Client signs off, and full-resolution unwatermarked deliverables are unlocked for download.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
