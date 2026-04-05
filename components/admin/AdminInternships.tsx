import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface Internship {
  id: string;
  title: string;
  companyName: string;
  location: string;
  locationType: string;
  isActive: boolean;
  applicationsCount: number;
  createdAt: string;
}

const AdminInternships: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const response = await api.getAdminInternships();
        if (response.success && response.data) {
          setInternships(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load internships');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInternships();
  }, []);

  const filteredInternships = internships.filter(internship => {
    const matchesSearch =
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && internship.isActive) ||
      (filterStatus === 'inactive' && !internship.isActive);

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'REMOTE': return { label: 'Remote', color: 'bg-green-50 text-green-600' };
      case 'ONSITE': return { label: 'On-site', color: 'bg-blue-50 text-blue-600' };
      case 'HYBRID': return { label: 'Hybrid', color: 'bg-purple-50 text-purple-600' };
      default: return { label: type, color: 'bg-slate-50 text-slate-600' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Internship Listings</h3>
            <p className="text-sm text-slate-500">
              {internships.length} internships ({internships.filter(i => i.isActive).length} active)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Search internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {filteredInternships.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 pr-4">Position</th>
                  <th className="pb-3 pr-4">Company</th>
                  <th className="pb-3 pr-4">Location</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Applications</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInternships.map((internship) => {
                  const locationType = getLocationTypeLabel(internship.locationType);
                  return (
                    <tr key={internship.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 pr-4">
                        <p className="font-medium text-slate-800">{internship.title}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {internship.companyName.charAt(0)}
                          </div>
                          <span className="text-slate-600">{internship.companyName}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-slate-600">{internship.location}</td>
                      <td className="py-4 pr-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${locationType.color}`}>
                          {locationType.label}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        {internship.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                          {internship.applicationsCount}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-slate-400 hover:text-amber-600 transition-colors">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-briefcase text-slate-400 text-2xl"></i>
            </div>
            <p className="text-slate-500 font-medium">No internships found</p>
            <p className="text-slate-400 text-sm mt-1">
              {searchTerm || filterStatus !== 'all' ? 'Try different filters' : 'No internships have been posted yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInternships;
