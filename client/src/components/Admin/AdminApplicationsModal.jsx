import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  X, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Loader2, 
  Clock 
} from 'lucide-react';

export default function AdminApplicationsModal({ isOpen, onClose }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

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

  const handleDecision = async (userId, decision) => {
    setActionId(userId);
    try {
      await api.put(`/admin/applications/${userId}`, { status: decision });
      setApplications((prev) => prev.filter((app) => app._id !== userId));
    } catch (err) {
      console.error('Decision error:', err);
      alert('Could not update application status.');
    } finally {
      setActionId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        
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
            <div className="text-center py-12 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
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
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{app.email} • {app.landlordApplication?.contactNumber}</p>
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 inline-block mt-1">
                      ID: {app.landlordApplication?.governmentIdType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={actionId === app._id}
                      onClick={() => handleDecision(app._id, 'approved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={actionId === app._id}
                      onClick={() => handleDecision(app._id, 'rejected')}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <a
                    href={app.landlordApplication?.idDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>View Government ID</span>
                  </a>
                  <a
                    href={app.landlordApplication?.ownershipDocumentUrl}
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

      </div>
    </div>
  );
}