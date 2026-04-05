import React, { useState } from 'react';
import { AppTab } from '../types';
import { useAuth } from '../contexts/AuthContext';
import NotificationPanel from './ui/NotificationPanel';

interface HeaderProps {
  activeTab: AppTab;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications - in a real app, these would come from the backend
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Application Update',
      message: 'Your application to TechCorp has been reviewed.',
      type: 'info' as const,
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      title: 'New Match Found',
      message: 'We found 3 new internships matching your profile!',
      type: 'success' as const,
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      title: 'Profile Tip',
      message: 'Complete your profile to get better matches.',
      type: 'warning' as const,
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getTitle = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: return 'Overview';
      case AppTab.PROFILE: return 'Student Profile';
      case AppTab.CV_ANALYZER: return 'CV Performance Analyzer';
      case AppTab.FINDER: return 'Internship Opportunities';
      case AppTab.BROWSE: return 'Browse Internships';
      case AppTab.HISTORY: return 'Application History';
      case AppTab.SETTINGS: return 'Account Settings';
      default: return 'Dashboard';
    }
  };

  const userName = user?.userType === 'student' ? user.profile?.fullName || 'User' : 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{getTitle()}</h2>
        <p className="text-sm text-slate-500 font-medium">Welcome back, {userName.split(' ')[0]}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-2 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 text-sm w-64 transition-all"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{unreadCount}</span>
              </span>
            )}
          </button>

          <NotificationPanel
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{userName}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
            {userInitials}
          </div>
          <button
            onClick={logout}
            className="ml-2 px-3 py-1.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
