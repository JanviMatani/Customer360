import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitMerge,
  Sparkles,
  Sliders,
  Lock,
  ChevronRight,
  ChevronLeft,
  History,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { useReviewQueue } from '../../hooks/useReview';
import { useOpportunities } from '../../hooks/useOpportunities';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { isCollapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebarStore();
  const location = useLocation();
  const { data: reviewData } = useReviewQueue('pending');
  const { data: oppData } = useOpportunities({ rmId: user?.role === 'rm' ? user.rmId : undefined });

  const pendingReviews = reviewData?.total || 0;
  const activeOpps = oppData?.total || 0;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['rm', 'manager', 'admin'],
      badge: null,
    },
    {
      to: '/customers',
      label: 'Customer 360',
      icon: Users,
      roles: ['rm', 'manager', 'admin'],
      badge: null,
    },
    {
      to: '/review',
      label: 'Review Queue',
      icon: GitMerge,
      roles: ['rm', 'manager', 'admin'],
      badge: pendingReviews > 0 ? pendingReviews : null,
      badgeColor: 'bg-[#FBF4EB] text-[#A66A16] border-[#E8CEAB]',
    },
    {
      to: '/opportunities',
      label: 'Opportunity Engine',
      icon: Sparkles,
      roles: ['rm', 'manager', 'admin'],
      badge: activeOpps > 0 ? activeOpps : null,
      badgeColor: 'bg-[#EBF1FA] text-[#2457A6] border-[#BCD1F0]',
    },
    {
      to: '/audit',
      label: 'Audit & Governance',
      icon: History,
      roles: ['rm', 'manager', 'admin'],
      badge: null,
    },
    {
      to: '/config',
      label: 'Configuration & Rules',
      icon: Sliders,
      roles: ['admin'],
      requiresAdmin: true,
      badge: null,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col min-h-0 overflow-y-auto">
        {/* Brand Header */}
        <div
          className={`p-3.5 border-b border-[#D8D5CD] flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } bg-[#ECEAE4]`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#2457A6] flex items-center justify-center text-white font-bold tracking-tight text-base shadow-xs shrink-0">
              360
            </div>
            {!isCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <div className="font-bold text-sm text-[#20252B] flex items-center gap-1.5 truncate">
                  <span>Customer 360</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EBF1FA] text-[#2457A6] border border-[#BCD1F0] font-mono font-bold">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] text-[#68717C] truncate">
                  Identity & Opp Intelligence
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Collapse / Expand rail toggle for desktop */}
            <button
              onClick={toggleCollapse}
              id="sidebar-toggle-collapse-btn"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden md:flex p-1.5 rounded-md text-[#68717C] hover:text-[#2457A6] hover:bg-[#D8D5CD]/60 transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Close button for mobile drawer */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-md text-[#68717C] hover:text-[#20252B] hover:bg-[#D8D5CD]/60 md:hidden cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-2 space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#68717C] uppercase">
              Platform Modules
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isAdminOnly = item.requiresAdmin;
            const isLocked = isAdminOnly && user?.role !== 'admin';
            const isActive = location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                id={`nav-link-${item.to.replace('/', '') || 'root'}`}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? `${item.label}${isLocked ? ' (Admin Only)' : ''}` : undefined}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'
                } rounded-md text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#FFFFFF] text-[#2457A6] border border-[#D8D5CD] font-semibold shadow-xs'
                    : isLocked
                    ? 'text-[#68717C] hover:bg-[#D8D5CD]/30'
                    : 'text-[#20252B] hover:bg-[#FFFFFF]/70 hover:text-[#2457A6]'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                  <div className="relative">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-[#2457A6]'
                          : isLocked
                          ? 'text-[#68717C]'
                          : 'text-[#68717C] group-hover:text-[#2457A6]'
                      }`}
                    />
                    {isCollapsed && item.badge !== null && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#A66A16] border-2 border-[#ECEAE4]" />
                    )}
                  </div>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isLocked && (
                      <span
                        title="Requires Admin Access"
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ECEAE4] border border-[#D8D5CD] text-[10px] text-[#68717C] font-mono"
                      >
                        <Lock className="w-2.5 h-2.5 text-[#A66A16]" />
                        <span>Admin</span>
                      </span>
                    )}
                    {item.badge !== null && (
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {!isLocked && isActive && <ChevronRight className="w-3.5 h-3.5 text-[#2457A6]" />}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer / RBAC Status */}
      <div className="border-t border-[#D8D5CD] bg-[#ECEAE4]">
        {!isCollapsed && (
          <div className="p-3">
            <div className="p-2.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#68717C] font-medium">Security Framework:</span>
                <span className="flex items-center gap-1 text-[#287A52] font-mono text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#287A52]" />
                  RBAC ACTIVE
                </span>
              </div>
              <div className="text-[10px] text-[#68717C] font-mono truncate">
                Auth: Bearer JWT | DPDP Masked
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Rail */}
      <aside
        id="app-sidebar"
        className={`hidden md:flex ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        } bg-[#ECEAE4] border-r border-[#D8D5CD] flex-col justify-between shrink-0 h-screen sticky top-0 z-30 transition-all duration-200`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#20252B]/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-150"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Container */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-[#ECEAE4] border-r border-[#D8D5CD] z-50 md:hidden transform transition-transform duration-200 ease-in-out shadow-lg ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
