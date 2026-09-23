import React from 'react';
import { 
  UserCircle, 
  Building2, 
  Clock, 
  ShieldCheck, 
  Terminal, 
  LogOut, 
  X, 
  ChevronRight,
  Compass,
  Home
} from 'lucide-react';

export default function UserAccountDrawer({
  isOpen,
  onClose,
  user,
  currentView,
  setCurrentView,
  onOpenAdminReview,
  onOpenAdminLogs,
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
        className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div>
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">{user?.name || 'User'}</h3>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Pill Banner */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Account Type</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {user?.role}
            </span>
          </div>

          {/* Navigation & Action Links */}
          <div className="p-4 space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
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
                currentView === 'landing' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Home Page</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Explore Map Link */}
            <button
              type="button"
              onClick={() => {
                setCurrentView('explore');
                onClose();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentView === 'explore' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Explore Map</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
                  currentView === 'landlord' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Landlord Portal</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            {/* Student Actions */}
            {user?.role === 'student' && (
              <div className="pt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Landlord Program
                </p>

                {(landlordAppStatus === 'none' || landlordAppStatus === 'rejected') && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenApplyLandlord();
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4" />
                      <span>Apply as Landlord</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {landlordAppStatus === 'pending' && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
                    <Clock className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                    <span>Application Under Review</span>
                  </div>
                )}
              </div>
            )}

            {/* Admin Management Section */}
            {user?.role === 'admin' && (
              <div className="pt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Admin Tools
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAdminReview();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 transition cursor-pointer mb-1"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Review Applications</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenAdminLogs();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-slate-600" />
                    <span>System Audit Logs</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer: Logout Trigger */}
        <div className="p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestLogout();
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}