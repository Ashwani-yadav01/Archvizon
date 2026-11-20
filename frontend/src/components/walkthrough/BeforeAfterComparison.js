'use client';

import React, { useState, useRef, useCallback } from 'react';
import { SlidersHorizontal, Sparkles, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { getAssetUrl } from '../../utils/assetUrl';

export default function BeforeAfterComparison({
  beforeImage,
  beforeImageSrc,
  afterImage,
  afterImageSrc,
  beforeLabel = 'Original Raw Photograph',
  afterLabel = 'Virtually Staged Output'
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const rawBefore = beforeImageSrc || beforeImage;
  const rawAfter = afterImageSrc || afterImage;
  const normalizedBefore = getAssetUrl(rawBefore);
  const normalizedAfter = getAssetUrl(rawAfter);

  const handleMove = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      const position = Math.max(0, Math.min(100, (x / width) * 100));
      setSliderPosition(position);
    },
    []
  );

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handleMove(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const resetToCenter = () => setSliderPosition(50);

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">Before & After Staging Comparison</span>
          <span className="text-slate-400 font-mono text-[11px]">(Drag slider to inspect)</span>
        </div>

        <button
          onClick={resetToCenter}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px] font-mono"
          title="Reset to 50/50 center split"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Center</span>
        </button>
      </div>

      {/* Comparison Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-[460px] bg-slate-950 rounded-2xl overflow-hidden select-none cursor-ew-resize border border-slate-800 shadow-2xl touch-none"
      >
        {/* Layer 1: After Image (Virtually Staged - Full Width Background) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={normalizedAfter}
            alt={afterLabel}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-full bg-black/80 backdrop-blur-sm border border-emerald-500/60 text-emerald-300 font-mono text-[11px] font-semibold flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{afterLabel}</span>
          </div>
        </div>

        {/* Layer 2: Before Image (Original Raw Photo - Clipped via clipPath) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={normalizedBefore}
            alt={beforeLabel}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1 rounded-full bg-black/80 backdrop-blur-sm border border-slate-700 text-slate-300 font-mono text-[11px] font-semibold flex items-center gap-1.5 shadow-lg">
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>{beforeLabel}</span>
          </div>
        </div>

        {/* Vertical Divider Line with Grab Handle */}
        <div
          className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xl border-2 border-slate-900 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
            <SlidersHorizontal className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
}
