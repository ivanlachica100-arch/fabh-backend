import React, { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { 
  Plus, 
  Home, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  LocateFixed, 
  AlertCircle,
  Image as ImageIcon,
  UploadCloud
} from 'lucide-react';
import { DAGUPAN_CENTER } from '../constants/landmarks';
import 'leaflet/dist/leaflet.css';

function LocationPicker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LandlordPortal({ onBackToExplore }) {
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Image Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Field-level error validation state
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const formTopRef = useRef(null);

  const initialFormState = {
    title: '',
    description: '',
    street: '',
    barangay: 'Poblacion Oeste',
    city: 'Dagupan City',
    monthlyRent: '',
    roomsAvailable: '1',
    genderPreference: 'any',
    phoneNumber: '',
    facebookUrl: '',
    telegramUsername: '',
    whatsappNumber: '',
    wifi: true,
    aircon: false,
    privateBathroom: false,
    kitchenAllowed: true,
    cctvSecurity: true,
    lat: 16.0430,
    lng: 120.3380,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/boarding-houses/my-listings');
      setMyListings(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (latitude < 15.7 || latitude > 16.4 || longitude < 119.7 || longitude > 120.9) {
          alert('GPS detected coordinates outside Dagupan/Pangasinan. Please pin manually.');
        }
        setFormData((prev) => ({ ...prev, lat: latitude, lng: longitude }));
        setGettingLocation(false);
      },
      (err) => {
        console.error('GPS error:', err);
        alert('Could not acquire GPS position. Tap the map to select manually.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleToggleAvailability = async (house) => {
    if (togglingId) return;
    setTogglingId(house._id);
    try {
      const updatedStatus = !house.isAvailable;
      await api.put(`/boarding-houses/${house._id}`, { isAvailable: updatedStatus });
      setMyListings((prev) =>
        prev.map((item) => (item._id === house._id ? { ...item, isAvailable: updatedStatus } : item))
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Could not update vacancy status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteListing = async (houseId) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    setDeletingId(houseId);
    try {
      await api.delete(`/boarding-houses/${houseId}`);
      setMyListings((prev) => prev.filter((item) => item._id !== houseId));
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Could not delete listing.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      alert('You can upload a maximum of 5 photos per accommodation.');
      return;
    }
    const combined = [...selectedFiles, ...files];
    setSelectedFiles(combined);

    const urls = combined.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedFiles.map((file) => URL.createObjectURL(file)));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Listing title is required.';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required.';
    }

    const rent = Number(formData.monthlyRent);
    if (!formData.monthlyRent || isNaN(rent)) {
      newErrors.monthlyRent = 'Monthly rent is required.';
    } else if (rent < 500 || rent > 50000) {
      newErrors.monthlyRent = 'Rent must be between ₱500 and ₱50,000.';
    }

    const rooms = Number(formData.roomsAvailable);
    if (!formData.roomsAvailable || isNaN(rooms)) {
      newErrors.roomsAvailable = 'Rooms count is required.';
    } else if (rooms < 1 || rooms > 100) {
      newErrors.roomsAvailable = 'Must have at least 1 room available.';
    }

    const cleanedPhone = formData.phoneNumber.replace(/[\s\-()]/g, '');
    const phPhoneRegex = /^(09|\+639)\d{9}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Contact number is required for students to reach you.';
    } else if (!phPhoneRegex.test(cleanedPhone)) {
      newErrors.phoneNumber = 'Enter a valid PH mobile number (e.g., 09171234567 or +639171234567).';
    }

    if (formData.facebookUrl.trim()) {
      const fb = formData.facebookUrl.trim().toLowerCase();
      if (!fb.includes('facebook.com') && !fb.includes('fb.me') && !fb.includes('m.me')) {
        newErrors.facebookUrl = 'Enter a valid Facebook URL (e.g., https://facebook.com/username).';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Property description is required.';
    } else if (formData.description.trim().length < 15) {
      newErrors.description = 'Provide at least 15 characters to explain your property rules & inclusions.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }

    return true;
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title.trim());
      uploadData.append('description', formData.description.trim());
      uploadData.append('street', formData.street.trim());
      uploadData.append('barangay', formData.barangay.trim());
      uploadData.append('monthlyRent', formData.monthlyRent);
      uploadData.append('roomsAvailable', formData.roomsAvailable);
      uploadData.append('genderPreference', formData.genderPreference);
      uploadData.append('phoneNumber', formData.phoneNumber.trim().replace(/[\s\-()]/g, ''));
      uploadData.append('facebookUrl', formData.facebookUrl.trim());
      uploadData.append('lat', formData.lat);
      uploadData.append('lng', formData.lng);

      uploadData.append(
        'amenities',
        JSON.stringify({
          wifi: Boolean(formData.wifi),
          aircon: Boolean(formData.aircon),
          privateBathroom: Boolean(formData.privateBathroom),
          kitchenAllowed: Boolean(formData.kitchenAllowed),
          cctvSecurity: Boolean(formData.cctvSecurity),
        })
      );

      selectedFiles.forEach((file) => {
        uploadData.append('images', file);
      });

      const res = await api.post('/boarding-houses', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newEntry = res.data.data || res.data;
      setMyListings([newEntry, ...myListings]);
      setShowAddForm(false);
      setFormData(initialFormState);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setErrors({});
      alert('Boarding house published successfully with photos!');
    } catch (err) {
      console.error('Create listing error:', err);
      setSubmitError(err.response?.data?.message || 'Server error while saving your listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToExplore}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Back to Map Explorer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Landlord Management Portal</h1>
            <p className="text-[11px] text-slate-500">Manage room vacancy and register student accommodations</p>
          </div>
        </div>

        <div className="w-72" />
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Registration Modal */}
        {showAddForm && (
          <div 
            ref={formTopRef} 
            className="bg-white border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl relative animate-in fade-in duration-200"
          >
            <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Register New Accommodation
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setErrors({});
                  setSubmitError('');
                  setSelectedFiles([]);
                  setPreviewUrls([]);
                }}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {Object.keys(errors).length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Please correct the highlighted fields below before publishing.</span>
              </div>
            )}

            <form onSubmit={handleCreateListing} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Property Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Tapuac Student Quarters"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-xs transition focus:outline-none ${
                      errors.title 
                        ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500' 
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., #45 Arellano Street"
                    value={formData.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-xs transition focus:outline-none ${
                      errors.street 
                        ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500' 
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {errors.street && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.street}
                    </p>
                  )}
                </div>

                {/* Barangay */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Barangay <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.barangay}
                    onChange={(e) => handleChange('barangay', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Poblacion Oeste">Poblacion Oeste</option>
                    <option value="Tapuac">Tapuac</option>
                    <option value="Malued">Malued</option>
                    <option value="Lucao">Lucao</option>
                    <option value="Pantol">Pantol</option>
                    <option value="Downtown">Downtown</option>
                    <option value="Mayombo">Mayombo</option>
                    <option value="Herrero-Perez">Herrero-Perez</option>
                  </select>
                </div>

                {/* Rent & Rooms */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Monthly Rent (₱) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 3000"
                      value={formData.monthlyRent}
                      onChange={(e) => handleChange('monthlyRent', e.target.value)}
                      className={`w-full border rounded-lg p-2.5 text-xs transition focus:outline-none ${
                        errors.monthlyRent 
                          ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500' 
                          : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                      }`}
                    />
                    {errors.monthlyRent && (
                      <p className="text-[10px] text-rose-600 font-medium mt-1">
                        {errors.monthlyRent}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Rooms Open <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.roomsAvailable}
                      onChange={(e) => handleChange('roomsAvailable', e.target.value)}
                      className={`w-full border rounded-lg p-2.5 text-xs transition focus:outline-none ${
                        errors.roomsAvailable 
                          ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500' 
                          : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                      }`}
                    />
                    {errors.roomsAvailable && (
                      <p className="text-[10px] text-rose-600 font-medium mt-1">
                        {errors.roomsAvailable}
                      </p>
                    )}
                  </div>
                </div>

                {/* Gender Preference */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Gender Preference
                  </label>
                  <select
                    value={formData.genderPreference}
                    onChange={(e) => handleChange('genderPreference', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="any">Any (Co-ed)</option>
                    <option value="female">Female Only</option>
                    <option value="male">Male Only</option>
                  </select>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Primary Mobile / SMS <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="09171234567"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-xs transition focus:outline-none ${
                      errors.phoneNumber 
                        ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500' 
                        : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Photos Upload Zone */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Dorm Photos (Upload up to 5 photos)
                </label>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Uploaded images will display directly on the student Explore view carousel.
                </p>

                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center bg-white transition cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mx-auto transition" />
                  <p className="text-xs font-semibold text-slate-700 mt-1">
                    Click to select dorm photos
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG up to 5MB each (Max 5)</p>
                </div>

                {/* Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-slate-100">
                        <img src={url} alt={`preview-${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full p-0.5 transition cursor-pointer"
                          title="Remove image"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Facebook URL */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Facebook Profile / Messenger Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://facebook.com/yourprofile"
                  value={formData.facebookUrl}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-xs transition focus:outline-none ${
                    errors.facebookUrl 
                      ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500' 
                      : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
                {errors.facebookUrl && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.facebookUrl}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Property Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="2"
                  placeholder="Describe proximity to UPang/UC/PSU, curfew rules, study spaces, inclusions..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-xs transition focus:outline-none ${
                    errors.description 
                      ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500' 
                      : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
                {errors.description && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Amenities */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Included Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {[
                    { key: 'wifi', label: 'High-speed Wi-Fi' },
                    { key: 'aircon', label: 'Air Conditioning' },
                    { key: 'privateBathroom', label: 'Private Bathroom' },
                    { key: 'kitchenAllowed', label: 'Cooking Allowed' },
                    { key: 'cctvSecurity', label: '24/7 CCTV Security' },
                  ].map((amenity) => (
                    <label key={amenity.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[amenity.key]}
                        onChange={(e) => handleChange(amenity.key, e.target.checked)}
                        className="rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                      />
                      <span>{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Map Coordinate Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Geospatial Pin (Required for Distance Engine)
                  </label>

                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={gettingLocation}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    {gettingLocation ? (
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                    ) : (
                      <LocateFixed className="w-3 h-3 text-emerald-600" />
                    )}
                    {gettingLocation ? 'Acquiring GPS...' : 'Auto-Pin My Current Location'}
                  </button>
                </div>

                <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-300 relative z-0">
                  <MapContainer center={DAGUPAN_CENTER} zoom={15} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker
                      position={[formData.lat, formData.lng]}
                      onPositionChange={(lat, lng) => setFormData((prev) => ({ ...prev, lat, lng }))}
                    />
                  </MapContainer>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pinned Location: {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)} (Tap map to reposition)
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setErrors({});
                    setSelectedFiles([]);
                    setPreviewUrls([]);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Uploading & Registering...' : 'Publish Accommodation'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Properties Managed */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Your Registered Properties ({myListings.length})
            </h2>
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Dorm
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs font-medium">Fetching registered accommodations...</p>
            </div>
          ) : myListings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <Home className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm text-slate-800 font-bold">No properties listed yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">
                Publish your boarding house so UPang, UC, PSU, and DCU students can discover it through the search and transit engine.
              </p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Register First Property
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map((house) => (
                <div
                  key={house._id}
                  className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-900 text-xs truncate flex-1">
                        {house.title || house.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleDeleteListing(house._id)}
                        disabled={deletingId === house._id}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer shrink-0"
                        title="Delete listing"
                      >
                        {deletingId === house._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {typeof house.address === 'object'
                        ? `${house.address.street}, ${house.address.barangay}`
                        : house.address}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
                      <span className="font-extrabold text-emerald-700">
                        ₱{house.monthlyRent?.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-slate-400">/ mo</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {house.roomsAvailable ?? 1} {house.roomsAvailable === 1 ? 'room' : 'rooms'} open
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {house.amenities && typeof house.amenities === 'object' && !Array.isArray(house.amenities) ? (
                        Object.entries(house.amenities)
                          .filter(([_, val]) => Boolean(val))
                          .map(([key]) => (
                            <span
                              key={key}
                              className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium"
                            >
                              {key}
                            </span>
                          ))
                      ) : (
                        <span className="text-[10px] text-slate-400">Standard Amenities</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">Vacancy State</span>
                    <button
                      type="button"
                      disabled={togglingId === house._id}
                      onClick={() => handleToggleAvailability(house)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                        house.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      {togglingId === house._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : house.isAvailable ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{house.isAvailable ? 'Vacant / Available' : 'Fully Occupied'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}