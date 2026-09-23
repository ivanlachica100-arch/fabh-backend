import React from 'react';
import { X, Bookmark, MapPin, Eye, Trash2 } from 'lucide-react';

export default function StudentBookmarksDrawer({
  isOpen,
  onClose,
  savedHouses = [],
  onRemoveBookmark,
  onViewDetails,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Bookmark className="w-4 h-4 fill-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Saved Accommodations</h2>
              <p className="text-xs text-slate-500">{savedHouses.length} bookmarks stored</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedHouses.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No saved dorms yet</p>
              <p className="text-xs text-slate-400 px-8">
                Click the bookmark ribbon on any listing card to save it here for quick access.
              </p>
            </div>
          ) : (
            savedHouses.map((house) => (
              <div
                key={house._id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-sm truncate max-w-[240px]">
                    {house.title || house.name}
                  </h3>
                  <span className="text-xs font-bold text-emerald-600">
                    ₱{house.monthlyRent?.toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {typeof house.address === 'object'
                      ? `${house.address.street}, ${house.address.barangay}`
                      : house.address}
                  </span>
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onViewDetails(house)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect & Contact
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveBookmark(house._id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}