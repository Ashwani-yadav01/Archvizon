'use client';

import React, { useState, useRef, useCallback } from 'react';
import { getAssetUrl } from '../../utils/assetUrl';

/**
 * BeforeAfterComparison
 * Interactive split-screen slider comparing original vacant photo and staged visualization
 */
export default function BeforeAfterComparison({
  beforeImage,
  beforeImageSrc,
  afterImage,
  afterImageSrc,
  beforeLabel = 'Original Vacant Photo',
  afterLabel = 'Virtually Staged'
}) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

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

  const beforeSrc = getAssetUrl(beforeImage || beforeImageSrc);
  const afterSrc = getAssetUrl(afterImage || afterImageSrc);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[450px] md:h-[540px] rounded-xl overflow-hidden select-none cursor-ew-resize bg-neutral-900 border border-neutral-800 shadow-2xl touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Background (After / Staged Image) */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-700 text-xs font-semibold text-emerald-400 z-10 flex items-center gap-1.5 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        {afterLabel}
      </div>

      {/* Foreground (Before / Vacant Original Image - clipped by slider) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
            maxWidth: 'none'
          }}
          draggable={false}
        />
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-700 text-xs font-semibold text-neutral-300 z-10 flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
          {beforeLabel}
        </div>
      </div>

      {/* Slider Divider Bar */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-neutral-900 pointer-events-auto cursor-grab active:cursor-grabbing">
          <svg className="w-4 h-4 text-neutral-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
            <polyline points="9 18 3 12 9 6" transform="translate(12,0) scale(-1,1)"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}
