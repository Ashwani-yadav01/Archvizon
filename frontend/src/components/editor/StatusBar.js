'use client';

import React from 'react';
import { Box, Layers, Globe, Magnet } from 'lucide-react';

export default function StatusBar({
  objectsCount = 0,
  verticesCount = 0,
  trianglesCount = 0,
  selectedObject = null,
  transformMode = 'translate',
  transformSpace = 'world',
  snapEnabled = true,
  snapStep = 0.5
}) {
  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-800 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-20">
      {/* Left: Scene Statistics */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Box className="w-3 h-3 text-sky-400" />
          <span>Objects: {objectsCount}</span>
        </div>
        <span className="text-slate-700">|</span>
        <span>Verts: {verticesCount.toLocaleString()}</span>
        <span className="text-slate-700">|</span>
        <span>Tris: {trianglesCount.toLocaleString()}</span>
      </div>

      {/* Center: Selected Object Context */}
      <div className="hidden md:flex items-center gap-2 text-slate-300 truncate max-w-md">
        {selectedObject ? (
          <>
            <span className="text-sky-400 font-semibold">{selectedObject.name}</span>
            <span className="text-slate-500">
              [{selectedObject.position?.x?.toFixed(1)}, {selectedObject.position?.y?.toFixed(1)},{' '}
              {selectedObject.position?.z?.toFixed(1)}]
            </span>
          </>
        ) : (
          <span className="text-slate-600">No selection (click mesh or use outliner)</span>
        )}
      </div>

      {/* Right: Viewport Engine & Snapping Status */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-sky-400" />
          <span className="uppercase">{transformSpace}</span>
        </div>

        <span className="text-slate-700 hidden sm:inline">|</span>

        <div className="flex items-center gap-1 text-slate-300">
          <Magnet className={`w-3 h-3 ${snapEnabled ? 'text-emerald-400' : 'text-slate-600'}`} />
          <span>{snapEnabled ? `Snap ${snapStep}m` : 'Snap Off'}</span>
        </div>

        <span className="text-slate-700">|</span>

        <span className="text-slate-500 text-[10px]">Three.js r187 WebGL</span>
      </div>
    </footer>
  );
}
