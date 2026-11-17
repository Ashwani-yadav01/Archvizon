'use client';

import React from 'react';
import Link from 'next/link';
import ThemeToggle from '../common/ThemeToggle';
import {
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  Move,
  RotateCw,
  Scaling,
  Magnet,
  Globe,
  Box,
  Layers,
  Sparkles,
  Camera,
  Compass,
  Download,
  Loader2,
  Check,
  Eye,
  Sliders
} from 'lucide-react';

export default function TopToolbar({
  projectName = '3D Scene',
  projectCode = 'AV-SCENE',
  saveStatus = 'saved', // 'saved', 'saving', 'dirty'
  onSave = () => {},
  canUndo = false,
  canRedo = false,
  onUndo = () => {},
  onRedo = () => {},
  transformMode = 'translate',
  onChangeTransformMode = () => {},
  transformSpace = 'world',
  onChangeTransformSpace = () => {},
  snapEnabled = true,
  onToggleSnap = () => {},
  snapStep = 0.5,
  onChangeSnapStep = () => {},
  shadingMode = 'MATERIAL',
  onChangeShadingMode = () => {},
  activeWorkspaceMode = 'MODEL', // 'MODEL', 'ARCHITECTURE', 'INTERIOR', 'WALKTHROUGH', 'RENDER'
  onChangeWorkspaceMode = () => {},
  onExportGLTF = () => {},
  onExportJSON = () => {}
}) {
  return (
    <header className="h-13 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between text-xs select-none z-30">
      {/* Left: Navigation, Title & Save Status */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Back to Projects Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight line-clamp-1 max-w-[180px] sm:max-w-[240px]">
              {projectName}
            </span>
            <span className="font-mono text-[10px] text-sky-400 bg-sky-950/70 border border-sky-800/60 px-1.5 py-0.2 rounded">
              {projectCode}
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Save button & status */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
              saveStatus === 'dirty'
                ? 'bg-sky-600 hover:bg-sky-500 text-white shadow'
                : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
            }`}
            title="Save Scene (Ctrl+S)"
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saveStatus === 'dirty' ? (
              <Save className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden sm:inline">
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'dirty' ? 'Save' : 'Saved'}
            </span>
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center rounded-md bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1 rounded transition ${
                canUndo ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1 rounded transition ${
                canRedo ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Center: Transform Tools, Space & Grid Snapping */}
      <div className="flex items-center gap-2">
        {/* Transform Mode Switcher */}
        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
          <button
            onClick={() => onChangeTransformMode('translate')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              transformMode === 'translate' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
            title="Translate Gizmo (W)"
          >
            <Move className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Move</span>
          </button>

          <button
            onClick={() => onChangeTransformMode('rotate')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              transformMode === 'rotate' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
            title="Rotate Gizmo (E)"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Rotate</span>
          </button>

          <button
            onClick={() => onChangeTransformMode('scale')}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              transformMode === 'scale' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
            title="Scale Gizmo (R)"
          >
            <Scaling className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Scale</span>
          </button>
        </div>

        {/* Space Toggle */}
        <button
          onClick={() => onChangeTransformSpace(transformSpace === 'world' ? 'local' : 'world')}
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
          title="Toggle World / Local Coordinate Orientation"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-mono uppercase">{transformSpace}</span>
        </button>

        {/* Snap Toggle & Step */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md p-0.5">
          <button
            onClick={onToggleSnap}
            className={`p-1 rounded transition ${
              snapEnabled ? 'bg-sky-600 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={snapEnabled ? 'Grid Snapping Active' : 'Enable Grid Snapping'}
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          {snapEnabled && (
            <select
              value={snapStep}
              onChange={(e) => onChangeSnapStep(parseFloat(e.target.value))}
              className="bg-transparent text-[11px] font-mono text-slate-300 pr-1 focus:outline-none cursor-pointer"
            >
              <option value="0.1" className="bg-slate-900">0.1m</option>
              <option value="0.5" className="bg-slate-900">0.5m</option>
              <option value="1.0" className="bg-slate-900">1.0m</option>
            </select>
          )}
        </div>
      </div>

      {/* Right: Shading Modes & Export */}
      <div className="flex items-center gap-2">
        {/* Shading Mode */}
        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-mono">
          {[
            { id: 'WIREFRAME', label: 'Wire' },
            { id: 'SOLID', label: 'Solid' },
            { id: 'MATERIAL', label: 'Mat' },
            { id: 'RENDERED', label: 'Render' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => onChangeShadingMode(mode.id)}
              className={`px-2 py-1 rounded transition ${
                shadingMode === mode.id ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Export Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExportGLTF}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 hover:text-sky-300 font-medium text-xs flex items-center gap-1.5 transition shadow"
            title="Download 3D Scene in Binary GLTF (.glb) format"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export GLB</span>
          </button>

          <button
            onClick={onExportJSON}
            className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1 transition shadow"
            title="Export Scene hierarchy and materials as JSON"
          >
            <span className="hidden sm:inline">JSON</span>
          </button>

          <ThemeToggle className="!p-1.5 !w-7 !h-7" />
        </div>
      </div>
    </header>
  );
}
