import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CompanyProfile } from '../../types';

interface DashboardStats {
  totalInternships: number;
  activeInternships: number;
  totalApplications: number;
}

interface ApplicationStats {
  NEW: number;
  REVIEWING: number;
  SHORTLISTED: number;
  INTERVIEW: number;
  OFFER: number;
  ACCEPTED: number;
  REJECTED: number;
}

interface RecentApplication {
  id: string;
  internship: { title: string };
  user: {
    email: string;
    profile: {
      fullName: string;
    } | null;
  };
  status: string;
  appliedAt: string;
}

interface CompanyDashboardProps {
  profile: CompanyProfile;
  onNavigate: (tab: string) => void;
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ profile, onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appStats, setAppStats] = useState<ApplicationStats | null>(null);
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          api.getCompanyStats(),
          api.getCompanyApplications(),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (appsRes.success && appsRes.data) {
          // Calculate application stats
          const appStatsCounts: ApplicationStats = {
            NEW: 0,
            REVIEWING: 0,
            SHORTLISTED: 0,
            INTERVIEW: 0,
            OFFER: 0,
            ACCEPTED: 0,
            REJECTED: 0,
          };
          appsRes.data.forEach((app) => {
            if (app.status in appStatsCounts) {
              appStatsCounts[app.status as keyof ApplicationStats]++;
            }
          });
          setAppStats(appStatsCounts);

          // Get recent applications (last 5)
          setRecentApps(appsRes.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    REVIEWING: 'bg-yellow-100 text-yellow-800',
    SHORTLISTED: 'bg-purple-100 text-purple-800',
    INTERVIEW: 'bg-orange-100 text-orange-800',
    OFFER: 'bg-green-100 text-green-800',
    ACCEPTED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    NEW: 'New',
    REVIEWING: 'Reviewing',
    SHORTLISTED: 'Shortlisted',
    INTERVIEW: 'Interview',
    OFFER: 'Offer',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {profile.name}!</h1>
        <p className="text-white/80">
          Here's an overview of your recruiting activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Internships</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.activeInternships || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Applications</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.totalApplications || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">In Interview</p>
              <p className="text-2xl font-bold text-slate-800">{appStats?.INTERVIEW || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Application Pipeline</h3>
          <div className="space-y-3">
            {appStats && Object.entries(appStats).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium w-24 text-center ${statusColors[status]}`}>
                  {statusLabels[status]}
                </span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${status === 'REJECTED' ? 'bg-red-400' : 'bg-indigo-500'} rounded-full transition-all`}
                    style={{
                      width: `${stats?.totalApplications ? (count / stats.totalApplications) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent Applications</h3>
            <button
              onClick={() => onNavigate('APPLICATIONS')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all
            </button>
          </div>

          {recentApps.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No applications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {app.user.profile?.fullName?.charAt(0) || app.user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">
                      {app.user.profile?.fullName || app.user.email}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{app.internship.title}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[app.status]}`}>
                    {statusLabels[app.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('INTERNSHIPS')}
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800">Post New Internship</p>
              <p className="text-sm text-slate-500">Create a new listing</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('APPLICATIONS')}
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800">Review Applications</p>
              <p className="text-sm text-slate-500">Manage candidates</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('PROFILE')}
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800">Edit Profile</p>
              <p className="text-sm text-slate-500">Update company info</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
