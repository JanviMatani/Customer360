import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2, LayoutDashboard, Users, TrendingUp,
  GitMerge, Settings, FileText, LogOut, Menu, X, ChevronDown, Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../auth/authStore';
import { authApi } from '../../api/authApi';
import { toastStore } from '../../utils/toast';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Overview' },
  { to: '/customers',     icon: Users,           label: 'Customers' },
  { to: '/opportunities', icon: TrendingUp,      label: 'Opportunities' },
  { to: '/review',        icon: GitMerge,        label: 'Review Queue', roles: ['manager', 'admin'] },
  { to: '/pipeline',      icon: Zap,             label: 'Pipeline',      roles: ['admin'] },
  { to: '/configuration', icon: Settings,        label: 'Configuration', roles: ['admin'] },
  { to: '/audit',         icon: FileText,        label: 'Audit',         roles: ['admin'] },
];

export function TopNav() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const visible = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuth();
    toastStore.success('Signed out successfully.');
    navigate('/login');
  };

  return (
    <header className="bg-navy-950 border-b border-navy-800 shrink-0">
      <div className="flex items-center h-12 px-4 gap-6">

        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 bg-teal-600 rounded flex items-center justify-center">
            <Building2 size={13} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-semibold text-white">Customer 360</span>
            <span className="text-2xs text-navy-400 ml-1.5 hidden lg:inline">Financial Intelligence Platform</span>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-navy-800 text-white'
                    : 'text-navy-300 hover:text-white hover:bg-navy-900'
                )
              }
            >
              <item.icon size={13} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* User menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-navy-300 hover:text-white hover:bg-navy-900 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-navy-700 flex items-center justify-center">
                  <span className="text-2xs font-semibold text-white">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block max-w-[120px] truncate">{user.email}</span>
                <span className="badge bg-navy-800 text-navy-300 border-navy-700 border capitalize hidden sm:inline">
                  {user.role}
                </span>
                <ChevronDown size={11} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded shadow-lg z-20">
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-800 truncate">{user.email}</p>
                      <p className="text-2xs text-slate-400 capitalize">
                        {user.role}{user.rmId ? ` · ${user.rmId}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={12} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden text-navy-300 hover:text-white p-1"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-navy-800 px-3 py-2 flex flex-col gap-0.5">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors',
                  isActive
                    ? 'bg-navy-800 text-white'
                    : 'text-navy-300 hover:bg-navy-900 hover:text-white'
                )
              }
            >
              <item.icon size={14} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
