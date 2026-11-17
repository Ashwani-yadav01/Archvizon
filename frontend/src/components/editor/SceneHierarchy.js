'use client';

import React, { useState } from 'react';
import {
  Layers,
  Box,
  Circle,
  Cylinder,
  Square,
  Building,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Search,
  Plus,
  DoorOpen,
  AppWindow,
  Columns
} from 'lucide-react';

export default function SceneHierarchy({
  objects = [],
  selectedObjectId = null,
  onSelectObject = () => {},
  onToggleVisibility = () => {},
  onToggleLock = () => {},
  onRenameObject = () => {},
  onDuplicateObject = () => {},
  onDeleteObject = () => {},
  onAddPrimitive = () => {}
}) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const getObjectIcon = (type) => {
    switch (type) {
      case 'PRIMITIVE_SPHERE':
        return <Circle className="w-3.5 h-3.5 text-sky-400" />;
      case 'PRIMITIVE_CYLINDER':
      case 'COLUMN':
        return <Cylinder className="w-3.5 h-3.5 text-indigo-400" />;
      case 'PRIMITIVE_PLANE':
      case 'FLOOR':
        return <Square className="w-3.5 h-3.5 text-emerald-400" />;
      case 'WALL':
        return <Building className="w-3.5 h-3.5 text-indigo-400" />;
      case 'DOOR':
        return <DoorOpen className="w-3.5 h-3.5 text-amber-400" />;
      case 'WINDOW':
        return <AppWindow className="w-3.5 h-3.5 text-sky-300" />;
      case 'FURNITURE':
        return <Layers className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Box className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const handleStartRename = (obj, e) => {
    e.stopPropagation();
    setEditingId(obj.id);
    setEditName(obj.name);
  };

  const handleSaveRename = (objId) => {
    if (editName.trim()) {
      onRenameObject(objId, editName.trim());
    }
    setEditingId(null);
  };

  const filtered = objects.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-64 bg-slate-950 border-l border-slate-800 flex flex-col h-full select-none text-xs">
      {/* Outliner Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-white tracking-tight">Scene Outliner</span>
          <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
            {objects.length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter scene objects..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 text-xs"
          />
        </div>
      </div>

      {/* Object List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-900/60">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500 space-y-2">
            <Box className="w-6 h-6 mx-auto text-slate-600" />
            <p className="text-[11px]">
              {objects.length === 0 ? 'No objects in scene.' : 'No objects match filter.'}
            </p>
          </div>
        ) : (
          filtered.map((obj) => {
            const isSelected = selectedObjectId === obj.id;
            const isEditing = editingId === obj.id;

            return (
              <div
                key={obj.id}
                onClick={() => onSelectObject(obj.id)}
                className={`group px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-sky-950/80 border border-sky-600/80 text-white'
                    : 'hover:bg-slate-900 text-slate-300'
                }`}
              >
                {/* Left: Icon & Name */}
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  <span className="shrink-0">{getObjectIcon(obj.type)}</span>

                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSaveRename(obj.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(obj.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="bg-slate-800 border border-sky-500 rounded px-1.5 py-0.5 text-white text-xs w-full focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) => handleStartRename(obj, e)}
                      className={`truncate text-xs ${
                        obj.visible === false ? 'opacity-40 line-through text-slate-500' : ''
                      }`}
                      title="Double-click to rename"
                    >
                      {obj.name}
                    </span>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                  {/* Visibility toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(obj.id);
                    }}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    title={obj.visible !== false ? 'Hide in viewport' : 'Show in viewport'}
                  >
                    {obj.visible !== false ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </button>

                  {/* Lock toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(obj.id);
                    }}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    title={obj.locked ? 'Unlock transformations' : 'Lock transformations'}
                  >
                    {obj.locked ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                    )}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteObject(obj.id);
                    }}
                    className="p-1 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                    title="Delete object"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
