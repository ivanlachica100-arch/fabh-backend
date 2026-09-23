import React, { useState } from 'react';
import api from '../api/client';
import { X, CheckCircle2, ChevronRight, Loader2, Sparkles, AlertCircle, PhilippinePeso } from 'lucide-react';

const PRESETS = [
  {
    id: 'balanced',
    name: '⚖️ Balanced',
    desc: 'Equal priority across price, distance, and rating',
    weights: { price: 0.25, distance: 0.25, rating: 0.25, amenities: 0.25 },
  },
  {
    id: 'budget',
    name: '💰 Budget First',
    desc: 'Prioritizes lowest monthly rental costs',
    weights: { price: 0.50, distance: 0.20, rating: 0.15, amenities: 0.15 },
  },
  {
    id: 'proximity',
    name: '🚶 Walking Distance',
    desc: 'Prioritizes closest proximity to campus',
    weights: { price: 0.20, distance: 0.50, rating: 0.15, amenities: 0.15 },
  },
  {
    id: 'comfort',
    name: '⭐ Quality & Comfort',
    desc: 'Prioritizes reviews, amenities, and room quality',
    weights: { price: 0.15, distance: 0.15, rating: 0.35, amenities: 0.35 },
  },
];

const BUDGET_QUICK_PICKS = [2500, 3500, 5000, 7000];

export default function CompareDrawer({ isOpen, onClose, selectedHouses = [] }) {
  const [loading, setLoading] = useState(false);
  const [topsisResults, setTopsisResults] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].id);
  const [activeWeights, setActiveWeights] = useState(PRESETS[0].weights);
  const [maxBudget, setMaxBudget] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setActiveWeights(preset.weights);
    setTopsisResults(null);
  };

  const handleBudgetChange = (value) => {
    setMaxBudget(value);
    setTopsisResults(null);
  };

  const handleRunTopsis = async () => {
    if (selectedHouses.length < 2) return;
    setLoading(true);
    try {
      const res = await api.post('/boarding-houses/compare', {
        houseIds: selectedHouses.map((h) => h._id),
        weights: activeWeights,
        maxBudget: maxBudget ? Number(maxBudget) : null,
      });
      setTopsisResults(res.data.data || res.data);
    } catch (err) {
      console.error('TOPSIS comparison failed:', err);
      alert('Failed to calculate decision ranking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-end md:items-stretch justify-end">
  <div className="w-full h-[90vh] md:h-full md:max-w-2xl bg-white shadow-2xl rounded-t-3xl md:rounded-none flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Compare with AI (TOPSIS Decision System)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-Criteria Decision Making ranking based on your living priorities
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Selected Properties Overview */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Selected Properties ({selectedHouses.length}/4)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {selectedHouses.map((house) => (
                <div key={house._id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="font-semibold text-sm text-slate-800 truncate">
                    {house.title || house.name}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">
                    ₱{house.monthlyRent?.toLocaleString()} / month
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Target Max Budget Input */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <PhilippinePeso className="w-3.5 h-3.5 text-emerald-600" />
                Target Monthly Budget (Optional)
              </label>
              {maxBudget && (
                <button
                  type="button"
                  onClick={() => handleBudgetChange('')}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">₱</span>
              <input
                type="number"
                min="500"
                step="100"
                placeholder="e.g. 3500 (Penalizes options above this amount)"
                value={maxBudget}
                onChange={(e) => handleBudgetChange(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-white text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Quick set:</span>
              {BUDGET_QUICK_PICKS.map((presetVal) => (
                <button
                  key={presetVal}
                  type="button"
                  onClick={() => handleBudgetChange(presetVal.toString())}
                  className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition ${
                    maxBudget === presetVal.toString()
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-800 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  ₱{presetVal.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Student Priority Presets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choose What Matters Most To You
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedPreset === preset.id
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{preset.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            disabled={selectedHouses.length < 2 || loading}
            onClick={handleRunTopsis}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Computing Relative Closeness...
              </>
            ) : (
              <>
                Compute Best Match with AI
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* TOPSIS Ranked Output */}
          {topsisResults && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Algorithmic Recommendation Ranking
              </h3>
              <div className="space-y-3">
                {topsisResults.map((item, idx) => {
                  const scoreVal = item.topsisScore ?? item.score ?? 0;
                  return (
                    <div
                      key={item.houseId || idx}
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        idx === 0
                          ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          #{item.rank || idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-slate-900">
                              {item.title || item.name || `Option ${idx + 1}`}
                            </h4>
                            {item.isOverBudget && (
                              <span className="text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <AlertCircle className="w-3 h-3" />
                                Over Budget
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Relative Closeness Score:{' '}
                            <span className="font-semibold text-slate-700">
                              {(scoreVal * 100).toFixed(1)}%
                            </span>
                            {item.monthlyRent && (
                              <span className="text-slate-400 ml-2">
                                (₱{item.monthlyRent.toLocaleString()}/mo)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {idx === 0 && (
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1 shrink-0 ml-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Best Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}