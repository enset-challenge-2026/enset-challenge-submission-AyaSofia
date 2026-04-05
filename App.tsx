import React, { useState, useEffect } from 'react';
import { AppTab, CompanyTab, AdminTab, StudentProfile, CompanyProfile as CompanyProfileType, Application, Internship, CVAnalysisResult } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import CVPerformanceAnalyzer from './components/CVPerformanceAnalyzer';
import InternshipFinder from './components/InternshipFinder';
import History from './components/History';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminCompanies from './components/admin/AdminCompanies';
import AdminInternships from './components/admin/AdminInternships';
import Auth from './components/Auth';
import CompanyProfile from './components/company/CompanyProfile';
import InternshipList from './components/company/InternshipList';
import ApplicationKanban from './components/company/ApplicationKanban';
import CompanyDashboard from './components/company/CompanyDashboard';
import RealInternshipBrowser from './components/RealInternshipBrowser';
import Settings from './components/Settings';
import api from './services/api';

// Student App Content
const StudentAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [profile, setProfile] = useState<StudentProfile>({
    fullName: '',
    email: '',
    education: '',
    skills: [],
    interests: [],
    location: ''
  });
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysisResult | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<Internship[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;

      try {
        const [profileRes, appsRes, cvRes] = await Promise.all([
          api.getProfile(),
          api.getApplications(),
          api.getLatestCVAnalysis(),
        ]);

        if (profileRes.success && profileRes.data) {
          setProfile({
            fullName: profileRes.data.fullName,
            email: profileRes.data.email,
            education: profileRes.data.education || '',
            skills: profileRes.data.skills,
            interests: profileRes.data.interests,
            location: profileRes.data.location || '',
          });
        }

        if (appsRes.success && appsRes.data) {
          setApplications(appsRes.data.map(app => ({
            ...app,
            status: app.status as Application['status'],
          })));
        }

        if (cvRes.success && cvRes.data) {
          setCvAnalysis(cvRes.data);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const updateProfile = async (newProfile: StudentProfile) => {
    try {
      await api.updateProfile({
        fullName: newProfile.fullName,
        education: newProfile.education,
        skills: newProfile.skills,
        interests: newProfile.interests,
        location: newProfile.location,
      });
      setProfile(newProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleApply = async (internship: Internship) => {
    try {
      const response = await api.createApplication({
        internshipId: internship.id,
        internshipTitle: internship.title,
        company: internship.company,
      });

      if (response.success && response.data) {
        const newApp: Application = {
          id: (response.data as { id: string }).id,
          internshipId: internship.id,
          internshipTitle: internship.title,
          company: internship.company,
          status: 'Applied',
          dateApplied: new Date().toISOString(),
        };
        setApplications([newApp, ...applications]);
      }
    } catch (error) {
      console.error('Failed to apply:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <Dashboard
          profile={profile}
          cvAnalysis={cvAnalysis}
          applications={applications}
          recommendations={recommendations}
          onNavigate={setActiveTab}
        />;
      case AppTab.PROFILE:
        return <Profile
          profile={profile}
          onSave={updateProfile}
          cvAnalysis={cvAnalysis}
          setCvAnalysis={setCvAnalysis}
        />;
      case AppTab.CV_ANALYZER:
        return <CVPerformanceAnalyzer />;
      case AppTab.FINDER:
        return <InternshipFinder
          profile={profile}
          cvAnalysis={cvAnalysis}
          recommendations={recommendations}
          setRecommendations={setRecommendations}
          onApply={handleApply}
          appliedIds={applications.map(a => a.internshipId)}
        />;
      case AppTab.BROWSE:
        return <RealInternshipBrowser />;
      case AppTab.HISTORY:
        return <History applications={applications} setApplications={setApplications} />;
      case AppTab.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard
          profile={profile}
          cvAnalysis={cvAnalysis}
          applications={applications}
          recommendations={recommendations}
          onNavigate={setActiveTab}
        />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto animate-fadeIn">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Company App Content
const CompanyAppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<CompanyTab>(CompanyTab.DASHBOARD);
  const [profile, setProfile] = useState<CompanyProfileType | null>(null);

  useEffect(() => {
    if (user && user.userType === 'company') {
      setProfile({
        id: user.id,
        email: user.email,
        name: user.name,
        siret: user.siret,
        sector: user.sector,
        description: user.description,
        logoUrl: user.logoUrl,
        website: user.website,
        location: user.location,
        verified: user.verified,
      });
    }
  }, [user]);

  const handleProfileUpdate = (updatedProfile: CompanyProfileType) => {
    setProfile(updatedProfile);
  };

  const handleNavigate = (tab: string) => {
    const tabMap: Record<string, CompanyTab> = {
      DASHBOARD: CompanyTab.DASHBOARD,
      PROFILE: CompanyTab.PROFILE,
      INTERNSHIPS: CompanyTab.INTERNSHIPS,
      APPLICATIONS: CompanyTab.APPLICATIONS,
    };
    if (tabMap[tab]) {
      setActiveTab(tabMap[tab]);
    }
  };

  const renderContent = () => {
    if (!profile) return null;

    switch (activeTab) {
      case CompanyTab.PROFILE:
        return <CompanyProfile profile={profile} onProfileUpdate={handleProfileUpdate} />;
      case CompanyTab.INTERNSHIPS:
        return <InternshipList />;
      case CompanyTab.APPLICATIONS:
        return <ApplicationKanban />;
      case CompanyTab.DASHBOARD:
      default:
        return <CompanyDashboard profile={profile} onNavigate={handleNavigate} />;
    }
  };

  const tabs = [
    { id: CompanyTab.DASHBOARD, label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: CompanyTab.PROFILE, label: 'Profile', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: CompanyTab.INTERNSHIPS, label: 'Internships', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: CompanyTab.APPLICATIONS, label: 'Applications', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Company Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-slate-800">InternMatch</h1>
              <p className="text-xs text-slate-500">Company Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              {profile && (
                <p className="text-sm text-slate-500">{profile.name}</p>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Admin App Content
const AdminAppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.DASHBOARD);

  const tabs = [
    { id: AdminTab.DASHBOARD, label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: AdminTab.USERS, label: 'Users', icon: 'fa-users' },
    { id: AdminTab.COMPANIES, label: 'Companies', icon: 'fa-building' },
    { id: AdminTab.INTERNSHIPS, label: 'Internships', icon: 'fa-briefcase' },
    { id: AdminTab.ANALYTICS, label: 'Analytics', icon: 'fa-chart-bar' },
    { id: AdminTab.SETTINGS, label: 'Settings', icon: 'fa-cog' },
  ];

  const adminName = user?.userType === 'admin' ? user.name : 'Admin';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Admin Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-shield-alt text-white"></i>
            </div>
            <div>
              <h1 className="font-bold text-white">InternMatch</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${tab.icon} w-5`}></i>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{adminName}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-slate-500">System Administration</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                Admin Access
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === AdminTab.DASHBOARD && <AdminDashboard />}
            {activeTab === AdminTab.USERS && <AdminUsers />}
            {activeTab === AdminTab.COMPANIES && <AdminCompanies />}
            {activeTab === AdminTab.INTERNSHIPS && <AdminInternships />}
            {activeTab === AdminTab.ANALYTICS && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Platform Analytics</h3>
                <p className="text-slate-500">View detailed metrics, user engagement, and platform performance.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Total Page Views</p>
                    <p className="text-2xl font-bold text-slate-800">12,543</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Avg. Session Duration</p>
                    <p className="text-2xl font-bold text-slate-800">4m 32s</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Conversion Rate</p>
                    <p className="text-2xl font-bold text-slate-800">8.2%</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === AdminTab.SETTINGS && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">System Settings</h3>
                <p className="text-slate-500 mb-6">Configure platform settings and system preferences.</p>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
                    <input type="text" defaultValue="InternMatch AI" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                    <input type="email" defaultValue="support@internmatch.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-slate-700">Enable email notifications</span>
                    </label>
                  </div>
                  <button className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Main App Content - Routes based on user type
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, userType } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-sky-500 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  // Route based on user type
  if (userType === 'admin') {
    return <AdminAppContent />;
  }

  if (userType === 'company') {
    return <CompanyAppContent />;
  }

  return <StudentAppContent />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
