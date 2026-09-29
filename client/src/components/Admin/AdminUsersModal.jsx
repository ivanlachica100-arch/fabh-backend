import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  X, Search, ShieldAlert, CheckCircle2, AlertTriangle, 
  RotateCcw, UserX, Loader2, Users, Mail, Calendar 
} from 'lucide-react';

export default function AdminUsersModal({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Target User for Deactivation Modal Prompt
  const [deactivatingUser, setDeactivatingUser] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    } else {
      setUsers([]);
      setSearchQuery('');
      setActionError('');
      setActionSuccess('');
      setDeactivatingUser(null);
      setDeactivateReason('');
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    setActionError('');
    try {
      const res = await api.get('/auth/admin/users');
      if (res.data.success && Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching registered users:', err);
      setActionError(err.response?.data?.message || 'Failed to fetch registered users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateSubmit = async (e) => {
    e.preventDefault();
    if (!deactivateReason.trim() || deactivateReason.trim().length < 5) {
      setActionError('Please provide a specific deactivation reason (minimum 5 characters).');
      return;
    }

    setSubmittingAction(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.put(`/auth/admin/users/${deactivatingUser._id}/deactivate`, {
        reason: deactivateReason.trim(),
      });

      if (res.data.success) {
        setActionSuccess(`User ${deactivatingUser.email} has been deactivated and notified via email.`);
        setDeactivatingUser(null);
        setDeactivateReason('');
        await fetchUsers();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to deactivate account.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReactivateUser = async (user) => {
    if (!window.confirm(`Are you sure you want to restore access for ${user.email}?`)) {
      return;
    }

    setSubmittingAction(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.put(`/auth/admin/users/${user._id}/reactivate`);
      if (res.data.success) {
        setActionSuccess(`User ${user.email} has been reinstated.`);
        await fetchUsers();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reinstate user.');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(q);
    const emailMatch = u.email?.toLowerCase().includes(q);
    const roleMatch = u.role?.toLowerCase().includes(q);
    return nameMatch || emailMatch || roleMatch;
  });

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">User Accounts Moderation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage registered students, landlords, and deactivations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback banners */}
        {actionSuccess && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="mx-4 mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Users Table / List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs">Loading user registry...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-xs">No registered users matched your query.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredUsers.map((u) => {
                const joinedDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A';
                const isDeactivated = Boolean(u.isDeactivated);

                return (
                  <div
                    key={u._id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isDeactivated
                        ? 'border-rose-200 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {u.name || 'Unnamed User'}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          u.role === 'landlord'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                        }`}>
                          {u.role}
                        </span>
                        {isDeactivated ? (
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                            Deactivated
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {u.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Joined: {joinedDate}
                        </span>
                      </div>

                      {isDeactivated && u.deactivationReason && (
                        <p className="text-[11px] text-rose-700 dark:text-rose-300 italic pt-0.5">
                          Reason: "{u.deactivationReason}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isDeactivated ? (
                        <button
                          type="button"
                          disabled={submittingAction}
                          onClick={() => handleReactivateUser(u)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={submittingAction}
                          onClick={() => {
                            setDeactivatingUser(u);
                            setDeactivateReason('');
                            setActionError('');
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prompt Modal for Deactivation Reason */}
        {deactivatingUser && (
          <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Deactivate {deactivatingUser.email}
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This action revokes the user's login access. An official notification with this reason will be dispatched to their Gmail address.
              </p>

              <form onSubmit={handleDeactivateSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Administrative Reason:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g., Violation of Terms of Service: Submitting false listings or harassment in reviews."
                    value={deactivateReason}
                    onChange={(e) => setDeactivateReason(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={submittingAction}
                    onClick={() => {
                      setDeactivatingUser(null);
                      setDeactivateReason('');
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm & Send Reason
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}