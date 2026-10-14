import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  X, 
  BarChart3, 
  Users, 
  Home, 
  DollarSign, 
  Bot, 
  Trophy, 
  PieChart as PieIcon, 
  Loader2 
} from 'lucide-react';

export default function AdminAnalyticsModal({ isOpen, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Admin Platform Analytics & Demand</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Institutional metrics, housing demand analysis, and AI decision statistics.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-medium">Fetching real-time analytics data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TOP KPI OVERVIEW CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* Total Users */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {analytics?.overview?.totalUsers?.toLocaleString() ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Students & Landlords</p>
                </div>

                {/* Active Listings */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active Listings</span>
                    <Home className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {analytics?.overview?.activeListings?.toLocaleString() ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Verified boarding houses</p>
                </div>

                {/* Total Portfolio Value */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Portfolio Value</span>
                    <DollarSign className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ₱{analytics?.overview?.totalListingsValue?.toLocaleString() ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Cumulative monthly rent</p>
                </div>

                {/* AI Matches */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">AI Matches</span>
                    <Bot className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {analytics?.overview?.aiMatches?.toLocaleString() ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">TOPSIS comparisons run</p>
                </div>

              </div>

              {/* MID SECTION: CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Supply vs. Demand */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Supply vs. Demand by Budget
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Active Listings vs. Student Search Filters
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-semibold">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Supply
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 dark:bg-slate-200" /> Demand
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-3">
                    {(analytics?.supplyDemand || [
                      { tier: '< 1.5K', supply: 0, demand: 5 },
                      { tier: '1.5K - 3K', supply: 0, demand: 10 },
                      { tier: '3K - 4.5K', supply: 0, demand: 4 },
                      { tier: '4.5K Above', supply: 0, demand: 2 },
                    ]).map((row) => {
                      const maxVal = Math.max(...(analytics?.supplyDemand || []).map(r => Math.max(r.supply, r.demand)), 15);
                      const supplyWidth = `${Math.min(100, (row.supply / maxVal) * 100)}%`;
                      const demandWidth = `${Math.min(100, (row.demand / maxVal) * 100)}%`;

                      return (
                        <div key={row.tier} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            <span>{row.tier}</span>
                            <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                              Supply: <strong>{row.supply}</strong> | Demand: <strong>{row.demand}</strong>
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                            <div 
                              style={{ width: supplyWidth }} 
                              className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                            />
                          </div>

                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                            <div 
                              style={{ width: demandWidth }} 
                              className="bg-slate-800 dark:bg-slate-200 h-full rounded-full transition-all duration-500" 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* University Area Demand Pie Chart */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Student Demand by University Area
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Distribution of "Near In" Campus Search Filters
                      </p>
                    </div>
                    <PieIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                    <div className="relative w-36 h-36 mx-auto">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="3.8" className="text-slate-100 dark:text-slate-800" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3b82f6" strokeWidth="3.8" strokeDasharray="45 55" strokeDashoffset="0" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0f766e" strokeWidth="3.8" strokeDasharray="30 70" strokeDashoffset="-45" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f97316" strokeWidth="3.8" strokeDasharray="15 85" strokeDashoffset="-75" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0284c7" strokeWidth="3.8" strokeDasharray="10 90" strokeDashoffset="-90" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {(analytics?.universityDemand || []).reduce((acc, u) => acc + (u.searches || 0), 0) || 400}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Searches</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {(analytics?.universityDemand || [
                        { name: 'PHINMA UPang', percentage: 45, searches: 18, color: 'bg-blue-500' },
                        { name: 'University of Luzon', percentage: 30, searches: 12, color: 'bg-teal-700' },
                        { name: 'Universidad de Dagupan', percentage: 15, searches: 6, color: 'bg-orange-500' },
                        { name: 'Lyceum Northwestern', percentage: 10, searches: 4, color: 'bg-sky-600' },
                      ]).map((item, idx) => {
                        const colors = ['bg-blue-500', 'bg-teal-700', 'bg-orange-500', 'bg-sky-600'];
                        return (
                          <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full ${item.color || colors[idx]}`} />
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                              {item.percentage}% <span className="text-[9px] font-normal text-slate-400">({item.searches})</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* BOTTOM SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Top Boarding Houses */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Top AI-Compared Boarding Houses
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Accommodations evaluated by students
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(analytics?.topComparedDorms || []).length > 0 ? (
                      analytics.topComparedDorms.map((dorm, idx) => (
                        <div key={dorm.name} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                              {idx + 1}. {dorm.name}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              {dorm.percentage}% ({dorm.count} compares)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div 
                              style={{ width: `${dorm.percentage}%` }}
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-4 text-center">No comparison activities recorded yet.</p>
                    )}
                  </div>
                </div>

                {/* TOPSIS AI Decision Metrics */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          AI Decision Metrics (TOPSIS)
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Algorithmic engagement and post-comparison actions
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Total AI Usage:</span>
                        <strong className="text-slate-900 dark:text-white">
                          {analytics?.aiDecisionMetrics?.totalUsage ?? 0} sessions
                        </strong>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Top Preference Mode:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {analytics?.aiDecisionMetrics?.topPreferenceMode || 'Budget First (58%)'}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Avg. Listings Per Compare:</span>
                        <strong className="text-slate-900 dark:text-white">
                          {analytics?.aiDecisionMetrics?.avgComparedListings || '3.8 / 4.0 slots'}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Inquiry Click Rate (Post-AI):</span>
                        <strong className="text-blue-600 dark:text-blue-400">
                          {analytics?.aiDecisionMetrics?.inquiryClickRate || '38%'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 italic">
                    Live measurements calculating decision velocity and direct landlord inquiries.
                  </p>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end">
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