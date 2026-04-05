import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface InternshipData {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: string;
  locationType: string;
  duration: string;
  compensation: string | null;
  startDate: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    sector: string | null;
    logoUrl: string | null;
    location: string | null;
  };
}

interface StudentApplication {
  id: string;
  internshipId: string;
  status: string;
  appliedAt: string;
}

const RealInternshipBrowser: React.FC = () => {
  const [internships, setInternships] = useState<InternshipData[]>([]);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInternship, setSelectedInternship] = useState<InternshipData | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [internshipsRes, appsRes] = await Promise.all([
        api.browseInternships({
          search: searchTerm || undefined,
          location: locationFilter || undefined,
          locationType: locationTypeFilter || undefined,
        }),
        api.getStudentInternshipApplications(),
      ]);

      if (internshipsRes.success && internshipsRes.data) {
        setInternships(internshipsRes.data);
      }

      if (appsRes.success && appsRes.data) {
        setApplications(appsRes.data.map(app => ({
          id: app.id,
          internshipId: app.internshipId,
          status: app.status,
          appliedAt: app.appliedAt,
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load internships');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    loadData();
  };

  const handleApply = async () => {
    if (!selectedInternship) return;

    setIsApplying(true);
    try {
      await api.applyToInternship(selectedInternship.id, coverLetter || undefined);
      setApplications([
        ...applications,
        {
          id: Date.now().toString(),
          internshipId: selectedInternship.id,
          status: 'NEW',
          appliedAt: new Date().toISOString(),
        },
      ]);
      setShowApplyModal(false);
      setCoverLetter('');
      setSelectedInternship(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  const isApplied = (internshipId: string) => {
    return applications.some(app => app.internshipId === internshipId);
  };

  const getApplicationStatus = (internshipId: string) => {
    const app = applications.find(a => a.internshipId === internshipId);
    return app?.status;
  };

  const locationTypeLabels: Record<string, string> = {
    REMOTE: 'Remote',
    ONSITE: 'On-site',
    HYBRID: 'Hybrid',
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    NEW: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
    REVIEWING: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
    SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-800' },
    INTERVIEW: { label: 'Interview', color: 'bg-orange-100 text-orange-800' },
    OFFER: { label: 'Offer Received', color: 'bg-green-100 text-green-800' },
    ACCEPTED: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-800' },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Browse Internships</h2>
        <p className="text-slate-500 mt-1">
          Discover and apply to internship opportunities
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by title, company, or keywords..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Location"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={locationTypeFilter}
              onChange={(e) => setLocationTypeFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            >
              <option value="">All types</option>
              <option value="REMOTE">Remote</option>
              <option value="ONSITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : internships.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No internships found</h3>
          <p className="text-slate-500">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {internships.map((internship) => {
            const applied = isApplied(internship.id);
            const appStatus = getApplicationStatus(internship.id);
            const statusInfo = appStatus ? statusLabels[appStatus] : null;

            return (
              <div
                key={internship.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {internship.company.logoUrl ? (
                      <img
                        src={internship.company.logoUrl}
                        alt={internship.company.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                        {internship.company.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {internship.title}
                        </h3>
                        <p className="text-sky-600 font-medium">{internship.company.name}</p>
                      </div>

                      {/* Apply Button or Status */}
                      <div className="flex-shrink-0">
                        {applied ? (
                          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo?.color || 'bg-slate-100 text-slate-600'}`}>
                            {statusInfo?.label || 'Applied'}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedInternship(internship);
                              setShowApplyModal(true);
                            }}
                            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {internship.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        {locationTypeLabels[internship.locationType] || internship.locationType}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {internship.duration}
                      </span>
                      {internship.compensation && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {internship.compensation}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-slate-600 text-sm line-clamp-2">
                      {internship.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {internship.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-sky-50 text-sky-700 rounded text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {internship.skills.length > 5 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                          +{internship.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedInternship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Apply to {selectedInternship.title}
            </h3>
            <p className="text-slate-500 mb-4">at {selectedInternship.company.name}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cover Letter (optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none"
                placeholder="Tell the company why you're interested in this position..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="flex-1 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {isApplying ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setCoverLetter('');
                  setSelectedInternship(null);
                }}
                disabled={isApplying}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealInternshipBrowser;
