import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import {
  Shield,
  Building2,
  User,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowRight,
  Check,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLockedOut, lockoutTimeRemaining } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('rm');
  const [email, setEmail] = useState('rm1@firm.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const personas: Array<{
    role: UserRole;
    label: string;
    name: string;
    email: string;
    desc: string;
    icon: typeof User;
  }> = [
    {
      role: 'rm',
      label: 'Relationship Mgr',
      name: 'Arjun Mehta (RM)',
      email: 'rm1@firm.com',
      desc: 'Customer 360, Cross-Sell Opportunities & Portfolio Actions',
      icon: User,
    },
    {
      role: 'manager',
      label: 'Branch Manager',
      name: 'Sunita Deshmukh',
      email: 'manager@firm.com',
      desc: 'Territory Review Queues, Pipeline Governance & Team TRV',
      icon: Building2,
    },
    {
      role: 'admin',
      label: 'System Admin',
      name: 'Devraj Kapoor',
      email: 'admin@firm.com',
      desc: 'Match Weights, Cross-Sell Qualification Rules & Audit Trail',
      icon: Sliders,
    },
  ];

  const handleSelectPersona = (p: typeof personas[0]) => {
    setSelectedRole(p.role);
    setEmail(p.email);
    setPassword('demo123');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Invalid credentials or locked out');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F2ED] flex flex-col justify-center items-center p-6 text-[#20252B] font-sans relative">
      <div className="w-full max-w-lg space-y-5">
        {/* Bank / Organization Logo & System Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#2457A6] text-white font-bold text-lg mb-1 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EBF1FA] border border-[#BCD1F0] text-[#2457A6] text-[11px] font-semibold uppercase tracking-wider block w-fit mx-auto">
            <Shield className="w-3 h-3" />
            Enterprise Financial Core
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20252B] tracking-tight">
            Customer 360 & Opportunity Engine
          </h1>
          <p className="text-xs text-[#68717C] max-w-md mx-auto leading-relaxed">
            Multi-silo identity stitching, attribute resolution & next-best cross-sell intelligence
          </p>
        </div>

        {/* Lockout Warning */}
        {isLockedOut && (
          <div className="p-3.5 rounded-md border border-[#E8B8B8] bg-[#F9ECEC] text-[#B84242] text-xs text-center font-mono">
            Security lock active: Too many failed attempts. Try again in {lockoutTimeRemaining}s.
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-md border border-[#E8B8B8] bg-[#F9ECEC] text-[#B84242] text-xs text-center">
            {error}
          </div>
        )}

        {/* Unified Sign In Card (Persona Selector + Credentials in One Card) */}
        <div className="p-6 rounded-lg border border-[#D8D5CD] bg-[#FFFFFF] shadow-xs space-y-5">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D5CD]">
              <h2 className="text-xs font-bold text-[#20252B] uppercase tracking-wider">
                1. Select Demo Persona
              </h2>
              <span className="text-[10px] font-mono text-[#68717C]">1-Click Profile Provisioning</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
              {personas.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedRole === p.role;
                return (
                  <button
                    key={p.role}
                    type="button"
                    id={`login-as-${p.role}`}
                    onClick={() => handleSelectPersona(p)}
                    className={`p-3 rounded-md border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2457A6] bg-[#EBF1FA] shadow-xs'
                        : 'border-[#D8D5CD] bg-[#FFFFFF] hover:bg-[#F4F2ED]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#2457A6]' : 'text-[#68717C]'}`} />
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#2457A6] text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div className={`font-bold text-xs ${isSelected ? 'text-[#2457A6]' : 'text-[#20252B]'}`}>
                        {p.label}
                      </div>
                      <div className="text-[10px] text-[#68717C] truncate mt-0.5">{p.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-1 border-t border-[#D8D5CD]">
            <div className="text-[11px] font-bold text-[#68717C] uppercase tracking-wider">
              2. Operator Credentials
            </div>

            <div>
              <label className="block text-[#68717C] font-semibold mb-1 text-[11px] uppercase tracking-wider">
                Corporate Email / Identifier
              </label>
              <input
                type="text"
                placeholder="e.g. rm1@firm.com or admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[#20252B] text-xs focus:border-[#2457A6] focus:ring-1 focus:ring-[#2457A6] focus:outline-hidden transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[#68717C] font-semibold mb-1 text-[11px] uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-md bg-[#FFFFFF] border border-[#D8D5CD] text-[#20252B] text-xs focus:border-[#2457A6] focus:ring-1 focus:ring-[#2457A6] focus:outline-hidden transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isLockedOut}
              id="login-submit-btn"
              className="w-full py-2.5 rounded-md bg-[#2457A6] hover:bg-[#183B70] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Authenticating Personnel...' : `Sign In as ${selectedRole.toUpperCase()}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Discreet Compliance Footer */}
        <div className="text-center text-[11px] text-[#68717C] space-y-1">
          <div className="flex items-center justify-center gap-3">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#287A52]" />
              DPDP Act 2023 Masking
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#287A52]" />
              RBAC Guard
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#287A52]" />
              Immutable Audit
            </span>
          </div>
          <div className="font-mono text-[10px] opacity-75">PS-04 Enterprise Financial Customer 360 Core</div>
        </div>
      </div>
    </div>
  );
};
