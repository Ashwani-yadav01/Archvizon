'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Sparkles,
  Camera,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Layers,
  Compass,
  Download,
  Eye,
  Maximize2,
  Palette
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 border-b border-slate-200 dark:border-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/80 dark:bg-sky-950/60 dark:text-sky-400 text-xs font-medium mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
            <span>Browser-Based 3D Architectural Design & Virtual Staging</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Design, furnish, and render architecture{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 dark:from-sky-400 dark:via-indigo-300 dark:to-sky-200">
              directly in your browser
            </span>
            .
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
            A Blender-inspired web platform built specifically for architects, interior designers, and real estate developers. Model 3D spaces, arrange furniture, perform AI virtual staging, and render photorealistic architectural visualizations.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="arch-button-primary text-base !py-3.5 !px-8 shadow-xl shadow-sky-600/30 flex items-center gap-2"
                >
                  <span>Open Workspace Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href="/projects/new"
                  className="arch-button-secondary text-base !py-3.5 !px-8 flex items-center gap-2"
                >
                  <span>New 3D Project</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="arch-button-primary text-base !py-3.5 !px-8 shadow-xl shadow-sky-600/30 flex items-center gap-2"
                >
                  <span>Launch 3D Workspace</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link href="/register" className="arch-button-secondary text-base !py-3.5 !px-8">
                  Create Free Account
                </Link>
              </>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800/60">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">Three.js</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Real-Time WebGL</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">4K / 8K</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Render Presets</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">AI Staging</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Room Transformation</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">GLTF / GLB</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Full 3D Export</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-slate-50/60 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-2 font-semibold">Core Capabilities</h2>
            <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Everything You Need to Visualize Spaces</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: 3D Modeling & Architecture */}
            <div className="arch-card p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/80 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-6">
                  <Box className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Interactive 3D Editor</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Blender-inspired viewport with translation/rotation/scale gizmos, primitive meshes, parametric walls, floors, doors, and windows with millimeter precision.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/60 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Outliner hierarchy & numeric transforms
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Snapping to grid & surface alignment
                </li>
              </ul>
            </div>

            {/* Feature 2: Interior Design & Asset Library */}
            <div className="arch-card p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Interior Design Suite</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Extensive furniture library featuring sofas, tables, beds, and lighting. Apply architectural materials including hardwoods, marble, concrete, and glass.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/60 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Curated designer furniture library
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> PBR materials & lighting controls
                </li>
              </ul>
            </div>

            {/* Feature 3: Virtual Staging */}
            <div className="arch-card p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Virtual Staging</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Transform raw photographs of vacant rooms into furnished interior scenes. Select room types and design styles (Modern, Scandinavian, Luxury) with interactive before/after sliders.
                </p>
              </div>
              <ul className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/60 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Split-screen before & after comparison
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Automated room styling pipeline
                </li>
              </ul>
            </div>
          </div>

          {/* Secondary Row: Walkthrough & Rendering */}
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="arch-card p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">First-Person 3D Walkthrough</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Step inside your architectural designs in real-time. Navigate room-to-room using standard WASD keys and mouse look, exploring lighting and spatial proportions at human eye-level.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                <span>Pointer Lock Navigation</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">60 FPS Smooth</span>
              </div>
            </div>

            <div className="arch-card p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/80 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-6">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Architectural Rendering Studio</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Configure camera perspectives, sun elevation, and lighting scenarios (Day, Golden Hour, Dramatic Night). Queue rendering jobs to produce publication-ready 4K and 8K master images.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                <span>Multi-Sample Raymarching</span>
                <span className="text-sky-600 dark:text-sky-400 font-semibold">Ultra High Definition</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 border-t border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-2 font-semibold">End-to-End Workflow</h2>
            <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">From Blank Canvas to Rendered Masterpiece</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-bold">01 / MODEL</span>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-2">Create Structure</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Draw parametric walls, position door openings, and build floor plates with accurate dimensions.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-bold">02 / FURNISH</span>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-2">Style Interiors</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Place curated furniture, fixtures, and lighting, and assign realistic PBR materials and finishes.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-bold">03 / STAGE</span>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-2">Virtual Staging</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Upload vacant property photos to generate furnished visualizations across popular design aesthetics.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-bold">04 / RENDER & EXPORT</span>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-2">Export Deliverables</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Capture high-res 4K renders, explore in first-person 3D, and download standard GLTF/GLB files.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
