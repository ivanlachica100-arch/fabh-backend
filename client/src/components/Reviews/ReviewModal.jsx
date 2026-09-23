import React, { useState } from 'react';
import api from '../../api/client';
import { Star, X, Loader2 } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, house, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen || !house) return null;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Calls backend Sprint 3 Review submission endpoint
      const res = await api.post(`/boarding-houses/${house._id}/reviews`, {
        rating,
        comment,
      });

      if (onReviewSubmitted) {
        onReviewSubmitted(res.data.data || res.data);
      }
      onClose();
      setComment('');
      setRating(5);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert(err.response?.data?.message || 'Failed to submit review. Ensure you are logged in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-900">
          Leave a Review
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {house.title || house.name}
        </p>

        <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
          {/* Star Rating Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Rating</label>
            <div className="flex items-center gap-1.5 mt-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:scale-110 transition"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-slate-500 font-medium ml-2">
                {hoverRating || rating} of 5 Stars
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Student Feedback</label>
            <textarea
              required
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How are the amenities, water supply, security, and curfew?"
              className="mt-1 w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}