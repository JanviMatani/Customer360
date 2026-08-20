import React from 'react';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallbackTitle = 'Restricted Administrative Access',
  fallbackMessage,
}) => {
  const { user, switchRole } = useAuthStore();

  if (!user) {
    return null;
  }

  const isAuthorized = allowedRoles.includes(user.role);

  if (isAuthorized) {
    return <>{children}</>;
  }

  const defaultMsg = `Your current role is ${user.role.toUpperCase()} (${user.name}). This module requires ${allowedRoles
    .map((r) => r.toUpperCase())
    .join(' or ')} privileges according to Enterprise RBAC Policy.`;

  return (
    <div
      id="role-guard-locked-card"
      className="p-8 rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] text-[#20252B] flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-8 shadow-xs"
    >
      <div className="w-12 h-12 rounded-md bg-[#F9ECEC] border border-[#E8B8B8] flex items-center justify-center text-[#B84242] mb-4">
        <Lock className="w-6 h-6" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F9ECEC] border border-[#E8B8B8] text-[#B84242] text-xs font-semibold uppercase tracking-wider mb-2">
        <ShieldAlert className="w-3.5 h-3.5" />
        RBAC Security Enforcement
      </div>

      <h3 className="text-lg font-bold text-[#20252B] mb-2">{fallbackTitle}</h3>
      <p className="text-sm text-[#68717C] max-w-md mb-6 leading-relaxed">
        {fallbackMessage || defaultMsg}
      </p>

      <div className="p-4 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-left w-full mb-6 text-xs text-[#20252B] font-mono space-y-1">
        <div className="text-[#68717C] font-semibold">// Security Audit Log Entry</div>
        <div>
          <span className="text-[#68717C]">Actor:</span>{' '}
          <span className="text-[#20252B] font-semibold">{user.email}</span>
        </div>
        <div>
          <span className="text-[#68717C]">Role:</span>{' '}
          <span className="text-[#A66A16] font-semibold">{user.role.toUpperCase()}</span>
        </div>
        <div>
          <span className="text-[#68717C]">Status:</span>{' '}
          <span className="text-[#B84242] font-semibold">403 FORBIDDEN (Logged to Compliance Stream)</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <span className="text-xs text-[#68717C] font-medium">Quick Role Switch:</span>
        <div className="flex gap-2">
          {allowedRoles.map((role) => (
            <button
              key={role}
              id={`switch-to-${role}-btn`}
              onClick={() => switchRole(role)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2457A6] hover:bg-[#183B70] text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>Switch to {role.toUpperCase()}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
