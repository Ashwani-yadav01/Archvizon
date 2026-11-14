'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Plus,
  Mail,
  Trash2,
  Shield,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Sparkles,
  Phone,
  UserPlus,
  X
} from 'lucide-react';
import organizationService from '../../services/organizationService';

export default function OrganizationWorkspace({ currentUser }) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Creation state
  const [createName, setCreateName] = useState('');
  const [createType, setCreateType] = useState('DEVELOPER');
  const [createEmail, setCreateEmail] = useState(currentUser?.email || '');
  const [createPhone, setCreatePhone] = useState('');
  const [creating, setCreating] = useState(false);

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      setError('');
      const org = await organizationService.getMyOrganization();
      setOrganization(org);
    } catch (err) {
      console.error('Failed to load organization:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, []);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;

    try {
      setCreating(true);
      setError('');
      const created = await organizationService.createOrganization({
        name: createName.trim(),
        organizationType: createType,
        contactEmail: createEmail.trim(),
        phone: createPhone.trim()
      });
      setOrganization(created);
      setSuccessMsg(`Organization "${created.name}" created successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !organization) return;

    try {
      setInviting(true);
      setInviteError('');
      const updated = await organizationService.addMember(organization._id, inviteEmail.trim());
      setOrganization(updated);
      setInviteEmail('');
      setIsInviteOpen(false);
      setSuccessMsg(`Team member added to ${organization.name}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setInviteError(err?.response?.data?.message || err.message || 'Failed to add member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from organization? They will lose shared access to projects.`)) return;

    try {
      setError('');
      const updated = await organizationService.removeMember(organization._id, memberId);
      setOrganization(updated);
      setSuccessMsg(`${memberName} removed from organization.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="arch-card p-12 text-center text-slate-400">
        <Building2 className="w-6 h-6 animate-pulse mx-auto mb-3 text-sky-400" />
        <p className="text-xs font-mono">Loading organization workspace...</p>
      </div>
    );
  }

  const isOwner = organization && (
    organization.ownerId?._id === currentUser?._id ||
    organization.ownerId?.id === currentUser?.id ||
    organization.ownerId === currentUser?._id ||
    currentUser?.role === 'ADMIN'
  );

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* State 1: No Organization Joined */}
      {!organization ? (
        <div className="arch-card p-8 max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Create an Organization Workspace</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Collaborate with architects, developers, and project team members in a unified workspace with shared visualization projects, deliverables, and revision threads.
            </p>
          </div>

          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Organization / Firm Name</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Skyline Urban Developers, Foster & Partners"
                required
                className="arch-input text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Organization Type</label>
                <select
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value)}
                  className="arch-input text-xs"
                >
                  <option value="DEVELOPER">Real Estate Developer</option>
                  <option value="ARCHITECTURAL_FIRM">Architectural Firm</option>
                  <option value="INTERIOR_STUDIO">Interior Design Studio</option>
                  <option value="MARKETING_AGENCY">Property Marketing Agency</option>
                  <option value="OTHER">Other Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  required
                  className="arch-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number (Optional)</label>
              <input
                type="tel"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="arch-input text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full arch-btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>{creating ? 'Creating Workspace...' : 'Create Organization Workspace'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* State 2: Organization Active */
        <div className="space-y-6">
          {/* Organization Banner */}
          <div className="arch-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-sky-500">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded border border-sky-800">
                  {organization.organizationType?.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {organization.memberIds?.length || 1} Team Members &bull; {organization.projectCount || 0} Shared Projects
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{organization.name}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                {organization.contactEmail && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {organization.contactEmail}
                  </span>
                )}
                {organization.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {organization.phone}
                  </span>
                )}
                <span>Owner: <strong className="text-slate-200">{organization.ownerId?.name || 'You'}</strong></span>
              </div>
            </div>

            {isOwner && (
              <button
                onClick={() => setIsInviteOpen(true)}
                className="arch-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Colleague</span>
              </button>
            )}
          </div>

          {/* Shared Access Explainer Strip */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
            <Users className="w-5 h-5 text-sky-400 shrink-0" />
            <p className="leading-relaxed text-[11px]">
              <strong>Multi-User Organization Access Enabled:</strong> All members listed below share project visibility, can submit visualization briefs on behalf of the firm, inspect deliverables, and collaborate on revisions.
            </p>
          </div>

          {/* Team Members List */}
          <div className="arch-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Team Members ({organization.memberIds?.length || 0})
              </h3>
            </div>

            <div className="divide-y divide-slate-800/80">
              {organization.memberIds?.map((member) => {
                const isMemberOwner = (member._id || member.id) === (organization.ownerId?._id || organization.ownerId?.id || organization.ownerId);

                return (
                  <div key={member._id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400 text-xs">
                        {member.name ? member.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{member.name}</span>
                          {isMemberOwner && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                              Workspace Owner
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {member.role?.replace(/_/g, ' ')}
                      </span>

                      {isOwner && !isMemberOwner && (
                        <button
                          onClick={() => handleRemoveMember(member._id, member.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                          title="Remove from organization"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Invite Colleague Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsInviteOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-sky-950 border border-sky-800 text-sky-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add Team Member</h3>
                <p className="text-xs text-slate-400">
                  Grant shared access to {organization?.name} projects.
                </p>
              </div>
            </div>

            {inviteError && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Colleague's Registered Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@yourfirm.com"
                  required
                  className="arch-input text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Your teammate must have an existing Archvizon client account. If they haven't registered yet, have them sign up with this email.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="arch-btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="arch-btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{inviting ? 'Adding...' : 'Add Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
