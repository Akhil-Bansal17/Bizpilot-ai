import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, currentBusiness, businesses, setCurrentBusiness, logout } = useAuthStore();

  const navigationItems = [
    { name: 'Dashboard', active: true, icon: '📊' },
    { name: 'Menu & Recipes', active: false, icon: '🍽️', badge: 'Phase 3' },
    { name: 'Inventory & Stock', active: false, icon: '📦', badge: 'Phase 4' },
    { name: 'Sales & POS', active: false, icon: '💳', badge: 'Phase 5' },
    { name: 'Demand Forecasting', active: false, icon: '📈', badge: 'Phase 6' },
    { name: 'AI Recommendations', active: false, icon: '🧠', badge: 'Phase 7' },
    { name: 'BizPilot AI Copilot', active: false, icon: '✨', badge: 'Phase 8' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between p-4 backdrop-blur-lg">
        <div>
          {/* Brand Header */}
          <div className="flex items-center space-x-3 px-2 py-3 border-b border-slate-800/80 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 font-bold text-white shadow-md shadow-indigo-500/20">
              BP
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">BizPilot AI</h1>
              <span className="text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">Modular Monolith</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <div
                key={item.name}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  item.active
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 cursor-not-allowed opacity-75'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800/80 pt-4 px-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Status: <span className="text-emerald-400 font-semibold">Online</span></span>
            <span>v0.1.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 px-6 flex items-center justify-between backdrop-blur-md">
          {/* Left: Business Context Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Business:</span>
            {businesses.length > 1 ? (
              <select
                value={currentBusiness?.id || ''}
                onChange={(e) => {
                  const bus = businesses.find((b) => b.id === e.target.value);
                  if (bus) setCurrentBusiness(bus);
                }}
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-sm font-semibold text-white focus:border-indigo-500 focus:outline-none"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.role || 'Member'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-1.5 text-sm font-semibold text-white">
                <span>{currentBusiness?.name || 'Default Business'}</span>
                {currentBusiness?.role && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    {currentBusiness.role}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: Authenticated User Profile & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{user?.full_name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
};
