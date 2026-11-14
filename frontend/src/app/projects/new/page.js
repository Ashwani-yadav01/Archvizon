'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Layers,
  UploadCloud,
  FileCheck2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Info,
  Sparkles,
  Camera,
  Sofa,
  Video
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import projectService from '../../../services/projectService';

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Project Details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('RESIDENTIAL');
  const [location, setLocation] = useState({ address: '', city: '', country: '' });
  const [deadline, setDeadline] = useState('');

  // Step 2: Selected Services
  const [selectedServices, setSelectedServices] = useState({
    CGI_RENDERING: true,
    VIRTUAL_STAGING: false,
    VIRTUAL_WALKTHROUGH: false
  });

  // Step 3: Service-Specific Briefs
  // CGI
  const [cgiViews, setCgiViews] = useState(['INTERIOR', 'EXTERIOR']);
  const [cgiLighting, setCgiLighting] = useState('DAY');
  const [cgiResolution, setCgiResolution] = useState('4K');
  const [cgiNotes, setCgiNotes] = useState('');

  // Staging
  const [stagingRooms, setStagingRooms] = useState(['LIVING_ROOM']);
  const [stagingStyle, setStagingStyle] = useState('Modern');
  const [stagingColor, setStagingColor] = useState('Neutral Warm');
  const [stagingNotes, setStagingNotes] = useState('');

  // Walkthrough
  const [walkthroughType, setWalkthroughType] = useState('VIDEO');
  const [walkthroughNotes, setWalkthroughNotes] = useState('');

  // Step 4: Files to upload
  const [filesToUpload, setFilesToUpload] = useState([]);

  const toggleService = (srv) => {
    setSelectedServices((prev) => ({
      ...prev,
      [srv]: !prev[srv]
    }));
  };

  const handleFileSelection = (e) => {
    const selected = Array.from(e.target.files || []);
    const mapped = selected.map((file) => ({
      file,
      category: file.name.match(/\.(dwg|dxf|rvt|ifc|skp|pdf)$/i) ? 'SOURCE_FILE' : 'REFERENCE_IMAGE'
    }));
    setFilesToUpload((prev) => [...prev, ...mapped]);
  };

  const removeFile = (index) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileCategory = (index, category) => {
    setFilesToUpload((prev) =>
      prev.map((item, i) => (i === index ? { ...item, category } : item))
    );
  };

  const buildServicePayload = () => {
    const services = [];

    if (selectedServices.CGI_RENDERING) {
      services.push({
        serviceType: 'CGI_RENDERING',
        requirements: {
          viewTypes: cgiViews,
          dayNight: cgiLighting,
          notes: cgiNotes
        },
        outputSpecifications: {
          resolution: cgiResolution,
          aspectRatio: '16:9'
        }
      });
    }

    if (selectedServices.VIRTUAL_STAGING) {
      services.push({
        serviceType: 'VIRTUAL_STAGING',
        requirements: {
          roomTypes: stagingRooms,
          furnitureStyle: stagingStyle,
          colorPalette: stagingColor,
          notes: stagingNotes
        },
        outputSpecifications: {
          resolution: '4K'
        }
      });
    }

    if (selectedServices.VIRTUAL_WALKTHROUGH) {
      services.push({
        serviceType: 'VIRTUAL_WALKTHROUGH',
        requirements: {
          walkthroughType: walkthroughType,
          notes: walkthroughNotes
        },
        outputSpecifications: {
          resolution: '4K',
          formats: ['mp4']
        }
      });
    }

    return services;
  };

  const handleSave = async (submitForReview = false) => {
    if (!name.trim()) {
      setError('Please provide a project name.');
      setStep(1);
      return;
    }

    const services = buildServicePayload();
    if (services.length === 0) {
      setError('Please select at least one visualization service.');
      setStep(2);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Create project with initial services
      const projectPayload = {
        name: name.trim(),
        description: description.trim(),
        propertyType,
        location,
        deadline: deadline || undefined,
        services
      };

      const created = await projectService.createProject(projectPayload);
      const projectId = created.project._id;

      // 2. Upload any staged files
      if (filesToUpload.length > 0) {
        for (const item of filesToUpload) {
          const formData = new FormData();
          formData.append('file', item.file);
          formData.append('category', item.category);
          await projectService.uploadAsset(projectId, formData);
        }
      }

      // 3. If client requested immediate submission, transition to SUBMITTED
      if (submitForReview) {
        await projectService.submitProject(projectId);
      }

      router.push(`/projects/${projectId}`);
    } catch (err) {
      console.error('Failed to create project brief:', err);
      setError(err.message || 'Failed to create project brief. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Back button and Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Visualization Brief</h1>
            <p className="text-xs text-slate-400 mt-1">
              Submit your architectural drawings, property photos, and design specifications.
            </p>
          </div>

          {/* Step Pill */}
          <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400">
            <span>Step {step} of 5</span>
          </div>
        </div>
      </div>

      {/* Wizard Step Navigation */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        {[
          { num: 1, label: 'Details' },
          { num: 2, label: 'Services' },
          { num: 3, label: 'Briefs' },
          { num: 4, label: 'Files' },
          { num: 5, label: 'Review' }
        ].map((item) => (
          <button
            key={item.num}
            onClick={() => setStep(item.num)}
            className={`py-2 px-1 rounded-lg border font-medium transition-all ${
              step === item.num
                ? 'bg-sky-950/80 border-sky-600 text-sky-400'
                : step > item.num
                ? 'bg-slate-900 border-slate-700 text-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <span className="hidden sm:inline font-mono mr-1.5">{item.num}.</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Project Details */}
      {step === 1 && (
        <div className="arch-card p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 text-white font-semibold text-base">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span>Step 1: General Property & Project Details</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Project Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., The Lumina Waterfront Residences"
                className="arch-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="arch-input"
                >
                  <option value="RESIDENTIAL">Residential (Villas, Apartments, Condos)</option>
                  <option value="COMMERCIAL">Commercial (Offices, Retail, Mixed)</option>
                  <option value="MIXED_USE">Mixed-Use Development</option>
                  <option value="HOSPITALITY">Hospitality (Hotels, Resorts, Spas)</option>
                  <option value="INDUSTRIAL">Industrial</option>
                  <option value="OTHER">Other Architectural Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Completion Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="arch-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">City</label>
                <input
                  type="text"
                  value={location.city}
                  onChange={(e) => setLocation({ ...location, city: e.target.value })}
                  placeholder="e.g., Dubai, London, New York"
                  className="arch-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Country</label>
                <input
                  type="text"
                  value={location.country}
                  onChange={(e) => setLocation({ ...location, country: e.target.value })}
                  placeholder="e.g., United Kingdom, UAE, USA"
                  className="arch-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Project Scope & Concept Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your architectural design vision, key selling points, target market, or unique architectural features..."
                className="arch-input"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button onClick={() => setStep(2)} className="arch-button-primary">
              Continue to Services &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Service Selection */}
      {step === 2 && (
        <div className="arch-card p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 text-white font-semibold text-base">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>Step 2: Select Visualization Services</span>
          </div>

          <p className="text-xs text-slate-400">
            Choose one or more professional visualization services required for this project brief:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CGI Rendering */}
            <div
              onClick={() => toggleService('CGI_RENDERING')}
              className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedServices.CGI_RENDERING
                  ? 'bg-sky-950/60 border-sky-500 ring-1 ring-sky-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-lg bg-sky-900/40 border border-sky-800 text-sky-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedServices.CGI_RENDERING}
                    onChange={() => {}}
                    className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                </div>
                <h3 className="text-sm font-semibold text-white">Architectural CGI</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Photorealistic interior, exterior, and aerial architectural renderings produced from plans or 3D models.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-sky-400 font-mono">
                Day, Dusk & Night Renders
              </div>
            </div>

            {/* Virtual Staging */}
            <div
              onClick={() => toggleService('VIRTUAL_STAGING')}
              className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedServices.VIRTUAL_STAGING
                  ? 'bg-sky-950/60 border-sky-500 ring-1 ring-sky-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-lg bg-amber-900/40 border border-amber-800 text-amber-400">
                    <Sofa className="w-5 h-5" />
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedServices.VIRTUAL_STAGING}
                    onChange={() => {}}
                    className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                </div>
                <h3 className="text-sm font-semibold text-white">Manual Virtual Staging</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Professional digital interior decoration and furnishing of empty or sparsely furnished spaces.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400 font-mono">
                Curated Interior Styles
              </div>
            </div>

            {/* Virtual Walkthroughs */}
            <div
              onClick={() => toggleService('VIRTUAL_WALKTHROUGH')}
              className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedServices.VIRTUAL_WALKTHROUGH
                  ? 'bg-sky-950/60 border-sky-500 ring-1 ring-sky-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-800 text-emerald-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedServices.VIRTUAL_WALKTHROUGH}
                    onChange={() => {}}
                    className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                </div>
                <h3 className="text-sm font-semibold text-white">Virtual Walkthrough</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Cinematic walkthrough video, 360-degree panorama tour, or browser-viewable 3D experience.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-mono">
                Immersive Property Tours
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button onClick={() => setStep(1)} className="arch-button-secondary">
              &larr; Back
            </button>
            <button onClick={() => setStep(3)} className="arch-button-primary">
              Configure Service Briefs &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Service-Specific Requirements */}
      {step === 3 && (
        <div className="space-y-6">
          {/* CGI Rendering Form */}
          {selectedServices.CGI_RENDERING && (
            <div className="arch-card p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-semibold text-sm">
                <Camera className="w-4 h-4 text-sky-400" />
                <span>Architectural CGI Rendering Specifications</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Lighting / Time of Day
                  </label>
                  <select
                    value={cgiLighting}
                    onChange={(e) => setCgiLighting(e.target.value)}
                    className="arch-input"
                  >
                    <option value="DAY">Bright Daylight</option>
                    <option value="DUSK">Golden Hour / Dusk</option>
                    <option value="NIGHT">Night / Dramatic Illumination</option>
                    <option value="ANY">Artist Discretion / Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Resolution
                  </label>
                  <select
                    value={cgiResolution}
                    onChange={(e) => setCgiResolution(e.target.value)}
                    className="arch-input font-mono"
                  >
                    <option value="4K">4K Ultra HD (3840 x 2160)</option>
                    <option value="8K">8K Master Resolution (7680 x 4320)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Camera Perspectives & Angles Required
                </label>
                <div className="flex flex-wrap gap-2">
                  {['INTERIOR', 'EXTERIOR', 'AERIAL_DRONE', 'STREET_VIEW', 'DETAIL_CLOSEUP'].map(
                    (view) => (
                      <button
                        type="button"
                        key={view}
                        onClick={() => {
                          setCgiViews((prev) =>
                            prev.includes(view) ? prev.filter((v) => v !== view) : [...prev, view]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          cgiViews.includes(view)
                            ? 'bg-sky-900/60 border-sky-500 text-sky-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {view.replace(/_/g, ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Materials, Finishes & Environment Details
                </label>
                <textarea
                  rows={3}
                  value={cgiNotes}
                  onChange={(e) => setCgiNotes(e.target.value)}
                  placeholder="Specify facade materials (concrete, glass, timber), landscaping, vegetation, interior finishes, or surrounding context..."
                  className="arch-input"
                />
              </div>
            </div>
          )}

          {/* Virtual Staging Form */}
          {selectedServices.VIRTUAL_STAGING && (
            <div className="arch-card p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-semibold text-sm">
                <Sofa className="w-4 h-4 text-amber-400" />
                <span>Manual Virtual Staging Specifications</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Preferred Interior Design Style
                  </label>
                  <select
                    value={stagingStyle}
                    onChange={(e) => setStagingStyle(e.target.value)}
                    className="arch-input"
                  >
                    <option value="Modern">Modern Minimalist</option>
                    <option value="Scandinavian">Scandinavian (Nordic Light)</option>
                    <option value="Luxury Contemporary">Luxury High-End Contemporary</option>
                    <option value="Industrial">Urban Industrial / Loft</option>
                    <option value="Traditional">Classic Traditional</option>
                    <option value="Coastal">Coastal / Hamptons</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Color Palette Direction
                  </label>
                  <input
                    type="text"
                    value={stagingColor}
                    onChange={(e) => setStagingColor(e.target.value)}
                    placeholder="e.g., Warm neutrals, taupe, matte black accents"
                    className="arch-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Room Types to Stage
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'LIVING_ROOM',
                    'MASTER_BEDROOM',
                    'DINING_ROOM',
                    'KITCHEN',
                    'HOME_OFFICE',
                    'TERRACE_BALCONY'
                  ].map((room) => (
                    <button
                      type="button"
                      key={room}
                      onClick={() => {
                        setStagingRooms((prev) =>
                          prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        stagingRooms.includes(room)
                          ? 'bg-amber-900/60 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {room.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Furniture & Decoration Guidelines
                </label>
                <textarea
                  rows={3}
                  value={stagingNotes}
                  onChange={(e) => setStagingNotes(e.target.value)}
                  placeholder="Specify key furniture pieces needed (sectional sofa, 8-seater dining table, king bed), art pieces, lighting fixtures..."
                  className="arch-input"
                />
              </div>
            </div>
          )}

          {/* Virtual Walkthrough Form */}
          {selectedServices.VIRTUAL_WALKTHROUGH && (
            <div className="arch-card p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-white font-semibold text-sm">
                <Video className="w-4 h-4 text-emerald-400" />
                <span>Virtual Walkthrough Specifications</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Expected Walkthrough Output Format
                </label>
                <select
                  value={walkthroughType}
                  onChange={(e) => setWalkthroughType(e.target.value)}
                  className="arch-input"
                >
                  <option value="VIDEO">Cinematic Walkthrough Video (MP4)</option>
                  <option value="PANORAMA_360">360-Degree Panorama Tour</option>
                  <option value="INTERACTIVE_3D">Interactive Browser 3D Scene</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Camera Path & Key Highlights
                </label>
                <textarea
                  rows={3}
                  value={walkthroughNotes}
                  onChange={(e) => setWalkthroughNotes(e.target.value)}
                  placeholder="Describe desired camera path: Entrance foyer &rarr; Living room &rarr; Master suite &rarr; Balcony view..."
                  className="arch-input"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(2)} className="arch-button-secondary">
              &larr; Back
            </button>
            <button onClick={() => setStep(4)} className="arch-button-primary">
              Continue to File Uploads &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Source Documents & Reference Files */}
      {step === 4 && (
        <div className="arch-card p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 text-white font-semibold text-base">
            <UploadCloud className="w-5 h-5 text-sky-400" />
            <span>Step 4: Upload Architectural Source Files & References</span>
          </div>

          <p className="text-xs text-slate-400">
            Attach architectural drawings (CAD .dwg, .dxf, .pdf), sketches, property photographs, or 3D models.
          </p>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-800 hover:border-sky-500/80 rounded-xl p-8 text-center bg-slate-900/40 transition-colors">
            <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">Select source files to upload</p>
            <p className="text-xs text-slate-400 mt-1">
              Supports DWG, DXF, PDF, OBJ, FBX, BLEND, PNG, JPG, and ZIP archives up to 50MB each.
            </p>
            <label className="mt-4 inline-block arch-button-secondary cursor-pointer text-xs">
              <span>Browse Files</span>
              <input
                type="file"
                multiple
                onChange={handleFileSelection}
                className="hidden"
              />
            </label>
          </div>

          {/* File Queue List */}
          {filesToUpload.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Queued Files ({filesToUpload.length})
              </h4>
              <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 overflow-hidden bg-slate-900/60">
                {filesToUpload.map((item, index) => (
                  <div key={index} className="p-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{item.file.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={item.category}
                        onChange={(e) => updateFileCategory(index, e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-[11px] rounded px-2.5 py-1 text-slate-200"
                      >
                        <option value="SOURCE_FILE">Source CAD / Drawing</option>
                        <option value="REFERENCE_IMAGE">Style Reference</option>
                      </select>

                      <button
                        onClick={() => removeFile(index)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button onClick={() => setStep(3)} className="arch-button-secondary">
              &larr; Back
            </button>
            <button onClick={() => setStep(5)} className="arch-button-primary">
              Review & Submit &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Review & Submit */}
      {step === 5 && (
        <div className="arch-card p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 text-white font-semibold text-base">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <span>Step 5: Review & Submit Brief</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">{name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {propertyType.replace(/_/g, ' ')} &bull; {location.city || 'Location unstated'},{' '}
                    {location.country || ''}
                  </p>
                </div>
                {deadline && (
                  <div className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded">
                    Due: {new Date(deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              {description && (
                <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                  {description}
                </p>
              )}
            </div>

            {/* Selected Services Summary */}
            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-2">
                Visualization Scope
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {selectedServices.CGI_RENDERING && (
                  <li>
                    <strong>Architectural CGI:</strong> {cgiLighting} lighting, {cgiResolution}{' '}
                    resolution ({cgiViews.join(', ')})
                  </li>
                )}
                {selectedServices.VIRTUAL_STAGING && (
                  <li>
                    <strong>Virtual Staging:</strong> {stagingStyle} style ({stagingRooms.join(', ')})
                  </li>
                )}
                {selectedServices.VIRTUAL_WALKTHROUGH && (
                  <li>
                    <strong>Walkthrough:</strong> {walkthroughType}
                  </li>
                )}
              </ul>
            </div>

            {/* Uploaded Files Summary */}
            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-1">
                Source Materials Attached
              </h4>
              <p className="text-xs text-slate-400">
                {filesToUpload.length > 0
                  ? `${filesToUpload.length} file(s) will be uploaded upon creation.`
                  : 'No source files attached. You can upload drawings later from the project dashboard.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={() => setStep(4)}
              disabled={loading}
              className="arch-button-secondary"
            >
              &larr; Back to Files
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={loading}
                className="arch-button-secondary flex items-center justify-center gap-2"
              >
                <span>Save as Draft</span>
              </button>

              <button
                onClick={() => handleSave(true)}
                disabled={loading}
                className="arch-button-primary flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Submitting Brief...' : 'Submit Brief for Production'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
