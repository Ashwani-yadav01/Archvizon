'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, X, AlertCircle, Shield, Sparkles, Check } from 'lucide-react';
import assignmentService from '../../services/assignmentService';
import userService from '../../services/userService';
import StatusBadge from '../common/StatusBadge';

export default function TeamAssignmentPanel({ projectId, assignments = [], serviceRequests = [], canManage = false, onAssignmentChanged }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableArtists, setAvailableArtists] = useState([]);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('VISUALIZATION_ARTIST');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch available users when modal opens
  useEffect(() => {
    if (isModalOpen && canManage) {
      loadTeamCandidates();
    }
  }, [isModalOpen, canManage]);

  const loadTeamCandidates = async () => {
    try {
      setLoadingUsers(true);
      setError('');
      const [artistRes, managerRes] = await Promise.all([
        userService.getUsers({ role: 'VISUALIZATION_ARTIST', limit: 50 }),
        userService.getUsers({ role: 'PROJECT_MANAGER', limit: 50 })
      ]);
      setAvailableArtists(artistRes.users || []);
      setAvailableManagers(managerRes.users || []);
      if ((artistRes.users || []).length > 0) {
        setSelectedUser(artistRes.users[0]._id);
      }
    } catch (err) {
      setError('Failed to load available team members');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Please select a team member');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await assignmentService.assignTeamMember(projectId, {
        assignedTo: selectedUser,
        roleOnProject: selectedRole,
        serviceRequestId: selectedServiceId || undefined,
        notes
      });
      setSuccessMsg('Team member assigned successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
        setNotes('');
        if (onAssignmentChanged) onAssignmentChanged();
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to assign team member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (assignmentId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName || 'this member'} from the project team?`)) {
      return;
    }

    try {
      await assignmentService.removeAssignment(projectId, assignmentId);
      if (onAssignmentChanged) onAssignmentChanged();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to remove assignment');
    }
  };

  return (
    <div className="arch-card p-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-400" />
          <h3 className="text-base font-semibold text-white">Production Team</h3>
          <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded-full font-mono border border-slate-700">
            {assignments.length}
          </span>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="arch-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Assign Member
          </button>
        )}
      </div>

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400">No visualization artists or managers assigned yet.</p>
          {canManage && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-xs text-sky-400 hover:text-sky-300 font-medium transition"
            >
              + Allocate visualization artist
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const assignee = assignment.assignedTo || {};
            return (
              <div
                key={assignment._id}
                className="flex items-start justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-semibold text-xs shrink-0 mt-0.5">
                    {assignee.name ? assignee.name[0].toUpperCase() : 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-white">{assignee.name || 'Assigned User'}</p>
                      <StatusBadge status={assignment.roleOnProject || assignee.role} />
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{assignee.email}</p>
                    {assignment.notes && (
                      <p className="text-xs text-slate-300 mt-2 bg-slate-950/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg">
                        <span className="text-slate-400 text-[11px]">Notes: </span>
                        {assignment.notes}
                      </p>
                    )}
                    {assignment.serviceRequestId && (
                      <p className="text-[11px] text-sky-400/90 mt-1">
                        Assigned Service: {assignment.serviceRequestId?.serviceType || 'Specific Request'}
                      </p>
                    )}
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() => handleRemove(assignment._id, assignee.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition shrink-0"
                    title="Remove assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Assign Team Member</h3>
                <p className="text-xs text-slate-400">Allocate an artist or manager to this visualization brief.</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAssign} className="space-y-4">
              {/* Role Toggle */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Role on Project</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('VISUALIZATION_ARTIST');
                      if (availableArtists.length > 0) setSelectedUser(availableArtists[0]._id);
                    }}
                    className={`py-2 px-3 text-xs rounded-xl border font-medium transition ${
                      selectedRole === 'VISUALIZATION_ARTIST'
                        ? 'bg-sky-600/20 border-sky-500 text-sky-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    3D Artist
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('PROJECT_MANAGER');
                      if (availableManagers.length > 0) setSelectedUser(availableManagers[0]._id);
                    }}
                    className={`py-2 px-3 text-xs rounded-xl border font-medium transition ${
                      selectedRole === 'PROJECT_MANAGER'
                        ? 'bg-sky-600/20 border-sky-500 text-sky-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Project Manager
                  </button>
                </div>
              </div>

              {/* User Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select {selectedRole === 'VISUALIZATION_ARTIST' ? 'Visualization Artist' : 'Project Manager'}
                </label>
                {loadingUsers ? (
                  <p className="text-xs text-slate-400 py-2">Loading directory...</p>
                ) : (
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    required
                    className="arch-input text-xs"
                  >
                    {(selectedRole === 'VISUALIZATION_ARTIST' ? availableArtists : availableManagers).map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                    {(selectedRole === 'VISUALIZATION_ARTIST' ? availableArtists : availableManagers).length === 0 && (
                      <option value="" disabled>
                        No candidates found for this role
                      </option>
                    )}
                  </select>
                )}
              </div>

              {/* Optional Service Scope */}
              {serviceRequests.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Assign to Specific Service (Optional)
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="arch-input text-xs"
                  >
                    <option value="">Whole Project (All Services)</option>
                    {serviceRequests.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.serviceType}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Production Notes & Instructions
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Focus on living room camera angle #2, high priority render deliverable."
                  rows={3}
                  className="arch-input text-xs"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="arch-btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedUser}
                  className="arch-btn-primary text-xs py-2 px-4"
                >
                  {submitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
