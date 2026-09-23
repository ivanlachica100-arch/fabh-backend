import React, { useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Phone, MessageSquare, 
  Send, ExternalLink, MapPin, CheckCircle2, ShieldCheck 
} from 'lucide-react';

export default function DormDetailsModal({ isOpen, onClose, house, selectedCampus }) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

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

  const prefilledSms = encodeURIComponent(
    `Hello! I saw your listing "${houseTitle}" on FABH. Is there an available slot, and when can I visit for a viewing?`
  );

  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 my-auto">
        
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
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{houseTitle}</h2>
              <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
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
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {house.description}
            </p>
          )}

          {/* Contact Landlord Hub */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Contact Landlord Directly
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              
              {/* Facebook / Messenger */}
              <a
                href={fbUrl.startsWith('http') ? fbUrl : `https://${fbUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl transition group text-blue-800"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    f
                  </span>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold">Facebook</p>
                    <p className="text-[10px] text-blue-600 font-medium">Chat via Messenger</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              </a>

              {/* Direct Call */}
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition text-emerald-800"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Phone className="w-3 h-3" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold">Call Landlord</p>
                    <p className="text-[10px] text-emerald-600 font-medium">{phone}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600">Dial &rarr;</span>
              </a>

              {/* SMS Text */}
              <a
                href={`sms:${phone}?body=${prefilledSms}`}
                className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center">
                    <MessageSquare className="w-3 h-3" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold">Send SMS</p>
                    <p className="text-[10px] text-slate-500 font-medium">Inquiry Template</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600">Text &rarr;</span>
              </a>

              {/* Telegram (Optional) */}
              {telegram && (
                <a
                  href={`https://t.me/${telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition text-sky-800"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center">
                      <Send className="w-3 h-3" />
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-xs font-bold">Telegram</p>
                      <p className="text-[10px] text-sky-600 font-medium">@{telegram.replace('@', '')}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                </a>
              )}

              {/* WhatsApp (Optional) */}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition text-green-800"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs">
                      W
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-xs font-bold">WhatsApp</p>
                      <p className="text-[10px] text-green-600 font-medium">{whatsapp}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-green-600" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}