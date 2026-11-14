'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, Shield, Trash2, Clock, Lock, Sparkles, User } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import commentService from '../../services/commentService';

export default function FeedbackCommentsSection({
  projectId,
  comments = [],
  currentUser,
  onCommentAdded
}) {
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isStaff = currentUser?.role === 'ADMIN' || currentUser?.role === 'PROJECT_MANAGER';
  const isArtist = currentUser?.role === 'VISUALIZATION_ARTIST';
  const canPostInternal = isStaff || isArtist;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      await commentService.addComment(projectId, {
        message: message.trim(),
        isInternal: canPostInternal ? isInternal : false
      });
      setMessage('');
      setIsInternal(false);
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentService.deleteComment(commentId);
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="arch-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-400" />
          <h3 className="text-base font-bold text-white">Project Discussion & Feedback</h3>
          <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded-full font-mono">
            {comments.length}
          </span>
        </div>
        <span className="text-xs text-slate-500 font-mono">Real-time collaboration feed</span>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            No comments or feedback logged yet. Start the conversation below.
          </div>
        ) : (
          comments.map((comment) => {
            const author = comment.authorId || {};
            const isCurrentUser = author._id === currentUser?._id || author.id === currentUser?.id;

            return (
              <div
                key={comment._id}
                className={`p-4 rounded-xl border transition ${
                  comment.isInternal
                    ? 'bg-purple-950/20 border-purple-800/60'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0 mt-0.5">
                      {author.name ? author.name[0].toUpperCase() : 'U'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white">{author.name || 'User'}</span>
                        <StatusBadge status={author.role} />
                        {comment.isInternal && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                            <Lock className="w-2.5 h-2.5" />
                            Internal Team Note
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap mt-1">
                        {comment.message}
                      </p>

                      <p className="text-[10px] text-slate-500 font-mono mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {(isCurrentUser || currentUser?.role === 'ADMIN') && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-800 space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message, design critique, or question here..."
          rows={3}
          required
          className="arch-input text-xs"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {canPostInternal ? (
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-purple-300 hover:text-purple-200">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-purple-400" />
                Post as internal note (hidden from client)
              </span>
            </label>
          ) : (
            <span className="text-[11px] text-slate-500">
              Messages will be visible to the entire visualization team.
            </span>
          )}

          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="arch-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 self-end disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Posting...' : 'Post Message'}
          </button>
        </div>
      </form>
    </div>
  );
}
