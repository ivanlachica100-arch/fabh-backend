import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  ShieldCheck, 
  Loader2, 
  Phone, 
  Award, 
  AlertCircle, 
  UploadCloud, 
  FileCheck 
} from 'lucide-react';

export default function ApplyLandlordModal({ isOpen, onClose }) {
  const { applyLandlord } = useAuth();
  const [formData, setFormData] = useState({
    contactNumber: '',
    governmentIdType: 'UMID',
  });

  // Files & Preview State
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);

  const [propertyFile, setPropertyFile] = useState(null);
  const [propertyPreview, setPropertyPreview] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  if (!isOpen) return null;

  const handleIdFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
      setIdPreview(URL.createObjectURL(file));
      if (fieldErrors.idFile) {
        setFieldErrors((prev) => ({ ...prev, idFile: null }));
      }
    }
  };

  const handlePropertyFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPropertyFile(file);
      setPropertyPreview(URL.createObjectURL(file));
      if (fieldErrors.propertyFile) {
        setFieldErrors((prev) => ({ ...prev, propertyFile: null }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedPhone = formData.contactNumber.trim();
    const phoneRegex = /^(09|\+639)\d{9}$/;

    if (!trimmedPhone) {
      errors.contactNumber = 'Contact number is required.';
    } else if (!phoneRegex.test(trimmedPhone)) {
      errors.contactNumber = 'Enter a valid Philippine mobile number (e.g., 09171234567).';
    }

    if (!idFile) {
      errors.idFile = 'Please upload a photo of your Government ID.';
    }

    if (!propertyFile) {
      errors.propertyFile = 'Please upload proof of property ownership (Tax Dec or Business Permit).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('contactNumber', formData.contactNumber.trim());
      uploadData.append('governmentIdType', formData.governmentIdType);
      uploadData.append('idDocument', idFile);
      uploadData.append('ownershipDocument', propertyFile);

      const res = await applyLandlord(uploadData);
      setSubmittedMessage(
        res.message || 'Application submitted! An admin will review and verify your property documents.'
      );
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to submit landlord verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setFieldErrors({});
    setServerError('');
    setSubmittedMessage('');
    setIdFile(null);
    setIdPreview(null);
    setPropertyFile(null);
    setPropertyPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleModalClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedMessage ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Application Received</h3>
            <p className="text-xs text-slate-600 px-4 leading-relaxed">
              {submittedMessage}
            </p>
            <button
              type="button"
              onClick={handleModalClose}
              className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-emerald-600">
              <Award className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Apply as Landlord</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Upload photos of your government-issued ID and property document for admin verification.
            </p>

            {serverError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {/* Contact Number */}
              <div>
                <label className="text-xs font-semibold text-slate-700">Contact Number</label>
                <div className="relative mt-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="09171234567"
                    value={formData.contactNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, contactNumber: e.target.value });
                      if (fieldErrors.contactNumber) {
                        setFieldErrors((prev) => ({ ...prev, contactNumber: null }));
                      }
                    }}
                    className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      fieldErrors.contactNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {fieldErrors.contactNumber && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.contactNumber}</p>
                )}
              </div>

              {/* ID Type */}
              <div>
                <label className="text-xs font-semibold text-slate-700">Government ID Type</label>
                <select
                  value={formData.governmentIdType}
                  onChange={(e) => setFormData({ ...formData, governmentIdType: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="UMID">UMID / SSS</option>
                  <option value="National ID">PhilSys National ID</option>
                  <option value="Drivers License">Driver's License</option>
                  <option value="Barangay Clearance">Barangay Clearance</option>
                  <option value="Passport">Philippine Passport</option>
                </select>
              </div>

              {/* Physical File Upload: Valid ID */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Upload Valid ID Photo
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 text-center bg-slate-50 transition relative group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIdFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {idPreview ? (
                    <div className="flex items-center gap-3 text-left">
                      <img src={idPreview} alt="ID Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{idFile?.name}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <FileCheck className="w-3 h-3" /> Ready for upload (Tap to change)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mx-auto transition" />
                      <p className="text-xs font-semibold text-slate-700 mt-1">Select or drag ID photo</p>
                      <p className="text-[10px] text-slate-400">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>
                {fieldErrors.idFile && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.idFile}</p>
                )}
              </div>

              {/* Physical File Upload: Property Ownership Document */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Upload Property Ownership Document / Permit
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 text-center bg-slate-50 transition relative group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePropertyFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {propertyPreview ? (
                    <div className="flex items-center gap-3 text-left">
                      <img src={propertyPreview} alt="Property Doc Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{propertyFile?.name}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <FileCheck className="w-3 h-3" /> Ready for upload (Tap to change)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mx-auto transition" />
                      <p className="text-xs font-semibold text-slate-700 mt-1">Select or drag Tax Dec, Permit, or Title</p>
                      <p className="text-[10px] text-slate-400">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>
                {fieldErrors.propertyFile && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.propertyFile}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit Documents for Verification
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}