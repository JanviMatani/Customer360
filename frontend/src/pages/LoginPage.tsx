import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Shield, Building2, ArrowRight, Info, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLockedOut, lockoutTimeRemaining } = useAuthStore();
  const [email, setEmail] = useState('rm.anita@bank.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

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
        setError(res.error || 'Invalid credentials or account locked.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F0F2F5] flex flex-col justify-between p-6 text-[#1E293B] font-sans">
      {/* Top Brand Indicator */}
      <div className="flex items-center gap-2 max-w-md mx-auto w-full pt-4">
        <div className="w-8 h-8 rounded bg-[#1B4FD8] flex items-center justify-center text-white">
          <Building2 size={16} />
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
            Enterprise Identity Hub
          </div>
          <div className="text-xs font-semibold text-gray-800 leading-none">
            Choice TechLab Core
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="bg-white rounded-lg border border-[#D8D5CD] shadow-sm p-6 space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Sign In to Customer 360
            </h1>
            <p className="text-xs text-gray-500">
              Access the Golden Record identity & opportunity repository.
            </p>
          </div>

          {isLockedOut && (
            <div className="p-2.5 rounded border border-red-200 bg-red-50 text-red-700 text-2xs font-mono text-center">
              Security lockout active. Try again in {lockoutTimeRemaining}s.
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded border border-red-200 bg-red-50 text-red-600 text-2xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Corporate Email
              </label>
              <input
                type="text"
                placeholder="email@firm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-gray-300 bg-gray-50 focus:bg-white focus:border-[#1B4FD8] focus:ring-1 focus:ring-[#1B4FD8] focus:outline-none transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-gray-300 bg-gray-50 focus:bg-white focus:border-[#1B4FD8] focus:ring-1 focus:ring-[#1B4FD8] focus:outline-none transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLockedOut}
              className="w-full py-2 rounded bg-[#1B4FD8] hover:bg-[#113CAD] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Access Platform'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Collapsible Helper Panel for Demo Verification */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowHelper(!showHelper)}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 font-semibold uppercase tracking-wider"
            >
              <Info size={11} />
              <span>{showHelper ? 'Hide' : 'Show'} Demo Accounts</span>
            </button>

            {showHelper && (
              <div className="mt-2 p-2 bg-[#F8FAFC] border border-gray-200 rounded text-[11px] font-mono space-y-1 text-gray-600">
                <button type="button" onClick={() => { setEmail('rm.anita@bank.com'); setPassword('Password123!'); }} className="w-full text-left hover:bg-blue-50 rounded px-1 py-0.5 transition-colors">
                  <span className="font-semibold text-blue-700">RM:</span> rm.anita@bank.com
                </button>
                <button type="button" onClick={() => { setEmail('manager.vikram@bank.com'); setPassword('Password123!'); }} className="w-full text-left hover:bg-emerald-50 rounded px-1 py-0.5 transition-colors">
                  <span className="font-semibold text-emerald-700">Manager:</span> manager.vikram@bank.com
                </button>
                <button type="button" onClick={() => { setEmail('admin@bank.com'); setPassword('Admin123!'); }} className="w-full text-left hover:bg-red-50 rounded px-1 py-0.5 transition-colors">
                  <span className="font-semibold text-red-700">Admin:</span> admin@bank.com
                </button>
                <div className="text-[10px] text-gray-400 border-t border-gray-200 pt-1 mt-1">Click a role to auto-fill credentials</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance / Regulatory Footer */}
      <div className="max-w-md mx-auto w-full pb-4 text-center text-[10px] text-gray-400 space-y-1">
        <div className="flex items-center justify-center gap-3 font-semibold">
          <span className="flex items-center gap-1">
            <Shield size={10} className="text-emerald-600" />
            DPDP ACT 2023 COMPLIANT
          </span>
          <span>•</span>
          <span>ROLE ACCESS ENFORCED</span>
          <span>•</span>
          <span>SYSTEM AUDITING ON</span>
        </div>
        <div className="font-mono text-[9px] opacity-75">
          PS-04 Core Engine v1.0 • JWT Authentication Required
        </div>
      </div>
    </div>
  );
};
