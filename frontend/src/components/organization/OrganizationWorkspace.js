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
  X,
  Copy,
  KeyRound,
  Eye,
  EyeOff,
  Palette,
  FolderKanban,
  UserCheck
} from 'lucide-react';
import organizationService from '../../services/organizationService';

export default function OrganizationWorkspace({ currentUser }) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Creation state
  const [createName, setCreateName] = useState('');
  const [createType, setCreateType] = useState('ARCHITECTURAL_FIRM');
  const [createEmail, setCreateEmail] = useState(currentUser?.email || '');
  const [createPhone, setCreatePhone] = useState('');
  const [creating, setCreating] = useState(false);

  // Direct Provision Modal state (Option 1)
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [provisionData, setProvisionData] = useState({
    name: '',
    email: '',
    role: 'VISUALIZATION_ARTIST',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState('');
  const [lastProvisioned, setLastProvisioned] = useState(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Quick invite by email modal state
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
      setSuccessMsg(`Firm workspace "${created.name}" created successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    let pwd = 'AV-';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setProvisionData((prev) => ({ ...prev, password: pwd }));
  };

  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    if (!organization) return;
    setProvisionError('');

    if (provisionData.password.length < 8) {
      setProvisionError('Temporary password must be at least 8 characters long');
      return;
    }

    try {
      setProvisioning(true);
      const res = await organizationService.provisionMember(organization._id, {
        name: provisionData.name.trim(),
        email: provisionData.email.trim(),
        role: provisionData.role,
        password: provisionData.password
      });

      setOrganization(res.data?.organization || res.organization || organization);
      setLastProvisioned({
        name: provisionData.name.trim(),
        email: provisionData.email.trim(),
        role: provisionData.role,
        password: provisionData.password
      });
      setProvisionData({
        name: '',
        email: '',
        role: 'VISUALIZATION_ARTIST',
        password: ''
      });
      setSuccessMsg(`Team member successfully provisioned for ${organization.name}!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setProvisionError(err?.response?.data?.message || err.message || 'Failed to provision team member');
    } finally {
      setProvisioning(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!lastProvisioned) return;
    const text = `Archvizon Sign-In Credentials:\nEmail: ${lastProvisioned.email}\nTemporary Password: ${lastProvisioned.password}\nAssigned Role: ${lastProvisioned.role}\nSign-in URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 3000);
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      setError('');
      const updated = await organizationService.updateMemberRole(organization._id, memberId, newRole);
      setOrganization(updated);
      setSuccessMsg('Team member role updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update member role');
    }
  };

  const handleAddMemberByEmail = async (e) => {
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
    if (!window.confirm(`Remove ${memberName} from firm? They will lose access to firm projects.`)) return;

    try {
      setError('');
      const updated = await organizationService.removeMember(organization._id, memberId);
      setOrganization(updated);
      setSuccessMsg(`${memberName} removed from firm.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="arch-card p-12 text-center text-slate-500 dark:text-slate-400">
        <Building2 className="w-6 h-6 animate-pulse mx-auto mb-3 text-sky-600 dark:text-sky-400" />
        <p className="text-xs font-mono">Loading firm workspace...</p>
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
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* State 1: No Organization Joined Yet */}
      {!organization ? (
        <div className="arch-card p-8 max-w-xl mx-auto space-y-6 shadow-lg">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create a Firm / Studio Workspace</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Establish your firm workspace to onboard Project Managers, Visualization Artists, and collaborators with designated roles and shared project access.
            </p>
          </div>

          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Firm / Studio Name *</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Apex CGI Studios, Foster & Partners"
                required
                className="arch-input text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Organization Type</label>
                <select
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value)}
                  className="arch-input text-xs"
                >
                  <option value="ARCHITECTURAL_FIRM">Architectural Practice</option>
                  <option value="DEVELOPER">Real Estate Developer</option>
                  <option value="INTERIOR_STUDIO">Interior Design Studio</option>
                  <option value="MARKETING_AGENCY">Property Marketing Agency</option>
                  <option value="OTHER">3D Visualization Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contact Email</label>
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
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number (Optional)</label>
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
              className="w-full arch-button-primary text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>{creating ? 'Creating Workspace...' : 'Create Firm Workspace'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* State 2: Organization Active */
        <div className="space-y-6">
          {/* Organization Banner */}
          <div className="arch-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-sky-500 shadow-md">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                  {organization.organizationType?.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {organization.memberIds?.length || 1} Team Members &bull; {organization.projectCount || 0} Shared Projects
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{organization.name}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                {organization.contactEmail && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {organization.contactEmail}
                  </span>
                )}
                {organization.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {organization.phone}
                  </span>
                )}
                <span>Firm Owner: <strong className="text-slate-700 dark:text-slate-200">{organization.ownerId?.name || 'You'}</strong></span>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => {
                    setIsProvisionOpen(true);
                    setLastProvisioned(null);
                    generateRandomPassword();
                  }}
                  className="arch-button-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Provision Team Member</span>
                </button>

                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="arch-button-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Invite Existing</span>
                </button>
              </div>
            )}
          </div>

          {/* Last Provisioned Credentials Card (Instant Sharing) */}
          {lastProvisioned && (
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Team Member Created: {lastProvisioned.name}
                  </span>
                </div>
                <button
                  onClick={handleCopyCredentials}
                  className="arch-button-secondary text-xs py-1 px-2.5 flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCredentials ? 'Copied to Clipboard!' : 'Copy Login Credentials'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{lastProvisioned.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Temporary Password</span>
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">{lastProvisioned.password}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Role</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">{lastProvisioned.role}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Sign In Portal</span>
                  <span className="text-slate-600 dark:text-slate-300">/login</span>
                </div>
              </div>
            </div>
          )}

          {/* Shared Access Explainer Strip */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <Users className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
            <p className="leading-relaxed text-[11px]">
              <strong>Multi-User Firm Collaboration:</strong> Project Managers can triage incoming briefs and assign tasks; Visualization Artists can open 3D scenes, perform staging, and upload deliverables; and clients can review deliverables.
            </p>
          </div>

          {/* Team Members List */}
          <div className="arch-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Firm Team Members ({organization.memberIds?.length || 0})
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {organization.memberIds?.map((member) => {
                const isMemberOwner = (member._id || member.id) === (organization.ownerId?._id || organization.ownerId?.id || organization.ownerId);

                return (
                  <div key={member._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sky-600 dark:text-sky-400 text-xs">
                        {member.name ? member.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">{member.name}</span>
                          {isMemberOwner && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Firm Owner
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isOwner && !isMemberOwner ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member._id, e.target.value)}
                          className="arch-input text-xs !py-1 !px-2 bg-white dark:bg-slate-900"
                          title="Change team member role"
                        >
                          <option value="VISUALIZATION_ARTIST">Visualization Artist</option>
                          <option value="PROJECT_MANAGER">Project Manager</option>
                          <option value="CLIENT">Client / Member</option>
                        </select>
                      ) : (
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                          {member.role?.replace(/_/g, ' ')}
                        </span>
                      )}

                      {isOwner && !isMemberOwner && (
                        <button
                          onClick={() => handleRemoveMember(member._id, member.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Remove from organization"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* ---------------- MODAL 1: PROVISION NEW MEMBER (OPTION 1) ---------------- */}
      {isProvisionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsProvisionOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Provision Team Member</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create login credentials directly for an artist or manager in {organization?.name}.
                </p>
              </div>
            </div>

            {provisionError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{provisionError}</span>
              </div>
            )}

            <form onSubmit={handleProvisionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={provisionData.name}
                    onChange={(e) => setProvisionData({ ...provisionData, name: e.target.value })}
                    placeholder="e.g. Alex Henderson"
                    className="arch-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assign Role *</label>
                  <select
                    value={provisionData.role}
                    onChange={(e) => setProvisionData({ ...provisionData, role: e.target.value })}
                    className="arch-input text-xs"
                  >
                    <option value="VISUALIZATION_ARTIST">Visualization Artist (3D & Renders)</option>
                    <option value="PROJECT_MANAGER">Project Manager (Triage & Assignments)</option>
                    <option value="CLIENT">Client / Firm Member (Brief Reviewer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Work Email Address *</label>
                <input
                  type="email"
                  required
                  value={provisionData.email}
                  onChange={(e) => setProvisionData({ ...provisionData, email: e.target.value })}
                  placeholder="alex@yourfirm.com"
                  className="arch-input text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Temporary Password * (min. 8 chars)
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Generate Random</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={provisionData.password}
                    onChange={(e) => setProvisionData({ ...provisionData, password: e.target.value })}
                    placeholder="••••••••"
                    className="arch-input text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                The member can immediately sign in at <code>/login</code> using these credentials. You will be given a copyable summary card to share with them upon creation.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProvisionOpen(false)}
                  className="arch-button-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisioning}
                  className="arch-button-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{provisioning ? 'Creating Member...' : 'Create & Provision Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 2: INVITE EXISTING BY EMAIL ---------------- */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsInviteOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Existing User</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Link an already-registered user to {organization?.name}.
                </p>
              </div>
            </div>

            {inviteError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleAddMemberByEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Registered Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@yourfirm.com"
                  required
                  className="arch-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="arch-button-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="arch-button-primary text-xs py-2 px-4 flex items-center gap-1.5"
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