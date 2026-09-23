import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  X, Check, ShieldAlert, Loader2, FileText, Phone, 
  User, Calendar, Eye, AlertCircle, ZoomIn 
} from 'lucide-react';

export default function AdminApplicationsModal({ isOpen, onClose }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Lightbox Preview State for uploaded ID / Permit photos
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  // Rejection Reason Prompt State
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchApplications();
    }
  }, [isOpen]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/landlord-applications');
      setApplications(res.data.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Resolves whether the document is a full URL or a local backend static /uploads path
  const getFullAssetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Fallback to backend port if not using a Vite dev proxy
    const backendBase = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    return `${backendBase}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const handleReview = async (userId, actionType, reason = '') => {
    setProcessingId(userId);
    try {
      await api.put(`/admin/landlord-applications/${userId}/review`, {
        action: actionType, // 'approve' or 'reject'
        rejectionReason: actionType === 'reject' ? (reason || 'Documents could not be verified') : undefined,
      });
      // Remove reviewed application from the local list
      setApplications((prev) => prev.filter((app) => app._id !== userId));
      setRejectingApp(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Failed to update review status:', err);
      alert(err.response?.data?.message || 'Failed to update review status.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] relative animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              Pending Landlord Verification Portal
            </h3>
            <p className="text-xs text-slate-500">
              Inspect uploaded government IDs and property permits before granting landlord rights.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Application List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              Loading pending verification requests...
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
              No pending landlord applications at the moment.
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app._id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col gap-4"
              >
                {/* Applicant Profile Bar */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      {app.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{app.email}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {app.landlordApplication?.status || 'pending'}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mobile: <strong>{app.landlordApplication?.contactNumber || 'N/A'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>ID Type: <strong>{app.landlordApplication?.governmentIdType || 'N/A'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Submitted:{' '}
                      <strong>
                        {app.landlordApplication?.appliedAt
                          ? new Date(app.landlordApplication.appliedAt).toLocaleDateString()
                          : 'Recently'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Uploaded Physical Document Previews */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Uploaded Legal Verification Documents
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Government ID Preview Card */}
                    {app.landlordApplication?.idDocumentUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(getFullAssetUrl(app.landlordApplication.idDocumentUrl));
                          setPreviewTitle(`${app.name}'s Government ID (${app.landlordApplication.governmentIdType})`);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 bg-slate-50 transition text-left cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300 relative">
                          <img
                            src={getFullAssetUrl(app.landlordApplication.idDocumentUrl)}
                            alt="Gov ID"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                            <ZoomIn className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                            Inspect Government ID
                          </p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Eye className="w-3 h-3 text-emerald-600" /> Click to expand image
                          </p>
                        </div>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No ID uploaded</span>
                    )}

                    {/* Ownership / Permit Document Preview Card */}
                    {app.landlordApplication?.ownershipDocumentUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(getFullAssetUrl(app.landlordApplication.ownershipDocumentUrl));
                          setPreviewTitle(`${app.name}'s Property Permit / Tax Dec Proof`);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 bg-slate-50 transition text-left cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300 relative">
                          <img
                            src={getFullAssetUrl(app.landlordApplication.ownershipDocumentUrl)}
                            alt="Ownership Document"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                            <ZoomIn className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                            Inspect Property Proof
                          </p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Eye className="w-3 h-3 text-emerald-600" /> Click to expand image
                          </p>
                        </div>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No property proof uploaded</span>
                    )}
                  </div>
                </div>

                {/* Review Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={processingId === app._id}
                    onClick={() => {
                      setRejectingApp(app);
                      setRejectionReason('');
                    }}
                    className="flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition disabled:opacity-50 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject Application
                  </button>

                  <button
                    type="button"
                    disabled={processingId === app._id}
                    onClick={() => handleReview(app._id, 'approve')}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {processingId === app._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Approve as Landlord
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sub-Modal 1: Image Lightbox Viewer */}
        {previewImage && (
          <div className="fixed inset-0 z-[11000] bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-bold text-slate-800 truncate">{previewTitle}</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded-md hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 bg-slate-900 max-h-[70vh] flex items-center justify-center overflow-auto">
                <img
                  src={previewImage}
                  alt="Expanded Document Proof"
                  className="max-h-[65vh] w-auto object-contain rounded-lg shadow-lg"
                />
              </div>
              <div className="p-2.5 bg-white border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="px-4 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Modal 2: Rejection Confirmation with Reason */}
        {rejectingApp && (
          <div className="fixed inset-0 z-[11000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h4 className="text-sm font-bold text-slate-900">Reject Landlord Application</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide a brief reason why <strong>{rejectingApp.name}</strong>'s verification cannot be accepted. This will be visible on their profile.
              </p>
              <textarea
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., The uploaded ID photo is blurry, or the barangay permit has expired."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingApp(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processingId === rejectingApp._id}
                  onClick={() => handleReview(rejectingApp._id, 'reject', rejectionReason)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}