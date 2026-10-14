import React, { useState } from 'react';
import api from '../api/client';
import { 
  X, 
  Sparkles, 
  Scale, 
  DollarSign, 
  Footprints, 
  Award,
  Loader2,
  AlertCircle,
  Trophy,
  MapPin,
  Star,
  CheckCircle2
} from 'lucide-react';

const PRIORITY_WEIGHTS = {
  balanced: [0.25, 0.25, 0.25, 0.25],
  budget: [0.45, 0.20, 0.15, 0.20],
  distance: [0.15, 0.50, 0.15, 0.20],
  quality: [0.15, 0.15, 0.40, 0.30],
};

export default function CompareDrawer({ isOpen, onClose, selectedHouses, selectedCampus }) {
  const [priority, setPriority] = useState('balanced');
  const [targetBudget, setTargetBudget] = useState('');
  const [computing, setComputing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCompute = async () => {
    if (!selectedHouses || selectedHouses.length < 2) {
      setError('Please select at least 2 boarding houses to run TOPSIS decision ranking.');
      return;
    }

    setComputing(true);
    setError('');
    try {
      const res = await api.post('/boarding-houses/compare', {
        houseIds: selectedHouses.map((h) => h._id || h.id),
        campus: selectedCampus?.code || 'UPANG',
        weights: PRIORITY_WEIGHTS[priority] || [0.25, 0.25, 0.25, 0.25],
        maxBudget: targetBudget ? Number(targetBudget) : undefined,
      });

      if (res.data.success) {
        setResults(res.data);
      } else {
        setError(res.data.message || 'Comparison failed.');
      }
    } catch (err) {
      console.error('TOPSIS computation error:', err);
      setError(err.response?.data?.message || 'Could not complete quantitative TOPSIS ranking.');
    } finally {
      setComputing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1050] flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl z-10 flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200 transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Compare with AI (TOPSIS)</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Algorithmic Multi-Criteria Decision Analysis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-white dark:bg-slate-900">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Selected Properties Counter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Selected Accommodations ({selectedHouses?.length || 0}/4)
              </span>
            </div>

            {(!selectedHouses || selectedHouses.length === 0) ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-center text-xs text-slate-500 dark:text-slate-400">
                Check boxes on boarding houses from the map explorer to add them to your comparison pool.
              </div>
            ) : (
              <div className="space-y-1.5">
                {selectedHouses.map((house) => (
                  <div 
                    key={house._id || house.id} 
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold truncate max-w-[240px] text-slate-800 dark:text-slate-200">
                      {house.title || house.name}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      ₱{house.monthlyRent?.toLocaleString()}/mo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Target Monthly Budget Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Target Monthly Budget (Optional)
            </label>
            <input
              type="number"
              placeholder="e.g. 3500 (Penalizes options above this amount)"
              value={targetBudget}
              onChange={(e) => setTargetBudget(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Quick set:</span>
              {[2500, 3500, 5000, 7000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTargetBudget(String(amt))}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  ₱{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Living Priorities Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Choose What Matters Most To You
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'balanced', label: 'Balanced', desc: 'Equal weighting across price, distance, rating', icon: Scale },
                { id: 'budget', label: 'Budget First', desc: 'Prioritizes lowest monthly rental costs', icon: DollarSign },
                { id: 'distance', label: 'Walking Distance', desc: 'Prioritizes closest proximity to campus', icon: Footprints },
                { id: 'quality', label: 'Quality & Comfort', desc: 'Prioritizes reviews and amenities', icon: Award },
              ].map((item) => {
                const IconComponent = item.icon;
                const isSelected = priority === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPriority(item.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500/50'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className={`text-xs font-bold ${isSelected ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TOPSIS Results Display */}
          {results && Array.isArray(results.data) && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Quantitative TOPSIS Rankings
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {results.campus || 'Selected Campus'}
                </span>
              </div>

              {results.recommendation && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{results.recommendation}</span>
                </div>
              )}

              <div className="space-y-2.5">
                {results.data.map((ranked, idx) => {
                  const isTop = idx === 0;
                  return (
                    <div 
                      key={ranked.houseId || idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isTop 
                          ? 'border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/20' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                            isTop 
                              ? 'bg-emerald-600 text-white shadow-xs' 
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            #{ranked.rank || idx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                              {ranked.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                Closeness: {(ranked.topsisScore * 100).toFixed(1)}%
                              </span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                Rent: ₱{ranked.monthlyRent?.toLocaleString()}/mo
                              </span>
                            </div>
                          </div>
                        </div>

                        {ranked.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            isTop 
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                          }`}>
                            {ranked.badge}
                          </span>
                        )}
                      </div>

                      {ranked.rationale && (
                        <p className="mt-2 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-750">
                          {ranked.rationale}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {ranked.distanceToCampusInMeters}m walk
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {ranked.averageRating > 0 ? `${ranked.averageRating}★` : 'Unrated'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {ranked.amenitiesCount} amenities
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            disabled={computing || !selectedHouses || selectedHouses.length < 2}
            onClick={handleCompute}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            {computing && <Loader2 className="w-4 h-4 animate-spin" />}
            {computing ? 'Running TOPSIS Algorithm...' : 'Compute Best Match with AI'}
          </button>
        </div>

      </div>
    </div>
  );
}