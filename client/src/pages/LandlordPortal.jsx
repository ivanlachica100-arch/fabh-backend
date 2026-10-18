import React, { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { 
  Plus, 
  Home, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3,
  ArrowLeft, 
  Loader2, 
  MapPin, 
  LocateFixed, 
  AlertCircle,
  Image as ImageIcon,
  UploadCloud,
  Check,
  X
} from 'lucide-react';
import { DAGUPAN_CENTER } from '../constants/landmarks';
import { DAGUPAN_BARANGAYS } from '../constants/barangays';
import 'leaflet/dist/leaflet.css';

// Native browser HTML5 canvas image compressor
const compressImageFile = (file, maxWidth = 1280, maxHeight = 1280, quality = 0.78) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

// Auto-pans map whenever target coordinates update
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
      map.invalidateSize();
    }
  }, [center, map]);
  return null;
}

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
  const [compressing, setCompressing] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHouseId, setEditingHouseId] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [autoFilledStatus, setAutoFilledStatus] = useState('');
  
  // Toast Feedback State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  // Image Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Form Validation State
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
      showToast('Failed to load your registered listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetFormState = () => {
    setShowAddForm(false);
    setEditingHouseId(null);
    setFormData(initialFormState);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setErrors({});
    setSubmitError('');
    setAutoFilledStatus('');
  };

  const handleEditClick = (house) => {
    setEditingHouseId(house._id);
    setShowAddForm(true);
    setSubmitError('');
    setErrors({});

    const coords = house.location?.coordinates || [120.3380, 16.0430];
    const addr = house.address || {};
    const amenities = house.amenities || {};
    const contacts = house.contactChannels || {};

    setFormData({
      title: house.title || house.name || '',
      description: house.description || '',
      street: typeof addr === 'object' ? addr.street || '' : '',
      barangay: typeof addr === 'object' ? addr.barangay || 'Poblacion Oeste' : 'Poblacion Oeste',
      city: 'Dagupan City',
      monthlyRent: house.monthlyRent?.toString() || '',
      roomsAvailable: (house.roomsAvailable ?? 1).toString(),
      genderPreference: house.genderPreference || 'any',
      phoneNumber: contacts.phoneNumber || '',
      facebookUrl: contacts.facebookUrl || '',
      telegramUsername: contacts.telegramUsername || '',
      whatsappNumber: contacts.whatsappNumber || '',
      wifi: Boolean(amenities.wifi),
      aircon: Boolean(amenities.aircon),
      privateBathroom: Boolean(amenities.privateBathroom),
      kitchenAllowed: Boolean(amenities.kitchenAllowed),
      cctvSecurity: Boolean(amenities.cctvSecurity),
      lat: coords[1] || 16.0430,
      lng: coords[0] || 120.3380,
    });

    if (house.images && Array.isArray(house.images)) {
      setPreviewUrls(house.images);
    } else {
      setPreviewUrls([]);
    }
    setSelectedFiles([]);

    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setGettingLocation(true);
    setAutoFilledStatus('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (latitude < 15.7 || latitude > 16.4 || longitude < 119.7 || longitude > 120.9) {
          showToast('GPS coordinates are outside Dagupan. Tap map manually.', 'info');
        }

        setFormData((prev) => ({ ...prev, lat: latitude, lng: longitude }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          const data = await res.json();

          if (data && data.address) {
            const addr = data.address;
            const detectedStreet = 
              addr.road || 
              addr.pedestrian || 
              addr.street || 
              addr.residential || 
              addr.suburb || 
              '';

            const detectedCandidate = (
              addr.village || 
              addr.neighbourhood || 
              addr.quarter || 
              addr.suburb || 
              ''
            ).toLowerCase();

            const matchedBarangay = DAGUPAN_BARANGAYS.find((bg) =>
              detectedCandidate.includes(bg.toLowerCase())
            );

            setFormData((prev) => ({
              ...prev,
              street: detectedStreet || prev.street,
              barangay: matchedBarangay || prev.barangay,
            }));

            if (detectedStreet) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.street;
                return next;
              });
            }

            setAutoFilledStatus(detectedStreet ? 'Address & coordinates auto-filled!' : 'Location pinned on map!');
            setTimeout(() => setAutoFilledStatus(''), 4000);
          }
        } catch (geoErr) {
          console.warn('Reverse geocoding lookup failed:', geoErr);
          setAutoFilledStatus('Coordinates pinned!');
          setTimeout(() => setAutoFilledStatus(''), 3000);
        } finally {
          setGettingLocation(false);
        }
      },
      (err) => {
        console.error('GPS error:', err);
        showToast('Could not acquire GPS position. Tap the map to select manually.', 'error');
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
      showToast(`Property marked as ${updatedStatus ? 'Vacant / Available' : 'Fully Occupied'}.`, 'success');
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast('Could not update vacancy status.', 'error');
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
      showToast('Boarding house listing deleted successfully.', 'success');
    } catch (err) {
      console.error('Failed to delete:', err);
      showToast('Could not delete accommodation.', 'error');
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

  const handleImageSelect = async (e) => {
    const rawFiles = Array.from(e.target.files);
    if (selectedFiles.length + rawFiles.length > 5) {
      showToast('Maximum of 5 photos per accommodation allowed.', 'info');
      return;
    }

    setCompressing(true);
    try {
      const compressedFiles = await Promise.all(
        rawFiles.map((file) => compressImageFile(file))
      );

      const combined = [...selectedFiles, ...compressedFiles];
      setSelectedFiles(combined);

      const urls = combined.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    } catch (compressionErr) {
      console.error('Image compression error:', compressionErr);
      showToast('Failed to optimize some images. Please try again.', 'error');
    } finally {
      setCompressing(false);
    }
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

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingHouseId) {
        const updatePayload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          monthlyRent: Number(formData.monthlyRent),
          roomsAvailable: Number(formData.roomsAvailable),
          genderPreference: formData.genderPreference,
          lat: formData.lat,
          lng: formData.lng,
          address: {
            street: formData.street.trim(),
            barangay: formData.barangay.trim(),
            city: 'Dagupan City',
          },
          amenities: {
            wifi: Boolean(formData.wifi),
            aircon: Boolean(formData.aircon),
            privateBathroom: Boolean(formData.privateBathroom),
            kitchenAllowed: Boolean(formData.kitchenAllowed),
            cctvSecurity: Boolean(formData.cctvSecurity),
          },
          contactChannels: {
            phoneNumber: formData.phoneNumber.trim().replace(/[\s\-()]/g, ''),
            facebookUrl: formData.facebookUrl.trim(),
            telegramUsername: formData.telegramUsername.trim(),
            whatsappNumber: formData.whatsappNumber.trim(),
          },
        };

        const res = await api.put(`/boarding-houses/${editingHouseId}`, updatePayload);
        const updatedEntry = res.data.data || res.data;

        setMyListings((prev) =>
          prev.map((item) => (item._id === editingHouseId ? { ...item, ...updatedEntry } : item))
        );
        resetFormState();
        showToast('Accommodation updated successfully!', 'success');
      } else {
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

        for (const file of selectedFiles) {
          uploadData.append('images', file);
        }

        const res = await api.post('/boarding-houses', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const newEntry = res.data.data || res.data;
        setMyListings([newEntry, ...myListings]);
        resetFormState();
        showToast('Accommodation published successfully with optimized photos!', 'success');
      }
    } catch (err) {
      console.error('Submit listing error:', err);
      const msg = err.response?.data?.message || 'Server error while saving your listing.';
      setSubmitError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-100 dark:selection:bg-emerald-950/50 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors duration-200 relative">
      
      {/* Floating Modern Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold backdrop-blur-md ${
            toast.type === 'error'
              ? 'bg-rose-50/95 dark:bg-rose-950/90 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
              : toast.type === 'info'
              ? 'bg-blue-50/95 dark:bg-blue-950/90 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800'
              : 'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            ) : toast.type === 'info' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToExplore}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Back to Map Explorer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Landlord Management Portal</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage room vacancy and register student accommodations</p>
          </div>
        </div>

        <div className="w-72" />
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {showAddForm && (
          <div 
            ref={formTopRef} 
            className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 dark:border-emerald-500/50 rounded-2xl p-6 shadow-xl relative animate-in fade-in duration-200 transition-colors"
          >
            <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${editingHouseId ? 'bg-amber-500' : 'bg-emerald-600'}`} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {editingHouseId ? 'Edit Accommodation Details' : 'Register New Accommodation'}
                </h2>
              </div>
              <button
                type="button"
                onClick={resetFormState}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-semibold cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            </div>

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {Object.keys(errors).length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Please correct the highlighted fields below before saving.</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Property Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Tapuac Student Quarters"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-xs transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
                      errors.title 
                        ? 'border-rose-400 dark:border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-500' 
                        : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., #45 Arellano Street"
                    value={formData.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-xs transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
                      errors.street 
                        ? 'border-rose-400 dark:border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-500' 
                        : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {errors.street && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.street}
                    </p>
                  )}
                </div>

                {/* Barangay Dropdown */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Barangay ({DAGUPAN_BARANGAYS.length} Barangays) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.barangay}
                    onChange={(e) => handleChange('barangay', e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {DAGUPAN_BARANGAYS.map((brgy) => (
                      <option key={brgy} value={brgy}>
                        {brgy}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rent & Rooms */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Monthly Rent (₱) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 3000"
                      value={formData.monthlyRent}
                      onChange={(e) => handleChange('monthlyRent', e.target.value)}
                      className={`w-full border rounded-lg p-2.5 text-xs transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
                        errors.monthlyRent 
                          ? 'border-rose-400 dark:border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-500' 
                          : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                      }`}
                    />
                    {errors.monthlyRent && (
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-1">
                        {errors.monthlyRent}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Rooms Open <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.roomsAvailable}
                      onChange={(e) => handleChange('roomsAvailable', e.target.value)}
                      className={`w-full border rounded-lg p-2.5 text-xs transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
                        errors.roomsAvailable 
                          ? 'border-rose-400 dark:border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-500' 
                          : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                      }`}
                    />
                    {errors.roomsAvailable && (
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-1">
                        {errors.roomsAvailable}
                      </p>
                    )}
                  </div>
                </div>

                {/* Gender Preference */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Gender Preference
                  </label>
                  <select
                    value={formData.genderPreference}
                    onChange={(e) => handleChange('genderPreference', e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="any">Any (Co-ed)</option>
                    <option value="female">Female Only</option>
                    <option value="male">Male Only</option>
                  </select>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Primary Mobile / SMS <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="09171234567"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-xs transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
                      errors.phoneNumber 
                        ? 'border-rose-400 dark:border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-500' 
                        : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Photos Upload Zone */}
              {!editingHouseId && (
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 transition-colors">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Dorm Photos (Upload up to 5 photos)
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
                    Uploaded images will display directly on the student Explore view carousel.
                  </p>

                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 text-center bg-white dark:bg-slate-800 transition cursor-pointer relative group">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={compressing}
                      onChange={handleImageSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {compressing ? (
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mx-auto transition" />
                    )}
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
                      {compressing ? 'Optimizing & resizing images...' : 'Click to select dorm photos'}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {compressing ? 'Compressing high-res files before upload...' : 'JPG, PNG up to 5 photos (Auto-compressed)'}
                    </p>
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-750 group bg-slate-100 dark:bg-slate-800">
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
              )}

              {/* Facebook URL */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Facebook Profile / Messenger Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://facebook.com/yourprofile"
                  value={formData.facebookUrl}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-xs transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
                    errors.facebookUrl 
                      ? 'border-rose-400 dark:border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-500' 
                      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
                {errors.facebookUrl && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
                    {errors.facebookUrl}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Property Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="2"
                  placeholder="Describe proximity to universities, curfew rules, study spaces, inclusions..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-xs transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
                    errors.description 
                      ? 'border-rose-400 dark:border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-500' 
                      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
                {errors.description && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Amenities */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Included Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                  {[
                    { key: 'wifi', label: 'High-speed Wi-Fi' },
                    { key: 'aircon', label: 'Air Conditioning' },
                    { key: 'privateBathroom', label: 'Private Bathroom' },
                    { key: 'kitchenAllowed', label: 'Cooking Allowed' },
                    { key: 'cctvSecurity', label: '24/7 CCTV Security' },
                  ].map((amenity) => (
                    <label key={amenity.key} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
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

              {/* Map Coordinate Picker with Auto-Centering Controller */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Geospatial Pin (Required for Distance Engine)
                  </label>

                  <div className="flex items-center gap-2">
                    {autoFilledStatus && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                        <Check className="w-3 h-3" />
                        {autoFilledStatus}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={gettingLocation}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      {gettingLocation ? (
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <LocateFixed className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      )}
                      {gettingLocation ? 'Acquiring GPS & Address...' : 'Auto-Pin My Current Location'}
                    </button>
                  </div>
                </div>

                <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 relative z-0">
                  <MapContainer center={[formData.lat, formData.lng]} zoom={15} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapController center={[formData.lat, formData.lng]} />
                    <LocationPicker
                      position={[formData.lat, formData.lng]}
                      onPositionChange={(lat, lng) => setFormData((prev) => ({ ...prev, lat, lng }))}
                    />
                  </MapContainer>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Pinned Location: {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)} (Tap map to reposition)
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={resetFormState}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || compressing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting 
                    ? (editingHouseId ? 'Saving Changes...' : 'Uploading & Registering...') 
                    : (editingHouseId ? 'Save Changes' : 'Publish Accommodation')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Properties Managed */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Your Registered Properties ({myListings.length})
            </h2>
            {!showAddForm && (
              <button
                type="button"
                onClick={() => {
                  setEditingHouseId(null);
                  setFormData(initialFormState);
                  setShowAddForm(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Dorm
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-medium">Fetching registered accommodations...</p>
            </div>
          ) : myListings.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 transition-colors">
              <Home className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <h3 className="text-sm text-slate-800 dark:text-white font-bold">No properties listed yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
                Publish your boarding house so students can discover it through the search and transit engine[cite: 2].
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
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate flex-1">
                        {house.title || house.name}
                      </h3>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEditClick(house)}
                          className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                          title="Edit listing details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteListing(house._id)}
                          disabled={deletingId === house._id}
                          className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Delete listing"
                        >
                          {deletingId === house._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {typeof house.address === 'object'
                        ? `${house.address.street}, ${house.address.barangay}`
                        : house.address}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                        ₱{house.monthlyRent?.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">/ mo</span>
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
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
                              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded font-medium"
                            >
                              {key}
                            </span>
                          ))
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Standard Amenities</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Vacancy State</span>
                    <button
                      type="button"
                      disabled={togglingId === house._id}
                      onClick={() => handleToggleAvailability(house)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                        house.isAvailable
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {togglingId === house._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : house.isAvailable ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
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