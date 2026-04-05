
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen }) => {
  const menuItems = [
    { id: AppTab.DASHBOARD, icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: AppTab.PROFILE, icon: 'fa-user-graduate', label: 'Student Profile' },
    { id: AppTab.CV_ANALYZER, icon: 'fa-chart-line', label: 'CV Analyzer' },
    { id: AppTab.FINDER, icon: 'fa-search', label: 'AI Matching' },
    { id: AppTab.BROWSE, icon: 'fa-briefcase', label: 'Browse Internships' },
    { id: AppTab.HISTORY, icon: 'fa-history', label: 'My Applications' },
    { id: AppTab.SETTINGS, icon: 'fa-cog', label: 'Settings' },
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 hidden md:flex flex-col h-full z-20`}>
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <i className="fas fa-graduation-cap text-lg"></i>
        </div>
        {isOpen && <h1 className="font-bold text-xl text-slate-800 tracking-tight">InternMatch</h1>}
      </div>

      <nav className="flex-1 mt-6 px-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id
                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <i className={`fas ${item.icon} w-6 text-center text-lg`}></i>
            {isOpen && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className={`p-4 rounded-2xl bg-slate-900 text-white transition-all ${!isOpen ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upgrade Pro</p>
          <p className="text-sm text-slate-300 mb-3 leading-relaxed">Get 10x more AI analysis tokens and priority matching.</p>
          <button className="w-full bg-indigo-500 hover:bg-indigo-400 py-2 rounded-lg text-sm font-semibold transition-colors">Go Pro</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
