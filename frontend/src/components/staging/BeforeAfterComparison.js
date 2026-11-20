'use client';

import React, { useState, useRef, useCallback } from 'react';

/**
 * BeforeAfterComparison
 * Interactive split-screen slider comparing original vacant photo and staged visualization
 */
export default function BeforeAfterComparison({
  beforeImage,
  afterImage,
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

  const handlePointerUp = (e) => {
    setIsDragging(false);
  };

  const serverUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/$/, '');
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${serverUrl}/${url.replace(/^\//, '')}`;
  };

  const beforeSrc = getFullUrl(beforeImage);
  const afterSrc = getFullUrl(afterImage);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[450px] md:h-[540px] rounded-xl overflow-hidden select-none cursor-ew-resize bg-neutral-900 border border-neutral-800 shadow-2xl touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* After image (Staged) - Base background */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Before image (Vacant) - Clipped by slider position */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Slider dividing bar */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] cursor-ew-resize flex items-center justify-center -ml-0.5"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-8 h-8 rounded-full bg-white text-neutral-900 shadow-xl flex items-center justify-center font-bold text-xs">
          ↔
        </div>
      </div>

      {/* Pill Labels */}
      <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-200 border border-white/10 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        {beforeLabel}
      </div>

      <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-200 border border-white/10 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        {afterLabel}
      </div>

      {/* Drag instruction overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur-sm px-4 py-1 rounded-full text-[11px] text-neutral-300 pointer-events-none">
        Drag slider left and right to inspect virtual staging changes
      </div>
    </div>
  );
}
