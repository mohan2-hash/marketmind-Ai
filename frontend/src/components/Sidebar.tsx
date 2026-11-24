import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  LineChart,
  Building2,
  BrainCircuit,
  ShieldAlert,
  History,
  Scale,
  Briefcase,
  Bookmark,
  Newspaper,
  GraduationCap,
  Bot,
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react';

interface SidebarProps {
  currentMarket: 'IN' | 'US';
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMarket }) => {
  const navSections = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Market Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Stock Explorer', path: '/explorer', icon: Compass },
        { label: 'Live Stock Details', path: '/stocks/RELIANCE', icon: Activity },
      ],
    },
    {
      group: 'INTELLIGENCE & AI',
      items: [
        { label: 'AI Prediction Centre', path: '/predictions', icon: BrainCircuit },
        { label: 'Technical Analysis', path: '/technical', icon: LineChart },
        { label: 'Fundamental Analysis', path: '/fundamentals', icon: Building2 },
        { label: 'Risk Analysis', path: '/risk', icon: ShieldAlert },
        { label: 'AI News Intelligence', path: '/news', icon: Newspaper },
      ],
    },
    {
      group: 'STRATEGY & TOOLS',
      items: [
        { label: 'Stock Comparison', path: '/compare', icon: Scale },
        { label: 'Backtesting Lab', path: '/backtest', icon: History },
        { label: 'Portfolio Simulator', path: '/portfolio', icon: Briefcase },
        { label: 'Watchlist & Alerts', path: '/watchlist', icon: Bookmark },
      ],
    },
    {
      group: 'SUPPORT & EDUCATION',
      items: [
        { label: 'AI Financial Assistant', path: '/assistant', icon: Bot },
        { label: 'Learning Centre', path: '/learning', icon: GraduationCap },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-navy-950 border-r border-navy-800 flex flex-col justify-between select-none h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-navy-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-blue/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-white tracking-wide text-base block leading-none">
              MarketMind <span className="text-brand-cyan font-mono">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">
              {currentMarket === 'IN' ? 'NSE / BSE TERMINAL' : 'US MARKET TERMINAL'}
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wider text-slate-500 px-3 uppercase">
                {sec.group}
              </span>
              {sec.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-blue/20 text-brand-cyan border border-brand-blue/30 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-navy-850'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-navy-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="font-mono">v1.0.0 Prod</span>
        <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Engine Online
        </span>
      </div>
    </aside>
  );
};
