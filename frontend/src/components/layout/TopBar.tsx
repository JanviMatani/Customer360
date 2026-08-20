import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck, Wifi, WifiOff } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const roleStyles = {
    rm: { bg: '#EBF1FA', text: '#1B4FD8', border: '#BCD1F0', label: 'Relationship Manager' },
    manager: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', label: 'Branch Manager' },
    admin: { bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5', label: 'System Admin' },
  };

  const style = user ? roleStyles[user.role] : roleStyles.rm;

  return (
    <header
      className="h-12 border-b border-[#D8D5CD] bg-white px-4 flex items-center justify-between z-20 shrink-0"
    >
      {/* Left section: Title & Environment */}
      <div className="flex items-center gap-3">
        <h1 className="text-xs font-bold text-gray-900 tracking-wide uppercase">
          Financial Customer 360 & Next-Best-Action
        </h1>
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
          <span className="font-semibold">{isOnline ? 'CONNECTED' : 'OFFLINE MODE'}</span>
        </div>
      </div>

      {/* Right section: User profile (No switching buttons!) */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5 justify-end">
              <ShieldCheck size={12} className="text-[#1B4FD8]" />
              {user.name}
            </span>
            <div className="text-[10px] text-gray-500 font-mono leading-none mt-0.5">
              {user.email}
            </div>
          </div>
          
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded border tracking-wider"
            style={{
              backgroundColor: style.bg,
              color: style.text,
              borderColor: style.border,
            }}
          >
            {style.label.toUpperCase()}
          </span>
        </div>
      )}
    </header>
  );
};
