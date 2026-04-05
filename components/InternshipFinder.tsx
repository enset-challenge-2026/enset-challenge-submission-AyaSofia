import React, { useState } from 'react';
import { Internship, StudentProfile, CVAnalysisResult } from '../types';
import api from '../services/api';

interface FinderProps {
  profile: StudentProfile;
  cvAnalysis: CVAnalysisResult | null;
  recommendations: Internship[];
  setRecommendations: (r: Internship[]) => void;
  onApply: (i: Internship) => void;
  appliedIds: string[];
}

const InternshipFinder: React.FC<FinderProps> = ({ profile, cvAnalysis, recommendations, setRecommendations, onApply, appliedIds }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.matchInternships();
      if (response.success && response.data) {
        setRecommendations(response.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Matching failed. Please check your configuration.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">AI Matching Engine</h3>
          <p className="text-slate-500">We use Gemini to scan the market for internships that fit your specific profile and skill set.</p>
        </div>
        <button 
          onClick={getRecommendations}
          disabled={loading}
          className={`shrink-0 flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-500 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100`}
        >
          {loading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-magic"></i>
          )}
          {loading ? 'Analyzing Market...' : 'Match Opportunities'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium animate-shake">
          <i className="fas fa-exclamation-triangle mr-2"></i> {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="w-12 h-12 bg-slate-100 rounded-lg"></div>
                <div className="w-20 h-6 bg-slate-100 rounded-full"></div>
              </div>
              <div className="w-3/4 h-6 bg-slate-100 rounded"></div>
              <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
              <div className="space-y-2 pt-4">
                <div className="w-full h-3 bg-slate-100 rounded"></div>
                <div className="w-full h-3 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {recommendations.map((job) => (
          <div key={job.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all hover:border-indigo-100 flex flex-col">
            <div className="p-8 pb-0">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {job.company.charAt(0)}
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold mb-2">
                    {job.relevanceScore}% Match
                  </span>
                  <span className="text-slate-400 text-xs font-medium"><i className="fas fa-map-marker-alt mr-1"></i> {job.location}</span>
                </div>
              </div>

              <h3 className="text-xl font-extrabold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
              <p className="text-slate-500 font-bold mb-4">{job.company}</p>
              
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 mb-6">
                <p className="text-sm font-bold text-indigo-800 mb-1 flex items-center gap-2">
                  <i className="fas fa-brain text-xs"></i> Why it matches:
                </p>
                <p className="text-sm text-indigo-600 italic">"{job.matchReason}"</p>
              </div>

              <div className="space-y-2 mb-8">
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{job.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {job.requirements.slice(0, 3).map((req, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-medium border border-slate-100">
                    {req}
                  </span>
                ))}
                {job.requirements.length > 3 && <span className="text-slate-400 text-xs font-medium self-center">+{job.requirements.length - 3} more</span>}
              </div>
            </div>

            <div className="mt-auto p-8 pt-0">
              <button 
                onClick={() => onApply(job)}
                disabled={appliedIds.includes(job.id)}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                  appliedIds.includes(job.id) 
                    ? 'bg-emerald-50 text-emerald-600 cursor-default shadow-none border border-emerald-100' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                }`}
              >
                {appliedIds.includes(job.id) ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-check-circle"></i> Application Sent
                  </span>
                ) : 'Apply Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && recommendations.length === 0 && !error && (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-300">
            <i className="fas fa-rocket text-3xl"></i>
          </div>
          <h4 className="text-2xl font-bold text-slate-800 mb-2">Ready to launch?</h4>
          <p className="text-slate-500 max-w-sm mx-auto">Click the button above to discover internships tailored specifically to your unique CV and goals.</p>
        </div>
      )}
    </div>
  );
};

export default InternshipFinder;
