import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Explore from './pages/Explore';
import LandlordPortal from './pages/LandlordPortal';
import AuthModal from './components/Auth/AuthModal';
import ApplyLandlordModal from './components/Auth/ApplyLandlordModal';
import AdminApplicationsModal from './components/Admin/AdminApplicationsModal';
import AdminAuditLogsModal from './components/Admin/AdminAuditLogsModal';
import AdminUsersModal from './components/Admin/AdminUsersModal';
import UserAccountDrawer from './components/UserAccountDrawer';
import SettingsModal from './components/SettingsModal';
import { LogIn, LogOut, CheckCircle } from 'lucide-react';
import NotificationBell from './components/NotificationBell';

function AppContent() {
  const [currentView, setCurrentView] = useState('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isApplyLandlordOpen, setIsApplyLandlordOpen] = useState(false);
  const [isAdminReviewOpen, setIsAdminReviewOpen] = useState(false);
  const [isAdminLogsOpen, setIsAdminLogsOpen] = useState(false);
  const [isAdminUsersOpen, setIsAdminUsersOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState(false);
  const [targetCampusId, setTargetCampusId] = useState(null);

  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (currentView === 'landlord' && (!user || (user.role !== 'landlord' && user.role !== 'admin'))) {
      setCurrentView('landing');
    }
  }, [user, currentView]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('token');
    sessionStorage.clear();
    setCurrentView('landing');
    setLogoutNotice(true);

    setTimeout(() => {
      setLogoutNotice(false);
    }, 3500);
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-500 dark:text-slate-400">
        Initializing FABH session...
      </div>
    );
  }

  return (
    <main className="w-screen h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Floating Logout Toast Feedback */}
      {logoutNotice && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[10000] bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 px-4 py-2 rounded-full shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-semibold flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>You have been successfully logged out.</span>
        </div>
      )}

      {/* Top Floating Trigger on Explore & Landlord Views Only */}
      {currentView !== 'landing' && (
        <header className="absolute top-3.5 right-4 z-[999] flex items-center gap-2">
          {user && <NotificationBell />}

          {user ? (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-md transition-all hover:scale-105 cursor-pointer text-slate-900 dark:text-white"
              title="Open Account Menu"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-bold max-w-[120px] truncate">
                {user.name}
              </span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {user.role}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-md cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In / Register
            </button>
          )}
        </header>
      )}

      {/* Main Routed Views */}
      <div className={`w-full h-full ${currentView === 'landing' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        {currentView === 'landing' && (
          <LandingPage 
            onStartExploring={() => setCurrentView('explore')} 
            onSelectCampus={(campusId) => {
              setTargetCampusId(campusId);
              setCurrentView('explore');
            }}
            onOpenAuth={() => setIsAuthOpen(true)}
            user={user}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onNavigateLandlord={() => setCurrentView('landlord')}
          />
        )}
        {currentView === 'explore' && <Explore initialCampusId={targetCampusId} />}
        {currentView === 'landlord' && (
          <LandlordPortal onBackToExplore={() => setCurrentView('explore')} />
        )}
      </div>

      {/* Slide-out User Account Sidebar */}
      <UserAccountDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdminReview={() => setIsAdminReviewOpen(true)}
        onOpenAdminLogs={() => setIsAdminLogsOpen(true)}
        onOpenAdminUsers={() => setIsAdminUsersOpen(true)}
        onOpenApplyLandlord={() => setIsApplyLandlordOpen(true)}
        onRequestLogout={() => setIsLogoutConfirmOpen(true)}
      />

      {/* Settings & Appearance Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Logout Confirmation Dialog */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/30">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sign Out</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Are you sure you want to end your session?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsLogoutConfirmOpen(false);
                  await handleLogout();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth & Application Modals */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccessLogin={() => setCurrentView('explore')}
      />
      <ApplyLandlordModal
        isOpen={isApplyLandlordOpen}
        onClose={() => setIsApplyLandlordOpen(false)}
      />
      <AdminApplicationsModal
        isOpen={isAdminReviewOpen}
        onClose={() => setIsAdminReviewOpen(false)}
      />
      <AdminAuditLogsModal
        isOpen={isAdminLogsOpen}
        onClose={() => setIsAdminLogsOpen(false)}
      />
      <AdminUsersModal
        isOpen={isAdminUsersOpen}
        onClose={() => setIsAdminUsersOpen(false)}
      />
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}