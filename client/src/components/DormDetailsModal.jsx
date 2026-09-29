import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  X, ChevronLeft, ChevronRight, Phone, MessageSquare, 
  Send, ExternalLink, MapPin, ShieldCheck, Star, 
  Loader2, MessageCircle, UserCheck 
} from 'lucide-react';

export default function DormDetailsModal({ isOpen, onClose, house, selectedCampus }) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  const houseId = house?._id || house?.id;

  // Fetch verified community reviews whenever this modal opens with a valid house
  useEffect(() => {
    if (!isOpen || !houseId) {
      setReviews([]);
      setReviewsError('');
      return;
    }

    const fetchCommunityReviews = async () => {
      setLoadingReviews(true);
      setReviewsError('');
      try {
        const res = await api.get(`/boarding-houses/${houseId}/reviews`);
        if (res.data.success && Array.isArray(res.data.data)) {
          setReviews(res.data.data);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error('Error fetching dorm reviews:', err);
        setReviewsError('Could not load student reviews at this time.');
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchCommunityReviews();
  }, [isOpen, houseId]);

  if (!isOpen || !house) return null;

  const images = house.images && house.images.length > 0 
    ? house.images 
    : [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'
      ];

  const contact = house.contactChannels || {};
  const phone = contact.phoneNumber || '09171234567';
  const fbUrl = contact.facebookUrl || 'https://facebook.com';
  const telegram = contact.telegramUsername;
  const whatsapp = contact.whatsappNumber;

  const houseTitle = house.title || house.name;
  const distance = house.distanceToCampusInMeters ?? house.distance;
  const campusName = selectedCampus?.name ? selectedCampus.name.split(' ')[0] : 'Campus';

  // Calculate live average star score from fetched reviews
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length).toFixed(1)
    : (house.rating ? Number(house.rating).toFixed(1) : null);

  const prefilledSms = encodeURIComponent(
    `Hello! I saw your listing "${houseTitle}" on FABH. Is there an available slot, and when can I visit for a viewing?`
  );

  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 dark:bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 my-auto transition-colors">
        
        {/* Photo Gallery Header */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900">
          <img
            src={images[currentImageIdx]}
            alt={houseTitle}
            className="w-full h-full object-cover"
          />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-2 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium rounded-full">
                {currentImageIdx + 1} / {images.length}
              </div>
            </>
          )}

          <div className="absolute bottom-2 left-3 px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
            ₱{house.monthlyRent?.toLocaleString()} / month
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{houseTitle}</h2>
              <div className="flex items-center gap-1.5 shrink-0">
                {averageRating && (
                  <span className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {averageRating}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {distance !== undefined ? `${Math.round(distance)}m from ${campusName} • ` : ''}
                {typeof house.address === 'object' 
                  ? `${house.address.street}, ${house.address.barangay}, Dagupan City` 
                  : house.address}
              </span>
            </p>
          </div>

          {/* Description */}
          {house.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              {house.description}
            </p>
          )}

          {/* Contact Landlord Hub */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Contact Landlord Directly
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              
              {/* Facebook / Messenger */}
              <a
                href={fbUrl.startsWith('http') ? fbUrl : `https://${fbUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-xl transition group text-blue-800 dark:text-blue-300"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    f
                  </span>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold">Facebook</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Chat via Messenger</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </a>

              {/* Direct Call */}
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl transition text-emerald-800 dark:text-emerald-300"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Phone className="w-3 h-3" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold">Call Landlord</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{phone}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Dial &rarr;</span>
              </a>

              {/* SMS Text */}
              <a
                href={`sms:${phone}?body=${prefilledSms}`}
                className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 dark:bg-slate-600 text-white flex items-center justify-center">
                    <MessageSquare className="w-3 h-3" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold">Send SMS</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Inquiry Template</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Text &rarr;</span>
              </a>

              {/* Telegram (Optional) */}
              {telegram && (
                <a
                  href={`https://t.me/${telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/30 dark:hover:bg-sky-950/50 border border-sky-200 dark:border-sky-900 rounded-xl transition text-sky-800 dark:text-sky-300"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center">
                      <Send className="w-3 h-3" />
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-xs font-bold">Telegram</p>
                      <p className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">@{telegram.replace('@', '')}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </a>
              )}

              {/* WhatsApp (Optional) */}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50 border border-green-200 dark:border-green-900 rounded-xl transition text-green-800 dark:text-green-300"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs">
                      W
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-xs font-bold">WhatsApp</p>
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">{whatsapp}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                </a>
              )}
            </div>
          </div>

          {/* Student Community Reviews Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Student Reviews ({reviews.length})
              </h3>
              {averageRating && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Rating: <strong className="text-slate-800 dark:text-slate-200">{averageRating}</strong> / 5.0
                </span>
              )}
            </div>

            {loadingReviews ? (
              <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <p className="text-xs">Loading verified student reviews...</p>
              </div>
            ) : reviewsError ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
                {reviewsError}
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No student reviews yet for this boarding house.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Verified Dagupan students who book or visit can be the first to rate!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reviews.map((rev) => {
                  const studentName = rev.student?.name || 'Verified Dagupan Student';
                  const reviewDate = rev.createdAt 
                    ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <div 
                      key={rev._id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {studentName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {reviewDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {renderStars(rev.rating || 5)}
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {rev.rating ? `${rev.rating}.0` : ''}
                        </span>
                      </div>

                      {rev.comment && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}