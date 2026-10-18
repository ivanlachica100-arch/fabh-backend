import React, { useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  UploadCloud, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileCheck,
  Building
} from 'lucide-react';

export default function ApplyLandlordModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [contactNumber, setContactNumber] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [idFile, setIdFile] = useState(null);
  const [propertyFile, setPropertyFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (file, setter, fileLabel) => {
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError(`${fileLabel} must be an image (JPG, PNG) or PDF document.`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(`${fileLabel} file size exceeds 5MB limit. Please upload a smaller file.`);
      return;
    }

    setError('');
    setter(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanedPhone = contactNumber.replace(/[\s\-()]/g, '');
    const phPhoneRegex = /^(09|\+639)\d{9}$/;

    if (!contactNumber.trim()) {
      setError('Please provide your active mobile number.');
      return;
    }

    if (!phPhoneRegex.test(cleanedPhone)) {
      setError('Enter a valid Philippine mobile number (e.g., 09171234567 or +639171234567).');
      return;
    }

    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      setError('Please provide a valid active contact email address.');
      return;
    }

    if (!idFile || !propertyFile) {
      setError('Both a valid ID and a Property Permit / Ownership document are required.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('contactNumber', cleanedPhone);
      formData.append('contactEmail', contactEmail.trim().toLowerCase());
      formData.append('governmentIdType', 'Valid ID'); // Keeps backend Mongoose schema backward-compatible
      formData.append('idDocument', idFile);
      formData.append('ownershipDocument', propertyFile);

      await api.post('/auth/apply-landlord', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Apply as Landlord</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload verification documents for admin review</p>
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

        {/* Content Form */}
        <div className="p-5 overflow-y-auto flex-1">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3 animate-bounce" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Application Submitted!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                An administrator will review your documents. Your account will automatically unlock the Landlord Portal upon approval.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Notice Banner */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Please upload <strong>any valid government or institutional ID</strong>, along with your <strong>boarding house permit or barangay business clearance</strong> for accreditation.
                </span>
              </div>

              {/* Contact Number */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Active Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09171234567"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Active Contact Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. landlord@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* ID Upload */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
                  <span>Valid Government or Institutional ID</span>
                  <span className="text-rose-500">*</span>
                </label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 text-center bg-slate-50 dark:bg-slate-800/60 transition cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, setIdFile, 'Valid ID')}
                    className="hidden"
                  />
                  <UploadCloud className="w-5 h-5 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block truncate px-2">
                    {idFile ? idFile.name : 'Upload any valid ID (PhilSys, Driver License, Passport, School ID, etc.)'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">JPG, PNG, or PDF up to 5MB</span>
                </label>
              </div>

              {/* Ownership Document / Permit Upload */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
                  <span>Boarding House Permit / Clearance / Ownership Document</span>
                  <span className="text-rose-500">*</span>
                </label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 text-center bg-slate-50 dark:bg-slate-800/60 transition cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, setPropertyFile, 'Permit Document')}
                    className="hidden"
                  />
                  <Building className="w-5 h-5 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block truncate px-2">
                    {propertyFile ? propertyFile.name : 'Upload Business Permit, Barangay Clearance, or Tax Declaration'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">JPG, PNG, or PDF up to 5MB</span>
                </label>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Uploading Documents...' : 'Submit Documents for Verification'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}