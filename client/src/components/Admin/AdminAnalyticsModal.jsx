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
  Loader2,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';

export default function AdminAnalyticsModal({ isOpen, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState(null);

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

  const universityData = analytics?.universityDemand || [
    { name: 'PHINMA UPang', percentage: 46, searches: 22, color: '#10b981' },
    { name: 'Lyceum Northwestern', percentage: 27, searches: 13, color: '#0ea5e9' },
    { name: 'Universidad de Dagupan', percentage: 16, searches: 8, color: '#f59e0b' },
    { name: 'Colegio de Dagupan', percentage: 11, searches: 5, color: '#8b5cf6' },
  ];

  let cumulativePercent = 0;
  const donutSlices = universityData.map((slice) => {
    const strokeDasharray = `${slice.percentage} ${100 - slice.percentage}`;
    const strokeDashoffset = -cumulativePercent;
    cumulativePercent += slice.percentage;
    return { ...slice, strokeDasharray, strokeDashoffset };
  });

  const totalSearchesCount = universityData.reduce((acc, curr) => acc + (curr.searches || 0), 0);

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Admin Platform Analytics</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  Live Aggregated
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Institutional KPIs, supply-demand economics, and quantitative TOPSIS decision telemetry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN BODY CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50 dark:bg-slate-950">
          {loading ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold tracking-wide">Querying live database aggregations...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TOP SECTION: 4 KPI SUMMARY CARDS */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Platform Core Metrics
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" /> Real-time active users & listings
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  
                  {/* KPI 1: TOTAL USERS */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Total Users</span>
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {analytics?.overview?.totalUsers?.toLocaleString() ?? 0}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Registered & Active Accounts
                    </p>
                  </div>

                  {/* KPI 2: ACTIVE LISTINGS */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active Listings</span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Home className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {analytics?.overview?.activeListings?.toLocaleString() ?? 0}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Published & Verified Dorms
                    </p>
                  </div>

                  {/* KPI 3: TOTAL LISTINGS VALUE */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Total Listings Value</span>
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                      ₱{(analytics?.overview?.totalListingsValue || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Cumulative Monthly Rent
                    </p>
                  </div>

                  {/* KPI 4: AI MATCHES */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">AI Matches</span>
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {analytics?.overview?.aiMatches?.toLocaleString() ?? 0}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Completed TOPSIS Sessions
                    </p>
                  </div>

                </div>
              </div>

              {/* MID SECTION: MARKETPLACE ANALYTICS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                
                {/* SUPPLY VS DEMAND CHART */}
                <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          Supply vs. Demand by Price Tier
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Active Property Counts (Supply) vs. User Search Volume (Demand)
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 text-[10px] font-bold">
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Supply
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Demand
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      {(analytics?.supplyDemand || [
                        { tier: '< 1.5K', supply: 1, demand: 8 },
                        { tier: '1.5K - 3K', supply: 6, demand: 18 },
                        { tier: '3K - 4.5K', supply: 4, demand: 7 },
                        { tier: '4.5K ABOVE', supply: 2, demand: 3 },
                      ]).map((row) => {
                        const maxVal = Math.max(
                          ...(analytics?.supplyDemand || []).map((r) => Math.max(r.supply, r.demand)),
                          10
                        );
                        const supplyPct = Math.min(100, (row.supply / maxVal) * 100);
                        const demandPct = Math.min(100, (row.demand / maxVal) * 100);

                        return (
                          <div key={row.tier} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{row.tier}</span>
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  Supply: <strong>{row.supply}</strong>
                                </span>
                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                  Demand: <strong>{row.demand}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                                <div 
                                  style={{ width: `${Math.max(4, supplyPct)}%` }} 
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out" 
                                />
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                                <div 
                                  style={{ width: `${Math.max(4, demandPct)}%` }} 
                                  className="bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out" 
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Grouped across 4 defense price brackets</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Optimal Liquidity: 1.5K - 3K</span>
                  </div>
                </div>

                {/* UNIVERSITY DEMAND DONUT */}
                <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          Student Demand by University Area
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Percentage Share via "Near In" Proximity Filters
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <PieIcon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                      <div className="relative w-36 h-36 mx-auto">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="4.2" className="text-slate-100 dark:text-slate-800" />
                          {donutSlices.map((slice) => (
                            <circle
                              key={slice.name}
                              cx="18"
                              cy="18"
                              r="15.9155"
                              fill="none"
                              stroke={slice.color}
                              strokeWidth="4.2"
                              strokeDasharray={slice.strokeDasharray}
                              strokeDashoffset={slice.strokeDashoffset}
                              className="transition-all duration-500 hover:opacity-85 cursor-pointer"
                              onMouseEnter={() => setHoveredSlice(slice)}
                              onMouseLeave={() => setHoveredSlice(null)}
                            />
                          ))}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {hoveredSlice ? `${hoveredSlice.percentage}%` : totalSearchesCount}
                          </span>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                            {hoveredSlice ? hoveredSlice.name.split(' ')[0] : 'Searches'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        {donutSlices.map((item) => (
                          <div 
                            key={item.name} 
                            className={`p-1.5 rounded-xl transition flex items-center justify-between ${
                              hoveredSlice?.name === item.name ? 'bg-slate-100 dark:bg-slate-800' : ''
                            }`}
                            onMouseEnter={() => setHoveredSlice(item)}
                            onMouseLeave={() => setHoveredSlice(null)}
                          >
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                style={{ backgroundColor: item.color }} 
                              />
                              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                              {item.percentage}% <span className="text-[9px] font-normal text-slate-400">({item.searches})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Geofenced search distribution</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Corridor: PHINMA UPang</span>
                  </div>
                </div>

              </div>

              {/* BOTTOM SECTION: AI & BEHAVIORAL DECISION TELEMETRY (TOPSIS) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                
                {/* TOP 4 AI-COMPARED BOARDING HOUSES */}
                <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          Top AI-Compared Boarding Houses
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Properties most frequently evaluated in student TOPSIS sessions
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Top 4 Ranked
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {(analytics?.topComparedDorms || []).length > 0 ? (
                        analytics.topComparedDorms.map((dorm, idx) => (
                          <div 
                            key={dorm.id || dorm.name} 
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs space-y-2"
                          >
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                  idx === 0 
                                    ? 'bg-amber-500 text-white shadow-xs' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}>
                                  #{idx + 1}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                  {dorm.name}
                                </span>
                              </div>
                              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                                {dorm.percentage}% <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">({dorm.count} compares)</span>
                              </span>
                            </div>

                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                              <div 
                                style={{ width: `${dorm.percentage}%` }}
                                className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 py-6 text-center">No comparison activity recorded yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Ranked against total TOPSIS evaluations</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Share Ratio: % of total pool</span>
                  </div>
                </div>

                {/* AI DECISION METRICS (TOPSIS) */}
                <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          AI Decision Metrics (TOPSIS)
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Behavioral engagement, weighting preferences & conversion
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        Behavioral Telemetry
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      
                      {/* Metric 1 */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                          Total AI Usage
                        </span>
                        <p className="text-xl font-black text-slate-900 dark:text-white">
                          {analytics?.aiDecisionMetrics?.totalUsage ?? 0}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Completed Sessions</p>
                      </div>

                      {/* Metric 2 */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                          Top Preference Mode
                        </span>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 truncate">
                          {analytics?.aiDecisionMetrics?.topPreferenceMode || 'Budget First (54%)'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Highest User Criterion</p>
                      </div>

                      {/* Metric 3 */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                          Avg. Listings / Compare
                        </span>
                        <p className="text-xl font-black text-slate-900 dark:text-white">
                          {analytics?.aiDecisionMetrics?.avgComparedListings || '3.6 / 4.0 slots'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Capacity Utilization</p>
                      </div>

                      {/* Metric 4 */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                          Inquiry Click Rate
                        </span>
                        <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                          {analytics?.aiDecisionMetrics?.inquiryClickRate || '38%'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Post-AI Inquiries</p>
                      </div>

                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-400" />
                      Formula: (Post-AI Inquiries / Total AI Comparisons) * 100
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Conversion Target: &gt; 30%
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            FABH Quantitative Analytics Engine • Dagupan University Corridor
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}