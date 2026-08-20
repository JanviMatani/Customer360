import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../store/authStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { UserRole } from '../../types';
import {
  Menu,
  LogOut,
  Download,
  CheckCircle2,
  Shield,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, switchRole, logout } = useAuthStore();
  const { toggleMobileOpen } = useSidebarStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleStyles: Record<UserRole, { badge: string; label: string }> = {
    rm: {
      badge: 'bg-[#EBF1FA] text-[#2457A6] border-[#BCD1F0]',
      label: 'RM (Relationship Mgr)',
    },
    manager: {
      badge: 'bg-[#F2EDFA] text-[#6A3BB8] border-[#D6C7F0]',
      label: 'Branch Manager',
    },
    admin: {
      badge: 'bg-[#F9ECEC] text-[#B84242] border-[#E8B8B8]',
      label: 'System Admin',
    },
  };

  const currentRoleStyle = user ? roleStyles[user.role] : roleStyles.rm;

  return (
    <div id="app-container" className="flex h-screen bg-[#F4F2ED] text-[#20252B] overflow-hidden font-sans">
      {/* Sidebar Rail / Mobile Drawer */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header / Demo Controls */}
        <header
          id="app-header"
          className="h-16 bg-[#FFFFFF] border-b border-[#D8D5CD] px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 shadow-xs"
        >
          {/* Left: Mobile Toggle & Role Switcher Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={toggleMobileOpen}
              className="p-2 rounded-md text-[#68717C] hover:text-[#20252B] hover:bg-[#ECEAE4] md:hidden cursor-pointer"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Persona Switcher Toolbar (Crucial for Judge Demo) */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-xs">
              <span className="text-[#68717C] font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider hidden sm:inline">
                Persona Switcher:
              </span>
              <div className="flex items-center gap-1">
                {(['rm', 'manager', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    id={`quick-switch-${r}`}
                    onClick={() => switchRole(r)}
                    className={`px-2 sm:px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      user?.role === r
                        ? 'bg-[#2457A6] text-white shadow-xs'
                        : 'text-[#68717C] hover:text-[#20252B] hover:bg-[#D8D5CD]/50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Offline/Online Status Pill */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${
                isOnline
                  ? 'bg-[#EBF4EF] text-[#287A52] border-[#A8D3BC]'
                  : 'bg-[#FBF4EB] text-[#A66A16] border-[#E8CEAB]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#287A52]' : 'bg-[#A66A16]'}`}
              />
              <span className="font-semibold">{isOnline ? 'LIVE API' : 'OFFLINE CACHED'}</span>
            </div>

            {deferredPrompt && (
              <button
                id="pwa-install-header-btn"
                onClick={handleInstallClick}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EBF1FA] border border-[#BCD1F0] text-[#2457A6] text-xs font-medium hover:bg-[#D9E6F7] transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install PWA</span>
              </button>
            )}
          </div>

          {/* Right: Active User Identity & Actions */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-[#20252B] flex items-center justify-end gap-1.5">
                    <span>{user.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${currentRoleStyle.badge}`}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#68717C] font-mono truncate max-w-[180px]">
                    {user.email}
                  </div>
                </div>

                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] flex items-center justify-center text-[#2457A6] font-bold text-xs sm:text-sm">
                  {user.name.charAt(0)}
                </div>

                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-md text-[#68717C] hover:text-[#B84242] hover:bg-[#ECEAE4] transition-colors cursor-pointer"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content Outlet */}
        <main id="app-main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F4F2ED]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
