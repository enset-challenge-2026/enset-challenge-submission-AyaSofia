
import React from 'react';
import { AppTab, StudentProfile, Application, Internship, CVAnalysisResult } from '../types';

interface DashboardProps {
  profile: StudentProfile;
  cvAnalysis: CVAnalysisResult | null;
  applications: Application[];
  recommendations: Internship[];
  onNavigate: (tab: AppTab) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, cvAnalysis, applications, recommendations, onNavigate }) => {
  const stats = [
    { label: 'Applications', value: applications.length, icon: 'fa-paper-plane', color: 'blue' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'Interviewing').length, icon: 'fa-comments', color: 'green' },
    { label: 'Matches Found', value: recommendations.length, icon: 'fa-bolt', color: 'amber' },
    { label: 'Profile Completion', value: profile.fullName ? '85%' : '20%', icon: 'fa-check-circle', color: 'indigo' },
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-600';
      case 'green': return 'bg-emerald-50 text-emerald-600';
      case 'amber': return 'bg-amber-50 text-amber-600';
      case 'indigo': return 'bg-indigo-50 text-indigo-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClass(stat.color)}`}>
                <i className={`fas ${stat.icon} text-xl`}></i>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Recent AI Recommendations</h3>
              <button onClick={() => onNavigate(AppTab.FINDER)} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
            </div>
            
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.slice(0, 3).map((job) => (
                  <div key={job.id} className="group flex items-start p-4 rounded-xl border border-slate-50 hover:border-indigo-100 hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                      {job.company.charAt(0)}
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                      <p className="text-sm text-slate-500">{job.company} • {job.location}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        {job.relevanceScore}% Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <i className="fas fa-search text-2xl"></i>
                </div>
                <p className="text-slate-500 font-medium">No matches yet. Upload your CV to get started!</p>
                <button 
                  onClick={() => onNavigate(AppTab.PROFILE)}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all"
                >
                  Upload CV
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Application Status</h3>
            {applications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                      <th className="pb-4">Position</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app.id}>
                        <td className="py-4">
                          <p className="font-semibold text-slate-800">{app.internshipTitle}</p>
                          <p className="text-xs text-slate-500">{app.company}</p>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            app.status === 'Applied' ? 'bg-blue-50 text-blue-600' :
                            app.status === 'Interviewing' ? 'bg-amber-50 text-amber-600' :
                            app.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-slate-500">
                          {new Date(app.dateApplied).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-6 italic">No applications sent yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200">
            <h4 className="text-xl font-bold mb-2">Career Readiness</h4>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
              Our AI thinks you're mostly ready for Junior Developer roles! Complete 2 more coding projects to hit 100%.
            </p>
            <div className="relative h-4 bg-indigo-900/30 rounded-full overflow-hidden mb-8">
              <div className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
            </div>
            <button
              onClick={() => onNavigate(AppTab.CV_ANALYZER)}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-xl font-bold text-sm transition-all backdrop-blur-sm"
            >
              See Detailed Analysis
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">CV Keywords Found</h3>
            <div className="flex flex-wrap gap-2">
              {cvAnalysis ? (
                cvAnalysis.extractedSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">{skill}</span>
                ))
              ) : (
                <p className="text-slate-400 text-sm italic">Analysis pending CV upload.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
