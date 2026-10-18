import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  X, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Loader2, 
  Clock,
  AlertTriangle,
  Send
} from 'lucide-react';

const resolveDocUrl = (path) => {
  if (!path) return '#';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const normalized = cleanPath.startsWith('/uploads') ? cleanPath : `/uploads${cleanPath}`;
  return `https://fabh-backend.onrender.com${normalized}`;
};

export default function AdminApplicationsModal({ isOpen, onClose }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  // Custom UI Dialog States (Replaces native browser window.confirm / prompt)
  const [confirmApproveApp, setConfirmApproveApp] = useState(null);
  const [rejectApp, setRejectApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  useEffect(() => {
    if (isOpen) fetchApplications();
  }, [isOpen]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/applications');
      setApplications(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeApproval = async () => {
    if (!confirmApproveApp) return;
    const userId = confirmApproveApp._id;
    setActionId(userId);
    try {
      await api.put(`/admin/applications/${userId}`, { status: 'approved' });
      setApplications((prev) => prev.filter((app) => app._id !== userId));
      setConfirmApproveApp(null);
    } catch (err) {
      console.error('Approval error:', err);
    } finally {
      setActionId(null);
    }
  };

  const executeRejection = async () => {
    if (!rejectApp) return;
    if (!rejectionReason.trim()) {
      setRejectionError('Please specify a rejection reason for the applicant.');
      return;
    }

    const userId = rejectApp._id;
    setActionId(userId);
    try {
      await api.put(`/admin/applications/${userId}`, { 
        status: 'rejected',
        rejectionReason: rejectionReason.trim()
      });
      setApplications((prev) => prev.filter((app) => app._id !== userId));
      setRejectApp(null);
      setRejectionReason('');
      setRejectionError('');
    } catch (err) {
      console.error('Rejection error:', err);
      setRejectionError(err.response?.data?.message || 'Failed to submit rejection.');
    } finally {
      setActionId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] transition-colors relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pending Landlord Verification Portal</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Inspect uploaded government IDs and property permits before granting landlord rights.</p>
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs">Fetching pending applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No pending landlord applications at the moment.</p>
            </div>
          ) : (
            applications.map((app) => (
              <div 
                key={app._id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{app.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {app.email} • {app.landlordApplication?.contactNumber}
                    </p>
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 inline-block mt-1">
                      ID: {app.landlordApplication?.governmentIdType || 'Valid ID'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={actionId === app._id}
                      onClick={() => setConfirmApproveApp(app)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
                    >
                      {actionId === app._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={actionId === app._id}
                      onClick={() => {
                        setRejectApp(app);
                        setRejectionReason('');
                        setRejectionError('');
                      }}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <a
                    href={resolveDocUrl(app.landlordApplication?.idDocumentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>View Government ID</span>
                  </a>
                  <a
                    href={resolveDocUrl(app.landlordApplication?.ownershipDocumentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>View Property Permit</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CUSTOM APPROVAL CONFIRMATION MODAL */}
        {confirmApproveApp && (
          <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Confirm Elevation</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Grant Landlord Privileges</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to verify and elevate <strong>"{confirmApproveApp.name}"</strong> to Landlord status? They will immediately receive posting privileges.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmApproveApp(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeApproval}
                  disabled={actionId === confirmApproveApp._id}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  {actionId === confirmApproveApp._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Confirm & Elevate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM REJECTION REASON MODAL */}
        {rejectApp && (
          <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="p-2 bg-rose-100 dark:bg-rose-950/60 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reject Application</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">For {rejectApp.name} ({rejectApp.email})</p>
                </div>
              </div>

              {rejectionError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                  {rejectionError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g., The uploaded Barangay Permit is expired, or the PhilSys ID photo is blurry and unreadable..."
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (rejectionError) setRejectionError('');
                  }}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  This reason will be sent to their account notifications and their registered email.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setRejectApp(null);
                    setRejectionReason('');
                    setRejectionError('');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeRejection}
                  disabled={actionId === rejectApp._id}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  {actionId === rejectApp._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send Rejection & Notify
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}