import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, switchRole } = useAuthStore();

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    navigate('/config');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-lg w-full p-8 rounded-lg bg-[#FFFFFF] border border-[#E8B8B8] shadow-xs space-y-6 relative overflow-hidden">
        <div className="w-14 h-14 rounded-md bg-[#F9ECEC] border border-[#E8B8B8] flex items-center justify-center text-[#B84242] mx-auto">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F9ECEC] border border-[#E8B8B8] text-[#B84242] text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            403 ACCESS DENIED
          </div>
          <h2 className="text-2xl font-bold text-[#20252B] tracking-tight">
            Access Denied — this attempt has been logged
          </h2>
          <p className="text-xs text-[#68717C] leading-relaxed">
            Requires <strong>Admin access</strong> to modify system configuration and match thresholds. Your active persona is{' '}
            <strong className="text-[#A66A16] uppercase font-mono">{user?.role}</strong> ({user?.name}).
          </p>
        </div>

        <div className="p-3.5 rounded-md bg-[#ECEAE4] border border-[#D8D5CD] text-left text-xs font-mono text-[#68717C] space-y-1">
          <div className="text-[#68717C]">// Security Audit Log Entry</div>
          <div>Actor: <span className="text-[#20252B]">{user?.email}</span></div>
          <div>Incident: <span className="text-[#B84242] font-semibold">UNAUTHORIZED_ACCESS_ATTEMPT</span></div>
          <div>Timestamp: <span className="text-[#20252B]">{new Date().toISOString()}</span></div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="text-xs text-[#68717C] font-semibold uppercase tracking-wider">
            Judge Demo Quick Switch
          </div>
          <div className="flex justify-center gap-2">
            {(['rm', 'manager', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  user?.role === r
                    ? 'bg-[#2457A6] text-white shadow-xs'
                    : 'bg-[#ECEAE4] text-[#68717C] hover:text-[#20252B] border border-[#D8D5CD]'
                }`}
              >
                Switch {r}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-[#D8D5CD]">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-[#2457A6] hover:text-[#183B70] font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Safe Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
