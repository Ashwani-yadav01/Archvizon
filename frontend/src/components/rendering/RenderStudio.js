'use client';

import React, { useState, useEffect, useRef } from 'react';
import renderService from '../../services/renderService';

const CAMERA_PRESETS = [
  { id: 'PERSPECTIVE', name: 'Perspective 3D', icon: '📐', desc: 'Natural balanced architectural focal view' },
  { id: 'ISOMETRIC', name: 'Isometric View', icon: '🧊', desc: 'Orthographic 45° architectural diorama presentation' },
  { id: 'FRONT', name: 'Eye-Level Human', icon: '👁️', desc: '1.6m elevation looking straight across interior' },
  { id: 'TOP', name: 'Top-Down Plan', icon: '🗺️', desc: 'Direct bird’s-eye floor layout orientation' },
  { id: 'WIDE', name: 'Ultra-Wide 18mm', icon: '📸', desc: 'Expansive wide-angle view for spacious interiors' }
];

const LIGHTING_SCENARIOS = [
  { id: 'DAY', name: 'Bright Daylight', icon: '☀️', desc: 'Direct sun with soft interior ambient bounce' },
  { id: 'GOLDEN_HOUR', name: 'Golden Hour Sunset', icon: '🌅', desc: 'Warm 2800K low-angle sunlight with dramatic shadows' },
  { id: 'TWILIGHT', name: 'Dramatic Twilight', icon: '🌙', desc: 'Deep cobalt sky with warm interior accent spots' },
  { id: 'STUDIO', name: 'Clean White Studio', icon: '💡', desc: 'Diffused studio softboxes for product & furniture purity' }
];

const RESOLUTIONS = [
  { id: '1080P', name: '1080p Full HD', dims: '1920 × 1080', speed: 'Fastest (~2s)' },
  { id: '4K', name: '4K UHD Master', dims: '3840 × 2160', speed: 'High Fidelity' },
  { id: '8K', name: '8K Ultra Archviz', dims: '7680 × 4320', speed: 'Maximum Detail' }
];

const QUALITY_PRESETS = [
  { id: 'DRAFT', name: 'Draft Preview', samples: 32, desc: 'Quick composition verification' },
  { id: 'PRODUCTION', name: 'Production Quality', samples: 64, desc: 'Clean noise-free delivery render' },
  { id: 'ULTRA', name: 'Ultra Raytraced', samples: 128, desc: 'Maximum multi-bounce global illumination' }
];

