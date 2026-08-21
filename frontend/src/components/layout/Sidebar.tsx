import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GitMerge, Sparkles,
  Sliders, History, LogOut, Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
  managerAndAbove?: boolean;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems: NavItem[] = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/customers', icon: <Users size={18} />, label: 'Customer 360' },
    // Review Queue: Manager and Admin only — RM cannot merge/separate identities
    { to: '/review', icon: <GitMerge size={18} />, label: 'Review Queue', managerAndAbove: true },
    { to: '/opportunities', icon: <Sparkles size={18} />, label: 'Opportunities' },
    { to: '/audit', icon: <History size={18} />, label: 'Audit Log' },
    { to: '/config', icon: <Sliders size={18} />, label: 'Configuration', adminOnly: true },
  ];

  const isAdmin = user?.role === 'admin';
  const isManagerOrAbove = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div
      className="flex flex-col items-center py-4 flex-shrink-0"
      style={{ width: 56, background: '#0F1923', height: '100vh' }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center rounded-lg mb-6 flex-shrink-0"
        style={{ width: 36, height: 36, background: '#1B4FD8' }}
        title="Customer 360"
      >
        <span className="font-bold text-white text-xs" style={{ fontSize: 11 }}>360</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {navItems.map((item) => {
          // Admin-only items: show locked icon for non-admins
          if (item.adminOnly && !isAdmin) {
            return (
              <div
                key={item.to}
                className="sidebar-nav-item opacity-25 cursor-not-allowed relative"
                title={`${item.label} (Admin only)`}
              >
                {item.icon}
                <Shield size={8} className="absolute bottom-1.5 right-1.5 text-white/60" />
              </div>
            );
          }
          // Manager-and-above items: completely hidden from RM — not just greyed out
          if (item.managerAndAbove && !isManagerOrAbove) {
            return null;
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
            >
              {item.icon}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: role indicator + logout */}
      <div className="flex flex-col items-center gap-2 px-2 pb-1">
        <div
          className="flex items-center justify-center rounded text-[9px] font-bold tracking-wider flex-shrink-0"
          style={{
            width: 32, height: 18,
            background: user?.role === 'admin' ? '#1B4FD8' : user?.role === 'manager' ? '#059669' : '#6B7280',
            color: 'white',
          }}
          title={`Role: ${user?.role?.toUpperCase()}`}
        >
          {user?.role?.slice(0, 2).toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="sidebar-nav-item text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};
