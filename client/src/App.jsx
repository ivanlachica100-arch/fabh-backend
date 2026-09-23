import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Explore from './pages/Explore';
import LandlordPortal from './pages/LandlordPortal';
import AuthModal from './components/Auth/AuthModal';
import ApplyLandlordModal from './components/Auth/ApplyLandlordModal';
import AdminApplicationsModal from './components/Admin/AdminApplicationsModal';
import AdminAuditLogsModal from './components/Admin/AdminAuditLogsModal';
import UserAccountDrawer from './components/UserAccountDrawer';
import SettingsModal from './components/SettingsModal';
import { LogIn, LogOut } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isApplyLandlordOpen, setIsApplyLandlordOpen] = useState(false);
  const [isAdminReviewOpen, setIsAdminReviewOpen] = useState(false);
  const [isAdminLogsOpen, setIsAdminLogsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [targetCampusId, setTargetCampusId] = useState(null);

  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (currentView === 'landlord' && (!user || (user.role !== 'landlord' && user.role !== 'admin'))) {
      setCurrentView('landing');
    }
  }, [user, currentView]);

  const handleLogout = async () => {
    await logout();
    setCurrentView('landing');
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50 text-xs font-medium text-slate-500">
        Initializing FABH session...
      </div>
    );
  }

  return (
    <main className="w-screen h-screen relative overflow-hidden">
      
      {/* Top Floating Trigger (Hidden on landing page) */}
      {currentView !== 'landing' && (
        <header className="absolute top-3.5 right-4 z-[999]">
          {user ? (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 bg-white/95 hover:bg-white backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-md transition-all hover:scale-105 cursor-pointer"
              title="Open Account Menu"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                {user.name}
              </span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                {user.role}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-md cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In / Register
            </button>
          )}
        </header>
      )}

      {/* Main Routed Views */}
      <div className="w-full h-full overflow-hidden">
        {currentView === 'landing' && (
          <LandingPage 
            onStartExploring={() => setCurrentView('explore')} 
            onSelectCampus={(campusId) => {
              setTargetCampusId(campusId);
              setCurrentView('explore');
            }}
            onOpenAuth={() => setIsAuthOpen(true)}
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
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sign Out</h3>
                <p className="text-xs text-slate-500 mt-0.5">Are you sure you want to end your session?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
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