export default function RenderStudio({ projectId }) {
  const [cameraPreset, setCameraPreset] = useState('PERSPECTIVE');
  const [lightingScenario, setLightingScenario] = useState('DAY');
  const [sunIntensity, setSunIntensity] = useState(1.2);
  const [resolution, setResolution] = useState('4K');
  const [quality, setQuality] = useState('PRODUCTION');

  // Job status & active progress
  const [activeJob, setActiveJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Gallery & history
  const [rendersHistory, setRendersHistory] = useState([]);
  const [selectedRender, setSelectedRender] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const pollingTimerRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      loadHistory();
    }
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [projectId]);

  const loadHistory = async () => {
    try {
      const res = await renderService.getJobsByProject(projectId);
      if (res && res.data) {
        setRendersHistory(res.data);
        if (res.data.length > 0 && !selectedRender && !activeJob) {
          setSelectedRender(res.data[0]);
        }
      }
    } catch (err) {
      console.warn('Could not load render history:', err.message);
    }
  };

  const handleStartRender = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        projectId,
        cameraPreset,
        lightingScenario,
        sunIntensity: parseFloat(sunIntensity),
        resolution,
        quality
      };

      const res = await renderService.createRenderJob(payload);
      const newJob = res.data;
      setActiveJob(newJob);
      setIsSubmitting(false);

      // Start status polling
      pollJobStatus(newJob._id);
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to submit architectural render');
    }
  };

  const pollJobStatus = (jobId) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    pollingTimerRef.current = setInterval(async () => {
      try {
        const res = await renderService.getJobById(jobId);
        const job = res.data;
        setActiveJob(job);

        if (job.status === 'COMPLETED' || job.status === 'FAILED') {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
          loadHistory();
          if (job.status === 'COMPLETED') {
            setSelectedRender(job);
          }
        }
      } catch (err) {
        console.error('Error polling render status:', err);
      }
    }, 1500);
  };

  const displayedRender = activeJob?.status === 'COMPLETED' ? activeJob : selectedRender;

  const serverUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${serverUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-lg">📸</span>
            Architectural Render Studio
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Configure camera views, photometric lighting, and high-resolution raymarching to produce presentation-ready architectural imagery.
          </p>
        </div>

        {displayedRender && displayedRender.outputUrl && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-sm rounded-lg transition-colors flex items-center gap-2 border border-neutral-700"
            >
              <span>🔍</span> Inspect Full-Screen
            </button>
            <a
              href={getFullUrl(displayedRender.outputUrl)}
              download={`archvizon-render-${displayedRender._id}.jpg`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-950"
            >
              <span>📥</span> Download {displayedRender.settings?.resolution} Render
            </a>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Main Grid: Render Settings Left, Live Output Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Render Configurator (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          {/* Step 1: Camera Preset */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              1. Camera Viewpoint
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CAMERA_PRESETS.map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => setCameraPreset(cam.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    cameraPreset === cam.id
                      ? 'bg-indigo-500/15 border-indigo-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-100">
                    <span>{cam.icon}</span>
                    <span>{cam.name}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 line-clamp-1">{cam.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Lighting Scenario */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              2. Lighting & Atmosphere
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LIGHTING_SCENARIOS.map((light) => (
                <button
                  key={light.id}
                  type="button"
                  onClick={() => setLightingScenario(light.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    lightingScenario === light.id
                      ? 'bg-indigo-500/15 border-indigo-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-100">
                    <span>{light.icon}</span>
                    <span>{light.name}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 line-clamp-1">{light.desc}</div>
                </button>
              ))}
            </div>

            {/* Sun Intensity Slider */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Sun Intensity</span>
                <span className="font-mono text-indigo-400">{sunIntensity}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={sunIntensity}
                onChange={(e) => setSunIntensity(e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Step 3: Resolution & Quality */}
          <div className="space-y-3 pt-1 border-t border-neutral-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              3. Resolution & Sampling
            </label>

            {/* Resolution selector */}
            <div className="grid grid-cols-3 gap-2">
              {RESOLUTIONS.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => setResolution(res.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    resolution === res.id
                      ? 'bg-indigo-500/15 border-indigo-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-200">{res.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-neutral-500">{res.dims}</div>
                </button>
              ))}
            </div>

            {/* Quality presets */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {QUALITY_PRESETS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuality(q.id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    quality === q.id
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold text-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white text-xs'
                  }`}
                >
                  <div>{q.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-neutral-500 font-normal">{q.samples} spp</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            disabled={isSubmitting || (activeJob && ['PENDING', 'PROCESSING'].includes(activeJob.status))}
            onClick={handleStartRender}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting || (activeJob && ['PENDING', 'PROCESSING'].includes(activeJob.status)) ? (
              <>
                <span className="animate-spin text-base">⚙️</span>
                <span>Calculating Raymarching Samples...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Queue Architectural Render ({resolution})</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Render Viewport / Display (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Processing Indicator */}
          {activeJob && ['PENDING', 'PROCESSING'].includes(activeJob.status) && (
            <div className="bg-neutral-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs animate-pulse">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Raymarching & Shading Render</h4>
                    <p className="text-xs text-neutral-400">
                      Baking global illumination, reflections, and shadow passes...
                    </p>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-indigo-400">{activeJob.progress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 h-full transition-all duration-500 ease-out"
                  style={{ width: `${activeJob.progress}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
                <span>Phase: {activeJob.progress < 30 ? 'Parsing Scene Tree' : activeJob.progress < 70 ? 'Multi-bounce Path Tracing' : 'Tone Mapping & Denoising'}</span>
                <span>Engine: {activeJob.engineUsed}</span>
              </div>
            </div>
          )}

          {/* Completed Render Display */}
          {displayedRender && displayedRender.outputUrl ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl group">
                <img
                  src={getFullUrl(displayedRender.outputUrl)}
                  alt="Completed architectural render"
                  className="w-full h-[450px] md:h-[520px] object-cover cursor-pointer group-hover:scale-[1.01] transition-transform duration-300"
                  onClick={() => setIsLightboxOpen(true)}
                />

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5">
                    <span>📐</span> {displayedRender.settings?.cameraPreset} View
                  </span>
                  <span className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-indigo-400 border border-white/10">
                    {displayedRender.settings?.resolution}
                  </span>
                </div>

                <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-black shadow-md">
                  RENDER COMPLETED
                </div>

                {/* Bottom details bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between text-xs text-neutral-300">
                  <div>
                    <span className="font-semibold text-white">Lighting:</span> {displayedRender.settings?.lightingScenario} • <span className="font-semibold text-white">Quality:</span> {displayedRender.settings?.quality} ({displayedRender.settings?.samples} samples)
                  </div>
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="hover:text-white underline text-[11px]"
                  >
                    Click to enlarge ↗
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 text-3xl flex items-center justify-center mx-auto text-neutral-400">
                📸
              </div>
              <h3 className="text-lg font-bold text-white">No Architectural Render Selected</h3>
              <p className="text-sm text-neutral-400 max-w-md mx-auto">
                Configure your camera angles, lighting scenario, and resolution on the left to start high-fidelity architectural rendering.
              </p>
            </div>
          )}

          {/* Completed Renders History Shelf */}
          {rendersHistory.length > 0 && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>Render History for this Project</span>
                <span className="text-[11px] text-neutral-500 font-normal">{rendersHistory.length} render(s)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {rendersHistory.map((job) => (
                  <button
                    key={job._id}
                    type="button"
                    onClick={() => setSelectedRender(job)}
                    className={`group relative rounded-xl overflow-hidden border text-left transition-all p-2 ${
                      selectedRender?._id === job._id
                        ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500'
                        : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                    }`}
                  >
                    <div className="h-24 w-full rounded-lg overflow-hidden bg-neutral-900 relative mb-2">
                      <img
                        src={getFullUrl(job.outputUrl || job.thumbnailUrl)}
                        alt={job.settings?.cameraPreset}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className={`absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        job.status === 'COMPLETED' ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-black'
                      }`}>
                        {job.settings?.resolution || job.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">{job.settings?.cameraPreset} View</div>
                    <div className="text-[10px] text-neutral-400 truncate">{job.settings?.lightingScenario} • {new Date(job.createdAt).toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-screen Lightbox Modal */}
      {isLightboxOpen && displayedRender && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="absolute top-4 right-6 flex items-center gap-4 z-10" onClick={(e) => e.stopPropagation()}>
            <a
              href={getFullUrl(displayedRender.outputUrl)}
              download={`archvizon-render-${displayedRender._id}.jpg`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-1.5"
            >
              <span>📥</span> Download Full-Res
            </a>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="text-neutral-400 hover:text-white text-2xl font-bold p-2"
            >
              ✕
            </button>
          </div>

          <div className="max-w-6xl max-h-[85vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={getFullUrl(displayedRender.outputUrl)}
              alt="Full-size architectural render"
              className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          <div className="absolute bottom-4 text-center text-xs text-neutral-400" onClick={(e) => e.stopPropagation()}>
            {displayedRender.settings?.resolution} • {displayedRender.settings?.cameraPreset} View • {displayedRender.settings?.lightingScenario} Scenario
          </div>
        </div>
      )}
    </div>
  );
}
