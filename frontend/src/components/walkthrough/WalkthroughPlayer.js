'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  Compass,
  Film,
  Sparkles,
  Gauge
} from 'lucide-react';

export default function WalkthroughPlayer({
  videoSrc,
  title = 'Walkthrough Video',
  hostedTourUrl = '',
  metadata = {}
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeMode, setActiveMode] = useState(hostedTourUrl ? 'TOUR' : 'VIDEO');
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Format camera markers / chapters if present
  const cameraViews = Array.isArray(metadata.cameraViews) ? metadata.cameraViews : [];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeMode]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) videoRef.current.playbackRate = newSpeed;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const jumpToPercentage = (pct) => {
    if (videoRef.current && duration) {
      videoRef.current.currentTime = (pct / 100) * duration;
      if (!isPlaying) togglePlay();
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex flex-col group select-none"
    >
      {/* Top Bar / Mode Selector */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {hostedTourUrl && (
            <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-700/80 p-0.5 text-xs font-mono">
              <button
                onClick={() => {
                  if (isPlaying && videoRef.current) videoRef.current.pause();
                  setIsPlaying(false);
                  setActiveMode('TOUR');
                }}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  activeMode === 'TOUR'
                    ? 'bg-sky-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Hosted 360 Tour
              </button>
              <button
                onClick={() => setActiveMode('VIDEO')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  activeMode === 'VIDEO'
                    ? 'bg-sky-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                Rendered Video
              </button>
            </div>
          )}

          {metadata.resolution && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800/80 font-bold">
              {metadata.resolution}
            </span>
          )}
        </div>

        {hostedTourUrl && (
          <a
            href={hostedTourUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow"
          >
            <span>Launch External</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          </a>
        )}
      </div>

      {/* Main Viewport */}
      {activeMode === 'TOUR' && hostedTourUrl ? (
        <div className="w-full h-[480px] bg-slate-950 relative">
          <iframe
            src={hostedTourUrl}
            title={title}
            className="w-full h-full border-0"
            allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
          />
        </div>
      ) : (
        <div
          onClick={togglePlay}
          className="relative w-full h-[480px] bg-black flex items-center justify-center cursor-pointer"
        >
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Big Center Play Button when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition">
              <div className="w-16 h-16 rounded-full bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-2xl pl-1 transform group-hover:scale-110 transition">
                <Play className="w-8 h-8 fill-white" />
              </div>
            </div>
          )}

          {/* Video Bottom Controls Overlay */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 z-20 cursor-default"
          >
            {/* Scrubber Progress Bar */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:h-2 transition-all"
              />
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between gap-4 text-xs text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white transition"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <div className="flex items-center gap-1.5 group/vol">
                  <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                <span className="font-mono text-[11px] text-slate-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={cycleSpeed}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 font-mono text-[11px] font-semibold text-slate-200 transition"
                  title="Playback speed"
                >
                  {playbackSpeed}x
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white transition"
                  title="Toggle fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Scene Quick Jump Bar (if camera markers defined) */}
      {cameraViews.length > 0 && activeMode === 'VIDEO' && (
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 shrink-0">
            Camera Positions:
          </span>
          {cameraViews.map((viewName, idx) => {
            const stepPct = (idx / cameraViews.length) * 100;
            return (
              <button
                key={idx}
                onClick={() => jumpToPercentage(stepPct)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition whitespace-nowrap text-[11px] flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>{viewName}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
