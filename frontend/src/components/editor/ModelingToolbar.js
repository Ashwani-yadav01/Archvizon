'use client';

import React, { useState } from 'react';
import {
  MousePointer,
  Move,
  RotateCw,
  Scaling,
  Box,
  Circle,
  Cylinder,
  Square,
  Triangle,
  Plus,
  Trash2,
  Copy,
  Layers,
  Building,
  DoorOpen,
  AppWindow,
  Columns,
  Scissors,
  Wand2
} from 'lucide-react';

export default function ModelingToolbar({
  activeTool = 'select', // 'select', 'translate', 'rotate', 'scale'
  onChangeActiveTool = () => {},
  onAddPrimitive = () => {},
  onAddArchitectural = () => {},
  onDuplicate = () => {},
  onDelete = () => {},
  onSubdivide = () => {},
  onBevel = () => {},
  onToggleAssetLibrary = () => {},
  isAssetLibraryOpen = false,
  hasSelection = false
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showArchMenu, setShowArchMenu] = useState(false);

  return (
    <aside className="w-13 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-3 gap-2 select-none z-20">
      {/* Selection & Transformation Tools */}
      <button
        onClick={() => onChangeActiveTool('select')}
        className={`p-2.5 rounded-xl transition ${
          activeTool === 'select'
            ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-900'
        }`}
        title="Select & Inspect (Q)"
      >
        <MousePointer className="w-4 h-4" />
      </button>

      <button
        onClick={() => onChangeActiveTool('translate')}
        className={`p-2.5 rounded-xl transition ${
          activeTool === 'translate'
            ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-900'
        }`}
        title="Translate Gizmo (W)"
      >
        <Move className="w-4 h-4" />
      </button>

      <button
        onClick={() => onChangeActiveTool('rotate')}
        className={`p-2.5 rounded-xl transition ${
          activeTool === 'rotate'
            ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-900'
        }`}
        title="Rotate Gizmo (E)"
      >
        <RotateCw className="w-4 h-4" />
      </button>

      <button
        onClick={() => onChangeActiveTool('scale')}
        className={`p-2.5 rounded-xl transition ${
          activeTool === 'scale'
            ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-900'
        }`}
        title="Scale Gizmo (R)"
      >
        <Scaling className="w-4 h-4" />
      </button>

      <div className="w-6 h-px bg-slate-800 my-1" />

      {/* Add Primitives Flyout Menu */}
      <div className="relative">
        <button
          onClick={() => {
            setShowAddMenu(!showAddMenu);
            setShowArchMenu(false);
          }}
          className={`p-2.5 rounded-xl transition ${
            showAddMenu
              ? 'bg-sky-950 border border-sky-600 text-sky-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Add 3D Primitives (Shift+A)"
        >
          <Box className="w-4 h-4 text-sky-400" />
        </button>

        {showAddMenu && (
          <div className="absolute left-14 top-0 w-44 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-40 text-xs space-y-1">
            <p className="px-2 py-1 text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              Add Primitive Mesh
            </p>
            <button
              onClick={() => {
                onAddPrimitive('PRIMITIVE_CUBE');
                setShowAddMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
            >
              <Box className="w-3.5 h-3.5 text-sky-400" />
              <span>Cube</span>
            </button>
            <button
              onClick={() => {
                onAddPrimitive('PRIMITIVE_SPHERE');
                setShowAddMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
            >
              <Circle className="w-3.5 h-3.5 text-sky-400" />
              <span>Sphere</span>
            </button>
            <button
              onClick={() => {
                onAddPrimitive('PRIMITIVE_CYLINDER');
                setShowAddMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
            >
              <Cylinder className="w-3.5 h-3.5 text-sky-400" />
              <span>Cylinder</span>
            </button>
            <button
              onClick={() => {
                onAddPrimitive('PRIMITIVE_PLANE');
                setShowAddMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
            >
              <Square className="w-3.5 h-3.5 text-sky-400" />
              <span>Plane</span>
            </button>
            <button
              onClick={() => {
                onAddPrimitive('PRIMITIVE_CONE');
                setShowAddMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
            >
              <Triangle className="w-3.5 h-3.5 text-sky-400" />
              <span>Cone</span>
            </button>
          </div>
        )}
      </div>

      {/* Architectural Constructs Menu */}
      <div className="relative">
        <button
          onClick={() => {
            setShowArchMenu(!showArchMenu);
            setShowAddMenu(false);
          }}
          className={`p-2.5 rounded-xl transition ${
            showArchMenu
              ? 'bg-indigo-950 border border-indigo-600 text-indigo-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Architectural Constructs"
        >
          <Building className="w-4 h-4 text-indigo-400" />
        </button>

        {showArchMenu && (
          <div className="absolute left-14 top-0 w-48 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-40 text-xs space-y-1">
            <p className="px-2 py-1 text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              Architectural Elements
            </p>
            <button
              onClick={() => {
                onAddArchitectural('WALL');
                setShowArchMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Parametric Wall</span>
            </button>
            <button
              onClick={() => {
                onAddArchitectural('FLOOR');
                setShowArchMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
            >
              <Square className="w-3.5 h-3.5 text-indigo-400" />
              <span>Floor Plate</span>
            </button>
            <button
              onClick={() => {
                onAddArchitectural('DOOR');
                setShowArchMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
            >
              <DoorOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Door Opening</span>
            </button>
            <button
              onClick={() => {
                onAddArchitectural('WINDOW');
                setShowArchMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
            >
              <AppWindow className="w-3.5 h-3.5 text-indigo-400" />
              <span>Window Opening</span>
            </button>
            <button
              onClick={() => {
                onAddArchitectural('COLUMN');
                setShowArchMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
            >
              <Columns className="w-3.5 h-3.5 text-indigo-400" />
              <span>Architectural Column</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-6 h-px bg-slate-800 my-1" />

      {/* Asset Library Toggle Button */}
      <button
        onClick={onToggleAssetLibrary}
        className={`p-2.5 rounded-xl transition ${
          isAssetLibraryOpen
            ? 'bg-amber-950 border border-amber-600 text-amber-400'
            : 'text-slate-400 hover:text-white hover:bg-slate-900'
        }`}
        title="Open Asset & Furniture Library"
      >
        <Layers className="w-4 h-4 text-amber-400" />
      </button>

      {/* Duplicate & Delete Actions */}
      <button
        onClick={onDuplicate}
        disabled={!hasSelection}
        className={`p-2.5 rounded-xl transition ${
          hasSelection
            ? 'text-slate-300 hover:text-white hover:bg-slate-900'
            : 'text-slate-600 cursor-not-allowed'
        }`}
        title="Duplicate Active Object (Shift+D)"
      >
        <Copy className="w-4 h-4" />
      </button>

      <button
        onClick={onDelete}
        disabled={!hasSelection}
        className={`p-2.5 rounded-xl transition ${
          hasSelection
            ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40'
            : 'text-slate-600 cursor-not-allowed'
        }`}
        title="Delete Selected Object (Del / X)"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="w-6 h-px bg-slate-800 my-1" />

      {/* Mesh Modifiers */}
      <button
        onClick={onSubdivide}
        disabled={!hasSelection}
        className={`p-2.5 rounded-xl transition ${
          hasSelection
            ? 'text-slate-400 hover:text-sky-300 hover:bg-slate-900'
            : 'text-slate-600 cursor-not-allowed'
        }`}
        title="Subdivide Mesh Geometry"
      >
        <Scissors className="w-4 h-4" />
      </button>

      <button
        onClick={onBevel}
        disabled={!hasSelection}
        className={`p-2.5 rounded-xl transition ${
          hasSelection
            ? 'text-slate-400 hover:text-sky-300 hover:bg-slate-900'
            : 'text-slate-600 cursor-not-allowed'
        }`}
        title="Bevel Edge Modifier"
      >
        <Wand2 className="w-4 h-4" />
      </button>
    </aside>
  );
}
