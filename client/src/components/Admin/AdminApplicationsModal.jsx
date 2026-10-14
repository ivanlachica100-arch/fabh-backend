import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  X, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Loader2, 
  Clock,
  BarChart3,
  Users,
  Home,
  DollarSign,
  Bot,
  Trophy,
  PieChart as PieIcon,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

export default function AdminApplicationsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'applications'
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'analytics') {
        fetchAnalytics();
      } else {
        fetchApplications();
      }
    }
  }, [isOpen, activeTab]);

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

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/applications');
      setApplications(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (userId, decision) => {
    setActionId(userId);
    try {
      await api.put(`/admin/applications/${userId}`, { status: decision });
      setApplications((prev) => prev.filter((app) => app._id !== userId));
      if (analytics?.overview) {
        setAnalytics((prev) => ({
          ...prev,
          overview: {
            ...prev.overview,
            pendingApplications: Math.max(0, (prev.overview.pendingApplications || 1) - 1),
          },
        }));
      }
    } catch (err) {
      console.error('Decision error:', err);
      alert('Could not update application status.');
    } finally {
      setActionId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        
        {/* Header with Navigation Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Admin Control & Analytics Dashboard</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Institutional metrics, housing demand analysis, and landlord accreditation.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics & Demand
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('applications')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'applications'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Applications
                {analytics?.overview?.pendingApplications > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {analytics.overview.pendingApplications}
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-medium">Fetching platform analytics data...</p>
            </div>
          ) : activeTab === 'analytics' ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* TOP KPI OVERVIEW CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* Total Users */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {analytics?.overview?.totalUsers?.toLocaleString() || '1,240'}
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
                    {analytics?.overview?.activeListings?.toLocaleString() || '85'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Verified boarding houses</p>
                </div>

                {/* Total Listing Value */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Portfolio Value</span>
                    <DollarSign className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    ₱{analytics?.overview?.totalListingsValue?.toLocaleString() || '255,000'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Cumulative monthly inventory</p>
                </div>

                {/* AI Matches */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">AI Matches</span>
                    <Bot className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {analytics?.overview?.aiMatches?.toLocaleString() || '430'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">TOPSIS comparisons run</p>
                </div>

              </div>

              {/* MID SECTION: CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Supply vs. Demand Bar Graph */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs">
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
                        <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 dark:bg-slate-300" /> Demand
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-3">
                    {(analytics?.supplyDemand || [
                      { tier: '< 1.5K', supply: 10, demand: 85 },
                      { tier: '1.5K - 3K', supply: 35, demand: 120 },
                      { tier: '3K - 4.5K', supply: 20, demand: 45 },
                      { tier: '4.5K Above', supply: 5, demand: 15 },
                    ]).map((row) => {
                      const maxVal = 130;
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

                          {/* Supply Bar */}
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                            <div 
                              style={{ width: supplyWidth }} 
                              className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                              title={`Supply: ${row.supply}`}
                            />
                          </div>

                          {/* Demand Bar */}
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                            <div 
                              style={{ width: demandWidth }} 
                              className="bg-slate-800 dark:bg-slate-200 h-full rounded-full transition-all duration-500" 
                              title={`Demand: ${row.demand}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* University Area Demand Pie Chart */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs">
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
                    {/* Native Scalable SVG Donut */}
                    <div className="relative w-36 h-36 mx-auto">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        {/* Background ring */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="3.8" className="text-slate-100 dark:text-slate-800" />
                        
                        {/* UPang: 45% */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3b82f6" strokeWidth="3.8" strokeDasharray="45 55" strokeDashoffset="0" />
                        {/* UL: 30% */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0f766e" strokeWidth="3.8" strokeDasharray="30 70" strokeDashoffset="-45" />
                        {/* UdD: 15% */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f97316" strokeWidth="3.8" strokeDasharray="15 85" strokeDashoffset="-75" />
                        {/* Lyceum: 10% */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0284c7" strokeWidth="3.8" strokeDasharray="10 90" strokeDashoffset="-90" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-black text-slate-900 dark:text-white">400</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Searches</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-1.5 text-xs">
                      {[
                        { name: 'PHINMA UPang', pct: '45.0%', searches: 180, color: 'bg-blue-500' },
                        { name: 'University of Luzon', pct: '30.0%', searches: 120, color: 'bg-teal-700' },
                        { name: 'Universidad de Dagupan', pct: '15.0%', searches: 60, color: 'bg-orange-500' },
                        { name: 'Lyceum Northwestern', pct: '10.0%', searches: 40, color: 'bg-sky-600' },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                            {item.pct} <span className="text-[9px] font-normal text-slate-400">({item.searches})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* BOTTOM SECTION: AI DECISION & TOP COMPARED DORMS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Top AI-Compared Dorms */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Top AI-Compared Boarding Houses
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Accommodations most frequently evaluated by students
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(analytics?.topComparedDorms || [
                      { name: 'Perez Boulevard Student Haven', percentage: 42, count: 420 },
                      { name: 'Burgos Street Budget Quarters', percentage: 31, count: 310 },
                      { name: 'Arellano University Belt Dorm', percentage: 24, count: 245 },
                      { name: 'Lucao Greenville Ladies Home', percentage: 18, count: 180 },
                    ]).map((dorm, idx) => (
                      <div key={dorm.name} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                            {idx + 1}. {dorm.name}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
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
                    ))}
                  </div>
                </div>

                {/* AI Decision Metrics (TOPSIS) */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs flex flex-col justify-between">
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
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-750">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Total AI Usage:</span>
                        <strong className="text-slate-900 dark:text-white">
                          {analytics?.aiDecisionMetrics?.totalUsage || 430} sessions
                        </strong>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-750">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Top Preference Mode:</span>
                        <strong className="text-emerald-700 dark:text-emerald-400">
                          {analytics?.aiDecisionMetrics?.topPreferenceMode || 'Budget First (58%)'}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-750">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Avg. Listings Per Compare:</span>
                        <strong className="text-slate-900 dark:text-white">
                          {analytics?.aiDecisionMetrics?.avgComparedListings || '3.8 / 4.0 slots'}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-750">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Inquiry Click Rate (Post-AI):</span>
                        <strong className="text-blue-600 dark:text-blue-400">
                          {analytics?.aiDecisionMetrics?.inquiryClickRate || '38% conversion'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 italic">
                    Quantifies decision-making speed improvements and direct student conversion to landlord contacts.
                  </p>
                </div>

              </div>

            </div>
          ) : (
            /* APPLICATIONS TAB */
            <div className="space-y-4 animate-in fade-in duration-150">
              {applications.length === 0 ? (
                <div className="text-center py-12 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                  <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    No pending landlord applications at the moment.
                  </p>
                </div>
              ) : (
                applications.map((app) => (
                  <div 
                    key={app._id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{app.name}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {app.email} • {app.landlordApplication?.contactNumber || 'No phone provided'}
                        </p>
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 inline-block mt-1">
                          ID: {app.landlordApplication?.governmentIdType || 'Government ID'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={actionId === app._id}
                          onClick={() => handleDecision(app._id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
                        >
                          {actionId === app._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionId === app._id}
                          onClick={() => handleDecision(app._id, 'rejected')}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <a
                        href={app.landlordApplication?.idDocumentUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition"
                      >
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>View Government ID</span>
                      </a>
                      <a
                        href={app.landlordApplication?.ownershipDocumentUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition"
                      >
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>View Property Permit</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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