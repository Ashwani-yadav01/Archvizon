'use client';

import React from 'react';
import {
  Sliders,
  Move,
  RotateCw,
  Scaling,
  Palette,
  Sun,
  Grid,
  Box,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function PropertiesPanel({
  selectedObject = null,
  onUpdateTransform = () => {},
  onUpdateGeometry = () => {},
  onUpdateMaterial = () => {},
  environment = {},
  onUpdateEnvironment = () => {}
}) {
  const pbrPresets = [
    { name: 'Hardwood Oak', color: '#b48a58', roughness: 0.35, metalness: 0.05, opacity: 1 },
    { name: 'White Marble', color: '#f8fafc', roughness: 0.15, metalness: 0.15, opacity: 1 },
    { name: 'Cast Concrete', color: '#64748b', roughness: 0.75, metalness: 0.05, opacity: 1 },
    { name: 'Dark Slate', color: '#1e293b', roughness: 0.45, metalness: 0.1, opacity: 1 },
    { name: 'Tinted Glass', color: '#93c5fd', roughness: 0.05, metalness: 0.85, opacity: 0.35 },
    { name: 'Brushed Steel', color: '#94a3b8', roughness: 0.3, metalness: 0.9, opacity: 1 },
    { name: 'White Plaster', color: '#f1f5f9', roughness: 0.85, metalness: 0.0, opacity: 1 }
  ];

  if (!selectedObject) {
    return (
      <aside className="w-72 bg-slate-950 border-l border-slate-800 flex flex-col h-full select-none text-xs overflow-y-auto">
        <div className="p-3 border-b border-slate-800 flex items-center gap-2">
          <Sun className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-white tracking-tight">World Environment</span>
        </div>

        <div className="p-4 space-y-6">
          {/* Lighting Controls */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
              Lighting & Sun Scenario
            </h4>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>Sun Intensity</span>
                <span className="font-mono text-sky-400">
                  {environment.directionalLight?.intensity || 1.2}x
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={environment.directionalLight?.intensity || 1.2}
                onChange={(e) =>
                  onUpdateEnvironment({
                    directionalLight: {
                      ...environment.directionalLight,
                      intensity: parseFloat(e.target.value)
                    }
                  })
                }
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>Ambient Fill</span>
                <span className="font-mono text-sky-400">
                  {environment.ambientLight?.intensity || 0.7}x
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={environment.ambientLight?.intensity || 0.7}
                onChange={(e) =>
                  onUpdateEnvironment({
                    ambientLight: {
                      ...environment.ambientLight,
                      intensity: parseFloat(e.target.value)
                    }
                  })
                }
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Grid Settings */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
              Ground Grid Grounding
            </h4>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs">Show Ground Grid</span>
              <input
                type="checkbox"
                checked={environment.grid?.visible !== false}
                onChange={(e) =>
                  onUpdateEnvironment({
                    grid: { ...environment.grid, visible: e.target.checked }
                  })
                }
                className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 h-4 w-4"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Grid Extents (Meters)</label>
              <input
                type="number"
                min="10"
                max="100"
                step="5"
                value={environment.grid?.size || 30}
                onChange={(e) =>
                  onUpdateEnvironment({
                    grid: { ...environment.grid, size: parseInt(e.target.value) }
                  })
                }
                className="arch-input font-mono text-xs py-1"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-[11px] leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>Select any object in the viewport or outliner to inspect and modify its dimensions and materials.</span>
          </div>
        </div>
      </aside>
    );
  }

  const pos = selectedObject.position || { x: 0, y: 0, z: 0 };
  const rot = selectedObject.rotation || { x: 0, y: 0, z: 0 };
  const scl = selectedObject.scale || { x: 1, y: 1, z: 1 };
  const mat = selectedObject.material || {};
  const geo = selectedObject.geometry?.parameters || {};

  return (
    <aside className="w-72 bg-slate-950 border-l border-slate-800 flex flex-col h-full select-none text-xs overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-white tracking-tight">Object Inspector</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-400">
          {selectedObject.type?.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="p-4 space-y-6">
        {/* Name input */}
        <div>
          <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Object Name</label>
          <input
            type="text"
            value={selectedObject.name}
            onChange={(e) => onUpdateGeometry({ name: e.target.value })}
            className="arch-input text-xs py-1"
          />
        </div>

        {/* 1. Transformations: Position, Rotation, Scale */}
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <h4 className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-sky-400" />
            <span>Transform Coordinates</span>
          </h4>

          {/* Position X, Y, Z */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Position (m)</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                <span className="text-rose-400 font-bold mr-1">X</span>
                <input
                  type="number"
                  step="0.1"
                  value={pos.x}
                  onChange={(e) =>
                    onUpdateTransform({ position: { ...pos, x: parseFloat(e.target.value) || 0 } })
                  }
                  className="bg-transparent w-full text-slate-200 focus:outline-none"
                />
              </div>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                <span className="text-emerald-400 font-bold mr-1">Y</span>
                <input
                  type="number"
                  step="0.1"
                  value={pos.y}
                  onChange={(e) =>
                    onUpdateTransform({ position: { ...pos, y: parseFloat(e.target.value) || 0 } })
                  }
                  className="bg-transparent w-full text-slate-200 focus:outline-none"
                />
              </div>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                <span className="text-sky-400 font-bold mr-1">Z</span>
                <input
                  type="number"
                  step="0.1"
                  value={pos.z}
                  onChange={(e) =>
                    onUpdateTransform({ position: { ...pos, z: parseFloat(e.target.value) || 0 } })
                  }
                  className="bg-transparent w-full text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Rotation X, Y, Z (degrees) */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Rotation (deg)</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                <span className="text-rose-400 font-bold mr-1">X</span>
                <input
                  type="number"
                  step="15"
                  value={rot.x}
                  onChange={(e) =>
                    onUpdateTransform({ rotation: { ...rot, x: parseFloat(e.target.value) || 0 } })
                  }
                  className="bg-transparent w-full text-slate-200 focus:outline-none"
                />
              </div>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                <span className="text-emerald-400 font-bold mr-1">Y</span>
                <input
                  type="number"
                  step="15"
                  value={rot.y}
                  onChange={(e) =>
                    onUpdateTransform({ rotation: { ...rot, y: parseFloat(e.target.value) || 0 } })
                  }
                  className="bg-transparent w-full text-slate-200 focus:outline-none"
                />
              </div>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                <span className="text-sky-400 font-bold mr-1">Z</span>
                <input
                  type="number"
                  step="15"
                  value={rot.z}
                  onChange={(e) =>
                    onUpdateTransform({ rotation: { ...rot, z: parseFloat(e.target.value) || 0 } })
                  }
                  className="bg-transparent w-full text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Scale X, Y, Z */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Scale</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                <span className="text-rose-400 font-bold mr-1">X</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.05"
                  value={scl.x}
                  onChange={(e) =>
                    onUpdateTransform({ scale: { ...scl, x: Math.max(0.05, parseFloat(e.target.value) || 1) } })
                  }
                  className="bg-transparent w-full text-slate-200 focus:outline-none"
                />
              </div>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                <span className="text-emerald-400 font-bold mr-1">Y</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.05"
                  value={scl.y}
                  onChange={(e) =>
                    onUpdateTransform({ scale: { ...scl, y: Math.max(0.05, parseFloat(e.target.value) || 1) } })
                  }
                  className="bg-transparent w-full text-slate-200 focus:outline-none"
                />
              </div>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                <span className="text-sky-400 font-bold mr-1">Z</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.05"
                  value={scl.z}
                  onChange={(e) =>
                    onUpdateTransform({ scale: { ...scl, z: Math.max(0.05, parseFloat(e.target.value) || 1) } })
                  }
                  className="bg-transparent w-full text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Architectural Dimensions (if applicable) */}
        {['WALL', 'FLOOR', 'DOOR', 'WINDOW', 'PRIMITIVE_CUBE'].includes(selectedObject.type) && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
              Dimensions (Width &bull; Height &bull; Depth)
            </h4>

            <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Width</span>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={geo.width || selectedObject.scale?.x || 1.5}
                  onChange={(e) =>
                    onUpdateGeometry({
                      geometry: {
                        ...selectedObject.geometry,
                        parameters: { ...geo, width: parseFloat(e.target.value) || 1 }
                      },
                      scale: { ...scl, x: parseFloat(e.target.value) || 1 }
                    })
                  }
                  className="arch-input font-mono text-xs py-1"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Height</span>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={geo.height || selectedObject.scale?.y || 1.5}
                  onChange={(e) =>
                    onUpdateGeometry({
                      geometry: {
                        ...selectedObject.geometry,
                        parameters: { ...geo, height: parseFloat(e.target.value) || 1 }
                      },
                      scale: { ...scl, y: parseFloat(e.target.value) || 1 }
                    })
                  }
                  className="arch-input font-mono text-xs py-1"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Depth</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.05"
                  value={geo.depth || selectedObject.scale?.z || 1.5}
                  onChange={(e) =>
                    onUpdateGeometry({
                      geometry: {
                        ...selectedObject.geometry,
                        parameters: { ...geo, depth: parseFloat(e.target.value) || 1 }
                      },
                      scale: { ...scl, z: parseFloat(e.target.value) || 1 }
                    })
                  }
                  className="arch-input font-mono text-xs py-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Material & PBR Appearance */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-sky-400" />
            <span>PBR Material & Finish</span>
          </h4>

          {/* Color Picker */}
          <div>
            <div className="flex justify-between items-center text-[11px] text-slate-300 mb-1.5">
              <span>Base Color</span>
              <span className="font-mono text-xs text-sky-400 uppercase">{mat.color || '#94a3b8'}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={mat.color || '#94a3b8'}
                onChange={(e) => onUpdateMaterial({ color: e.target.value })}
                className="w-10 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
              />
              <input
                type="text"
                value={mat.color || '#94a3b8'}
                onChange={(e) => onUpdateMaterial({ color: e.target.value })}
                className="arch-input font-mono text-xs py-1 flex-1 uppercase"
              />
            </div>
          </div>

          {/* Roughness */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Roughness</span>
              <span className="font-mono text-sky-400">{((mat.roughness ?? 0.6) * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={mat.roughness ?? 0.6}
              onChange={(e) => onUpdateMaterial({ roughness: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Metalness */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Metalness</span>
              <span className="font-mono text-sky-400">{((mat.metalness ?? 0.1) * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={mat.metalness ?? 0.1}
              onChange={(e) => onUpdateMaterial({ metalness: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Opacity */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Opacity</span>
              <span className="font-mono text-sky-400">{((mat.opacity ?? 1) * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={mat.opacity ?? 1}
              onChange={(e) => onUpdateMaterial({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* PBR Presets Grid */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 block mb-2">Architectural Presets</span>
            <div className="grid grid-cols-2 gap-1.5">
              {pbrPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    onUpdateMaterial({
                      color: preset.color,
                      roughness: preset.roughness,
                      metalness: preset.metalness,
                      opacity: preset.opacity
                    })
                  }
                  className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center gap-2"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0 shadow-sm"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-[11px] text-slate-300 truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
