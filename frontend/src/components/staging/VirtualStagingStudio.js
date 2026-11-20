'use client';

import React, { useState, useEffect, useRef } from 'react';
import stagingService from '../../services/stagingService';
import BeforeAfterComparison from './BeforeAfterComparison';
import { getAssetUrl } from '../../utils/assetUrl';

const ROOM_CATEGORIES = [
  { id: 'LIVING_ROOM', name: 'Living Room', icon: '🛋️' },
  { id: 'BEDROOM', name: 'Master Bedroom', icon: '🛏️' },
  { id: 'DINING_ROOM', name: 'Dining Room', icon: '🍷' },
  { id: 'KITCHEN', name: 'Kitchen & Island', icon: '🍳' },
  { id: 'OFFICE', name: 'Executive Office', icon: '💼' },
  { id: 'TERRACE', name: 'Patio & Balcony', icon: '🌿' }
];

const DESIGN_STYLES = [
  { id: 'MODERN', name: 'Modern', desc: 'Clean geometric lines, sleek finishes, balanced accents' },
  { id: 'SCANDINAVIAN', name: 'Scandinavian', desc: 'Light oak wood, neutral textiles, bright cozy ambiance' },
  { id: 'LUXURY', name: 'Luxury High-End', desc: 'Italian marble, brass fixtures, deep velvet, premium lighting' },
  { id: 'MINIMALIST', name: 'Minimalist', desc: 'Essential functional furniture, negative space, serene palette' },
  { id: 'INDUSTRIAL', name: 'Industrial Loft', desc: 'Exposed brick, steel framing, distressed leather, warm Edison glow' },
  { id: 'JAPANDI', name: 'Japandi', desc: 'Japanese elegance meets Scandinavian functionality, natural cane' }
];

const PRESET_PHOTOS = [
  {
    name: 'Sample Vacant Living Space',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    type: 'LIVING_ROOM'
  },
  {
    name: 'Sample Vacant Master Suite',
    url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    type: 'BEDROOM'
  },
  {
    name: 'Sample Empty Studio Shell',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    type: 'OFFICE'
  }
];

