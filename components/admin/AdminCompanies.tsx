import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface Company {
  id: string;
  email: string;
  name: string;
  sector: string | null;
  verified: boolean;
  internshipsCount: number;
  createdAt: string;
}

const AdminCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.getAdminCompanies();
        if (response.success && response.data) {
          setCompanies(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load companies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.sector && company.sector.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Registered Companies</h3>
            <p className="text-sm text-slate-500">{companies.length} companies on the platform</p>
          </div>
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        {filteredCompanies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 pr-4">Company</th>
                  <th className="pb-3 pr-4">Sector</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Internships</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{company.name}</p>
                          <p className="text-xs text-slate-400">{company.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-slate-600">
                      {company.sector || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-4 pr-4">
                      {company.verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
                          <i className="fas fa-check-circle"></i>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">
                          <i className="fas fa-clock"></i>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                        {company.internshipsCount} listings
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate-500 text-sm">
                      {new Date(company.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!company.verified && (
                          <button className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                            Verify
                          </button>
                        )}
                        <button className="text-slate-400 hover:text-amber-600 transition-colors">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-building text-slate-400 text-2xl"></i>
            </div>
            <p className="text-slate-500 font-medium">No companies found</p>
            <p className="text-slate-400 text-sm mt-1">
              {searchTerm ? 'Try a different search term' : 'No companies have registered yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCompanies;
