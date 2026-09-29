import React, { useState } from 'react';
import api from '../../api/client';
import { Star, X, AlertCircle, Loader2 } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, house, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !house) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('Please provide feedback about your accommodation experience.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/boarding-houses/${house._id}/reviews`, {
        rating,
        comment: comment.trim()
      });
      setComment('');
      setRating(5);
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Leave a Review</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[260px]">
              {house.title || house.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">
                {rating} of 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Student Feedback
            </label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What was your experience with rent value, landlord, security, water supply, or Wi-Fi?"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}