
import React from 'react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Students', value: '2,450', icon: 'fa-users', color: 'blue' },
    { label: 'Active Companies', value: '382', icon: 'fa-building', color: 'indigo' },
    { label: 'AI Matches (24h)', value: '1,240', icon: 'fa-bolt', color: 'amber' },
    { label: 'Successful Placements', value: '185', icon: 'fa-award', color: 'emerald' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4 text-amber-800">
        <i className="fas fa-shield-alt text-2xl mt-1"></i>
        <div>
          <h4 className="font-bold">Administrator Access</h4>
          <p className="text-sm">You are currently viewing the system as an administrator. Only global statistics and system health are shown here.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
                <i className={`fas ${stat.icon} text-xl`}></i>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-300 w-2/3"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Recent System Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-1 bg-indigo-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">New CV Analysis completed</p>
                  <p className="text-xs text-slate-500">2 minutes ago • Student ID: #XJ-1293</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Top Partner Companies</h3>
          <div className="space-y-4">
            {['TechNova', 'Quantum Soft', 'EcoStream', 'Nexus Labs', 'SkyHigh'].map((c, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                    {c.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-700">{c}</span>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{12 + i * 5} listings</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
