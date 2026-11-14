'use client';

import React from 'react';
import { X, CheckCircle2, AlertTriangle, Box, Video, Globe, FileCode, Layers } from 'lucide-react';

export default function FormatLimitationsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-800 text-sky-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Deliverable Format Compatibility Guide</h3>
            <p className="text-xs text-slate-400">
              Technical specifications for web-browser rendering and external production tools.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Section 1: In-Browser Supported Formats */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-900/60 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Native Browser Playback & Interactive Viewing Supported</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  Walkthrough Videos
                </span>
                <p className="text-[11px] text-slate-400">
                  <strong className="text-slate-200">.mp4</strong> (H.264/AAC), <strong className="text-slate-200">.webm</strong> (VP9). Up to 4K 60fps streaming.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  360° Spherical Panoramas
                </span>
                <p className="text-[11px] text-slate-400">
                  Equirectangular <strong className="text-slate-200">.jpg</strong>, <strong className="text-slate-200">.png</strong>, <strong className="text-slate-200">.webp</strong> rendered via WebGL sphere projection.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Virtual Staging Comparison
                </span>
                <p className="text-[11px] text-slate-400">
                  Side-by-side and interactive split slider for <strong className="text-slate-200">.jpg</strong>, <strong className="text-slate-200">.png</strong> before/after pairs.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-sky-400" />
                  Interactive 3D Assets
                </span>
                <p className="text-[11px] text-slate-400">
                  <strong className="text-slate-200">.glb</strong>, <strong className="text-slate-200">.gltf</strong> (glTF 2.0 WebGL standard).
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: External Hosted Integrations */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-sky-900/60 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-semibold font-mono">
              <Globe className="w-4 h-4" />
              <span>Supported Hosted Virtual Tour Embeds</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Archvizon seamlessly embeds authenticated external virtual tours through sandboxed WebGL viewports:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-sky-300">Matterport 3D Showcase</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-sky-300">Kuula 360 Virtual Tours</span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-sky-300">CloudFront / S3 Secure Streams</span>
            </div>
          </div>

          {/* Section 3: Proprietary Production Formats (Download Only) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-900/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono">
              <AlertTriangle className="w-4 h-4" />
              <span>Format Limitations & External Tool Requirements</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              The following formats cannot be directly rendered in standard web browsers due to proprietary geometry engines, shader dependencies, or memory constraints. They are stored securely for download and viewing inside external software:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-200 block font-bold">.max</span>
                <span className="text-slate-500 text-[10px]">Autodesk 3ds Max</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-200 block font-bold">.blend</span>
                <span className="text-slate-500 text-[10px]">Blender Studio</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-200 block font-bold">.d5a / .d5</span>
                <span className="text-slate-500 text-[10px]">D5 Render Engine</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-200 block font-bold">.rvt / .rfa</span>
                <span className="text-slate-500 text-[10px]">Autodesk Revit BIM</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-200 block font-bold">.dwg / .dxf</span>
                <span className="text-slate-500 text-[10px]">AutoCAD 2D/3D</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-200 block font-bold">.skp</span>
                <span className="text-slate-500 text-[10px]">Trimble SketchUp</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
          <button onClick={onClose} className="arch-btn-primary text-xs py-2 px-4">
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
