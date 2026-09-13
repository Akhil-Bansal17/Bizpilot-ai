import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Boxes, 
  Receipt, 
  Trash2, 
  LineChart, 
  TrendingUp, 
  Sparkles, 
  Bell, 
  Bot, 
  Settings 
} from 'lucide-react';

interface ShellLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, active: true },
  { name: 'Sales', icon: ShoppingBag, badge: 'Phase 4' },
  { name: 'Inventory', icon: Boxes, badge: 'Phase 5' },
  { name: 'Menu', icon: UtensilsCrossed, badge: 'Phase 3' },
  { name: 'Purchases', icon: Receipt, badge: 'Phase 5' },
  { name: 'Waste Tracking', icon: Trash2, badge: 'Phase 5' },
  { name: 'Finance Analytics', icon: LineChart, badge: 'Phase 6' },
  { name: 'Forecasting', icon: TrendingUp, badge: 'Phase 7' },
  { name: 'Recommendations', icon: Sparkles, badge: 'Phase 8' },
  { name: 'Alerts', icon: Bell, badge: 'Phase 9' },
  { name: 'AI Copilot', icon: Bot, badge: 'Phase 9' },
  { name: 'Settings', icon: Settings, badge: 'Phase 2' },
];

export const ShellLayout: React.FC<ShellLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center font-extrabold font-heading text-white shadow-lg glow-brand">
              BP
            </div>
            <div>
              <h1 className="font-bold text-base font-heading tracking-wide text-white">BizPilot AI</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-tighter">RESTAURANT COPILOT</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-not-allowed transition-colors ${
                    item.active
                      ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${item.active ? 'text-brand-400' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700/50">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500">
          <p className="font-semibold text-slate-400">BizPilot AI v0.1.0</p>
          <p className="text-[10px] text-slate-600">Phase 1 Foundation Active</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 px-8 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs text-slate-400">Environment: </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Development</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-400 font-mono">FastAPI + PostgreSQL + React</span>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
