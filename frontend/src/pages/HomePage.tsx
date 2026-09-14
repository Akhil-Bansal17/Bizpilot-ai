import React, { useState } from 'react';
import { HealthStatus } from '../components/HealthStatus';
import { ShieldCheck, Layers, Building, Key } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../api/client';

export const HomePage: React.FC = () => {
  const { user, currentBusiness, fetchCurrentUser } = useAuthStore();
  const [newBusinessName, setNewBusinessName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [businessMsg, setBusinessMsg] = useState<string | null>(null);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusinessName.trim()) return;
    setIsCreating(true);
    setBusinessMsg(null);
    try {
      await api.createBusiness({ name: newBusinessName.trim() });
      setNewBusinessName('');
      setBusinessMsg('Business created successfully!');
      await fetchCurrentUser();
    } catch (err) {
      setBusinessMsg(err instanceof Error ? err.message : 'Failed to create business');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Header */}
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight">
            Welcome, {user?.full_name || 'Restaurateur'}
          </h1>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Authenticated Session
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          Phase 2 Identity & Business Ownership Active. Tenant context established for <span className="text-indigo-400 font-semibold">{currentBusiness?.name}</span> ({currentBusiness?.currency} / {currentBusiness?.timezone}).
        </p>
      </div>

      {/* Health Status Component */}
      <HealthStatus />

      {/* Business Ownership & Tenant Context Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Active Business Context</h2>
              <p className="text-xs text-slate-400">Strict ownership and isolation boundary</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            ID: {currentBusiness?.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Business Name</span>
            <p className="text-sm font-semibold text-white mt-0.5">{currentBusiness?.name}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Type</span>
            <p className="text-sm font-semibold text-white mt-0.5">{currentBusiness?.business_type}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">User Role</span>
            <p className="text-sm font-semibold text-indigo-400 uppercase mt-0.5">{currentBusiness?.role || 'Owner'}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Currency / Timezone</span>
            <p className="text-sm font-semibold text-white mt-0.5">{currentBusiness?.currency} ({currentBusiness?.timezone})</p>
          </div>
        </div>

        {/* Create Additional Business Form */}
        <div className="border-t border-slate-800/80 pt-4 mt-4">
          <form onSubmit={handleCreateBusiness} className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Create additional business location..."
              value={newBusinessName}
              onChange={(e) => setNewBusinessName(e.target.value)}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isCreating || !newBusinessName.trim()}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : '+ Add Location'}
            </button>
          </form>
          {businessMsg && (
            <p className="text-xs mt-2 text-indigo-400">{businessMsg}</p>
          )}
        </div>
      </div>

      {/* Architectural Principles Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-heading text-slate-100">Modular Monolith</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Clean internal boundaries for Auth, Business Context, Menu, Sales, Inventory, Forecasting, and Copilot.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-heading text-slate-100">Tenant Data Isolation</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Every business-owned entity is strictly authorized by backend membership context. User A cannot access User B resources.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-heading text-slate-100">JWT & Password Hashing</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Bcrypt password hashing, Bearer JWT session management, and stateful frontend Zustand store integration.
          </p>
        </div>
      </div>
    </div>
  );
};