export default function VirtualStagingStudio({ projectId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(PRESET_PHOTOS[0].url);
  const [roomType, setRoomType] = useState('LIVING_ROOM');
  const [designStyle, setDesignStyle] = useState('MODERN');
  const [furnitureDensity, setFurnitureDensity] = useState('BALANCED');
  const [colorPalette, setColorPalette] = useState('Warm Neutral & Natural Wood');
  const [customNotes, setCustomNotes] = useState('');

  // Processing state
  const [activeJob, setActiveJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // History state
  const [jobsHistory, setJobsHistory] = useState([]);
  const [selectedHistoryJob, setSelectedHistoryJob] = useState(null);
  const pollingTimerRef = useRef(null);

  // Load project staging history on mount
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
      const res = await stagingService.getJobsByProject(projectId);
      if (res && res.data) {
        setJobsHistory(res.data);
        if (res.data.length > 0 && !selectedHistoryJob && !activeJob) {
          setSelectedHistoryJob(res.data[0]);
        }
      }
    } catch (err) {
      console.warn('Could not load staging history:', err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSelectPreset = (preset) => {
    setSelectedFile(null);
    setPhotoPreview(preset.url);
    setRoomType(preset.type);
  };

  const handleStartStaging = async () => {
    if (!photoPreview && !selectedFile) {
      setError('Please select or upload a room photograph.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        projectId,
        roomType,
        designStyle,
        furnitureDensity,
        colorPalette,
        customNotes,
        originalImageUrl: !selectedFile ? photoPreview : undefined
      };

      const res = await stagingService.createStagingJob(payload, selectedFile || undefined);
      const newJob = res.data;
      setActiveJob(newJob);
      setIsSubmitting(false);

      // Start status polling
      pollJobStatus(newJob._id);
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to submit staging request');
    }
  };

  const pollJobStatus = (jobId) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    pollingTimerRef.current = setInterval(async () => {
      try {
        const res = await stagingService.getJobById(jobId);
        const job = res.data;
        setActiveJob(job);

        if (job.status === 'COMPLETED' || job.status === 'FAILED') {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
          loadHistory();
          if (job.status === 'COMPLETED') {
            setSelectedHistoryJob(job);
          }
        }
      } catch (err) {
        console.error('Error polling staging status:', err);
      }
    }, 1500);
  };

  const displayedJob = activeJob?.status === 'COMPLETED' ? activeJob : selectedHistoryJob;
  const getFullUrl = (url) => getAssetUrl(url);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-lg">🛋️</span>
            Virtual Staging Studio
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Transform vacant room photographs into professionally furnished, magazine-quality interior visualizations.
          </p>
        </div>

        {displayedJob && (
          <a
            href={getFullUrl(displayedJob.resultImageUrl)}
            download="archvizon-staged.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start md:self-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <span>📥</span> Download Full-Res Staged Result
          </a>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Main Grid: Configurator on Left, Interactive Comparison on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Staging Configurator (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          {/* Step 1: Upload or Select Empty Room Photograph */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
              <span>1. Empty Room Photograph</span>
              <span className="text-[11px] text-neutral-500 font-normal">JPG, PNG, WebP up to 50MB</span>
            </label>

            {/* Photo preview or dropzone */}
            <div className="relative group border-2 border-dashed border-neutral-700 hover:border-emerald-500 rounded-xl p-3 bg-neutral-950 transition-all text-center">
              {photoPreview ? (
                <div className="relative h-44 w-full rounded-lg overflow-hidden">
                  <img src={photoPreview} alt="Selected vacant room" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer bg-neutral-800/90 hover:bg-neutral-700 text-white text-xs px-3 py-1.5 rounded-md">
                      Change Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-8">
                  <span className="text-3xl mb-2">📸</span>
                  <span className="text-sm font-medium text-neutral-200">Upload Empty Room Photo</span>
                  <span className="text-xs text-neutral-500 mt-1">Drag and drop, or click to browse files</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Quick Sample Photos */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1">
              <span className="text-[11px] text-neutral-500 shrink-0">Sample Rooms:</span>
              {PRESET_PHOTOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border shrink-0 transition-all ${
                    photoPreview === preset.url
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  {preset.name.replace('Sample ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Room Category */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              2. Room Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROOM_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setRoomType(cat.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                    roomType === cat.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span className="text-xs font-medium truncate w-full">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Design Style */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              3. Architectural Staging Style
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {DESIGN_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setDesignStyle(style.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    designStyle === style.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-100">{style.name}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2 leading-tight">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Fine-Tuning Preferences */}
          <div className="space-y-3 pt-1 border-t border-neutral-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-400">Furniture Density</label>
                <select
                  value={furnitureDensity}
                  onChange={(e) => setFurnitureDensity(e.target.value)}
                  className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="MINIMAL">Minimalist / Airy</option>
                  <option value="BALANCED">Balanced / Natural</option>
                  <option value="RICH">Richly Furnished</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-400">Color Palette</label>
                <select
                  value={colorPalette}
                  onChange={(e) => setColorPalette(e.target.value)}
                  className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Warm Neutral & Natural Wood">Warm Neutral & Oak</option>
                  <option value="Crisp White & Minimal Gray">Crisp White & Gray</option>
                  <option value="Deep Moody Velvet & Brass">Moody Velvet & Brass</option>
                  <option value="Earthy Olive & Terracotta">Olive & Terracotta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-400">Custom Staging Instructions (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Include a bouclé sectional, abstract art, and fiddle leaf fig"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            disabled={isSubmitting || (activeJob && ['PENDING', 'PROCESSING'].includes(activeJob.status))}
            onClick={handleStartStaging}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting || (activeJob && ['PENDING', 'PROCESSING'].includes(activeJob.status)) ? (
              <>
                <span className="animate-spin text-base">⚙️</span>
                <span>Synthesizing Architectural Staging...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Generate Virtually Staged Room</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Visual Output & Interactive Split Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Processing Indicator */}
          {activeJob && ['PENDING', 'PROCESSING'].includes(activeJob.status) && (
            <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs animate-pulse">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Staging In Progress</h4>
                    <p className="text-xs text-neutral-400">
                      Analyzing perspective, calculating geometry, and placing 3D furniture...
                    </p>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-400">{activeJob.progress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 ease-out"
                  style={{ width: `${activeJob.progress}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
                <span>Phase: {activeJob.progress < 40 ? 'Depth & Geometry' : activeJob.progress < 80 ? 'Material Synthesis' : 'Final Denoise'}</span>
                <span>Engine: {activeJob.provider}</span>
              </div>
            </div>
          )}

          {/* Before/After Split Comparison View */}
          {displayedJob && displayedJob.resultImageUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>✨</span>
                    {displayedJob.roomType.replace('_', ' ')} • {displayedJob.designStyle}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Staged with {displayedJob.preferences?.colorPalette} • Density: {displayedJob.preferences?.furnitureDensity}
                  </p>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                  High-Resolution Visualization
                </span>
              </div>

              <BeforeAfterComparison
                beforeImage={displayedJob.originalImageUrl}
                afterImage={displayedJob.resultImageUrl}
                beforeLabel="Original Empty Space"
                afterLabel={`Staged: ${displayedJob.designStyle}`}
              />
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 text-3xl flex items-center justify-center mx-auto text-neutral-400">
                🛋️
              </div>
              <h3 className="text-lg font-bold text-white">No Staged Visualization Selected</h3>
              <p className="text-sm text-neutral-400 max-w-md mx-auto">
                Configure your room photograph and design parameters on the left to generate an instant interactive Before/After staging comparison.
              </p>
            </div>
          )}

          {/* Staging History Shelf */}
          {jobsHistory.length > 0 && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>Staging History for this Project</span>
                <span className="text-[11px] text-neutral-500 font-normal">{jobsHistory.length} visualization(s)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {jobsHistory.map((job) => (
                  <button
                    key={job._id}
                    type="button"
                    onClick={() => setSelectedHistoryJob(job)}
                    className={`group relative rounded-xl overflow-hidden border text-left transition-all p-2 ${
                      selectedHistoryJob?._id === job._id
                        ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                        : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                    }`}
                  >
                    <div className="h-24 w-full rounded-lg overflow-hidden bg-neutral-900 relative mb-2">
                      <img
                        src={getFullUrl(job.resultImageUrl || job.originalImageUrl)}
                        alt={job.designStyle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className={`absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        job.status === 'COMPLETED' ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">{job.roomType?.replace('_', ' ')}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{job.designStyle} • {new Date(job.createdAt).toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
