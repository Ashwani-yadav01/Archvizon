'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Box,
  Sofa,
  Building,
  Sun,
  Palette,
  Search,
  Plus,
  X,
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';
import catalogService from '../../services/catalogService';

export default function AssetLibraryDrawer({
  isOpen = false,
  onClose = () => {},
  onAddAssetToScene = () => {},
  onApplyMaterialToSelected = () => {},
  hasSelectedObject = false
}) {
  const [activeTab, setActiveTab] = useState('FURNITURE'); // 'FURNITURE', 'ARCHITECTURAL', 'LIGHTING', 'DECOR', 'MATERIALS'
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'MATERIALS') {
          const mats = await catalogService.getMaterials();
          setMaterials(mats);
        } else {
          const res = await catalogService.getAssets({ category: activeTab });
          setAssets(res);
        }
      } catch (err) {
        console.error('Failed to load asset catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, activeTab]);

  const handleInsert = (asset) => {
    onAddAssetToScene(asset);
    setAddedId(asset._id || asset.name);
    setTimeout(() => setAddedId(null), 1200);
  };

  const handleApplyMaterial = (mat) => {
    onApplyMaterialToSelected(mat);
    setAddedId(mat.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-7 left-13 right-0 h-72 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl z-30 flex flex-col text-xs select-none">
      {/* Drawer Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-white tracking-tight">Architectural & Interior Asset Library</span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-medium">
            {[
              { id: 'FURNITURE', label: 'Furniture', icon: Sofa },
              { id: 'ARCHITECTURAL', label: 'Architecture', icon: Building },
              { id: 'LIGHTING', label: 'Lighting', icon: Sun },
              { id: 'DECOR', label: 'Decor', icon: Box },
              { id: 'MATERIALS', label: 'PBR Finishes', icon: Palette }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition ${
                    activeTab === tab.id
                      ? 'bg-sky-600 text-white font-semibold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Search & Close */}
        <div className="flex items-center gap-3">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter assets..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 text-xs"
            />
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawer Body (Asset Grid) */}
      <div className="flex-1 overflow-x-auto p-3 flex gap-3 items-center">
        {loading ? (
          <div className="w-full text-center text-slate-500 font-mono text-xs">
            Loading catalog assets...
          </div>
        ) : activeTab === 'MATERIALS' ? (
          materials
            .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()))
            .map((mat) => {
              const isAdded = addedId === mat.id;
              return (
                <div
                  key={mat.id}
                  onClick={() => handleApplyMaterial(mat)}
                  className={`min-w-[170px] w-[170px] h-[180px] p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition group shadow-lg ${
                    isAdded
                      ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-sky-500/60'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Material swatch */}
                    <div
                      className="w-full h-20 rounded-lg border border-slate-700/80 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: mat.color }}
                    >
                      <Palette className="w-6 h-6 text-white/50" />
                    </div>

                    <h4 className="text-xs font-semibold text-white line-clamp-1">{mat.name}</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {mat.category}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-sky-400 group-hover:underline">
                      {hasSelectedObject ? 'Apply to Selected' : 'Select Mesh to Apply'}
                    </span>
                    {isAdded ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                    )}
                  </div>
                </div>
              );
            })
        ) : (
          assets
            .filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()))
            .map((asset) => {
              const isAdded = addedId === (asset._id || asset.name);
              const dims = asset.defaultDimensions || { width: 1, height: 1, depth: 1 };

              return (
                <div
                  key={asset._id || asset.name}
                  onClick={() => handleInsert(asset)}
                  className={`min-w-[185px] w-[185px] h-[185px] p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition group shadow-lg ${
                    isAdded
                      ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-sky-500/60'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Thumbnail preview */}
                    <div className="w-full h-20 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shadow-inner">
                      {asset.category === 'FURNITURE' ? (
                        <Sofa className="w-8 h-8" />
                      ) : asset.category === 'LIGHTING' ? (
                        <Sun className="w-8 h-8 text-amber-400" />
                      ) : (
                        <Building className="w-8 h-8 text-indigo-400" />
                      )}
                    </div>

                    <h4 className="text-xs font-semibold text-white line-clamp-1">{asset.name}</h4>
                    <p className="text-[10px] font-mono text-slate-400">
                      {dims.width}m &times; {dims.height}m &times; {dims.depth}m
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-sky-400 font-medium flex items-center gap-1 group-hover:underline">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Scene</span>
                    </span>
                    {isAdded && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
