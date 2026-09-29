import React from 'react';
import { 
  Building2, 
  Clock, 
  ShieldCheck, 
  Terminal, 
  LogOut, 
  X, 
  ChevronRight,
  Compass,
  Home,
  Settings,
  Users
} from 'lucide-react';

export default function UserAccountDrawer({
  isOpen,
  onClose,
  user,
  currentView,
  setCurrentView,
  onOpenSettings,
  onOpenAdminReview,
  onOpenAdminLogs,
  onOpenAdminUsers, // Added prop for moderation modal
  onOpenApplyLandlord,
  onRequestLogout
}) {
  if (!isOpen) return null;

  const landlordAppStatus = user?.landlordApplication?.status || 'none';

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl z-10 flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200 transition-colors">
        
        {/* Drawer Header */}
        <div>
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200 dark:border-emerald-800">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{user?.name || 'User'}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Pill Banner */}
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Account Type</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {user?.role}
            </span>
          </div>

          {/* Navigation & Action Links */}
          <div className="p-4 space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
              Navigation
            </p>

            {/* Home Link */}
            <button
              type="button"
              onClick={() => {
                setCurrentView('landing');
                onClose();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'landing' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Home Page</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </button>

            {/* Explore Map Link */}
            <button
              type="button"
              onClick={() => {
                setCurrentView('explore');
                onClose();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'explore' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Explore Map</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </button>

            {/* Account Settings */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Account Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </button>

            {/* Landlord or Admin: Landlord Portal */}
            {(user?.role === 'landlord' || user?.role === 'admin') && (
              <button
                type="button"
                onClick={() => {
                  setCurrentView('landlord');
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  currentView === 'landlord' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Landlord Portal</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>
            )}

            {/* Student Actions */}
            {user?.role === 'student' && (
              <div className="pt-3">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
                  Landlord Program
                </p>

                {(landlordAppStatus === 'none' || landlordAppStatus === 'rejected') && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenApplyLandlord();
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4" />
                      <span>Apply as Landlord</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {landlordAppStatus === 'pending' && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-800">
                    <Clock className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Application Under Review</span>
                  </div>
                )}
              </div>
            )}

            {/* Admin Management Section */}
            {user?.role === 'admin' && (
              <div className="pt-3 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
                  Admin Tools
                </p>

                {/* Applications */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenAdminReview();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Review Applications</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </button>

                {/* User Accounts Moderation */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAdminUsers) onOpenAdminUsers();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Moderate Users</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                </button>

                {/* Audit Logs */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenAdminLogs();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>System Audit Logs</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer: Logout Trigger */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestLogout();
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}