'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Box,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Compass,
  Check
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import projectService from '../../../services/projectService';

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [template, setTemplate] = useState('EMPTY'); // EMPTY, LIVING_ROOM, STUDIO, STAGING
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState('RESIDENTIAL');
  const [locationCity, setLocationCity] = useState('');
  const [locationCountry, setLocationCountry] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const starterTemplates = [
    {
      id: 'EMPTY',
      title: 'Blank 3D Grid',
      desc: 'Clean 3D workspace with ground grid & XYZ axes. Ready for custom modeling & architectural construction.',
      badge: 'Freeform Modeling',
      icon: Box
    },
    {
      id: 'LIVING_ROOM',
      title: 'Residential Living Room',
      desc: 'Pre-laid perimeter walls, hardwood flooring plane, and window openings ready for furniture arrangement.',
      badge: 'Interior Design',
      icon: Layers
    },
    {
      id: 'STUDIO',
      title: 'Modern Studio Suite',
      desc: 'Enclosed studio apartment layout with partition walls, entrance door opening, and basic ambient lighting.',
      badge: 'Architectural Layout',
      icon: Building2
    },
    {
      id: 'STAGING',
      title: 'Virtual Staging Workspace',
      desc: 'Configured for uploading empty room photographs to perform AI-driven furnishing & style transformation.',
      badge: 'Virtual Staging',
      icon: Sparkles
    }
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a project name.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        name: name.trim(),
        description: description.trim() || `Architectural ${starterTemplates.find((t) => t.id === template)?.title} project.`,
        propertyType,
        location: {
          city: locationCity.trim(),
          country: locationCountry.trim()
        },
        template
      };

      const data = await projectService.createProject(payload);
      if (data?.project?._id) {
        // Direct route to 3D Editor immediately for best Blender-like interactive UX
        router.push(`/projects/${data.project._id}/editor`);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err.message || 'Failed to create 3D project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Top Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create 3D Architectural Project</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Select a starter template and initialize your browser-based 3D design workspace.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-8">
        {/* Step 1: Starter Template Selection */}
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
            1. Select 3D Starter Template
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {starterTemplates.map((t) => {
              const Icon = t.icon;
              const isSelected = template === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/50 shadow-lg'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div
                        className={`p-2.5 rounded-lg border ${
                          isSelected
                            ? 'bg-sky-100 dark:bg-sky-900/60 border-sky-300 dark:border-sky-600 text-sky-700 dark:text-sky-300'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {t.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-sky-600 dark:text-sky-400 font-mono font-medium">
                      {isSelected ? 'Selected' : 'Click to select'}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Project Metadata */}
        <div className="arch-card p-6 space-y-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono pb-2 border-b border-slate-200 dark:border-slate-800">
            2. Project Details
          </label>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Project Name <span className="text-rose-500 dark:text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Azure Horizon Luxury Villa"
                className="arch-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="arch-input"
                >
                  <option value="RESIDENTIAL">Residential (Apartment, Villa, House)</option>
                  <option value="COMMERCIAL">Commercial (Office, Retail)</option>
                  <option value="MIXED_USE">Mixed-Use Complex</option>
                  <option value="HOSPITALITY">Hospitality (Hotel, Lounge)</option>
                  <option value="INDUSTRIAL">Industrial / Warehouse</option>
                  <option value="OTHER">Other Architectural Project</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    placeholder="City (e.g. London)"
                    className="arch-input text-xs"
                  />
                  <input
                    type="text"
                    value={locationCountry}
                    onChange={(e) => setLocationCountry(e.target.value)}
                    placeholder="Country"
                    className="arch-input text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description (Optional)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief notes about design concept, target styling, materials, or spatial layout..."
                className="arch-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center pt-2">
          <Link href="/dashboard" className="arch-button-secondary text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="arch-button-primary flex items-center gap-2 text-sm !py-3 !px-6 shadow-lg shadow-sky-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing 3D Workspace...</span>
              </>
            ) : (
              <>
                <span>Launch 3D Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
