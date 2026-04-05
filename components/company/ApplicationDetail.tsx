import React, { useState } from 'react';

interface ApplicationDetailProps {
  application: {
    id: string;
    internship: { title: string };
    user: {
      email: string;
      profile: {
        fullName: string;
        education: string | null;
        skills: string[];
        location: string | null;
      } | null;
    };
    status: string;
    coverLetter: string | null;
    notes: string | null;
    appliedAt: string;
    updatedAt: string;
  };
  onClose: () => void;
  onStatusChange: (appId: string, status: string) => Promise<void>;
  onNotesUpdate: (appId: string, notes: string) => Promise<void>;
}

const STATUSES = [
  { id: 'NEW', label: 'New', color: 'bg-blue-500' },
  { id: 'REVIEWING', label: 'Reviewing', color: 'bg-yellow-500' },
  { id: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-purple-500' },
  { id: 'INTERVIEW', label: 'Interview', color: 'bg-orange-500' },
  { id: 'OFFER', label: 'Offer', color: 'bg-green-500' },
  { id: 'ACCEPTED', label: 'Accepted', color: 'bg-emerald-600' },
  { id: 'REJECTED', label: 'Rejected', color: 'bg-red-500' },
];

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  application,
  onClose,
  onStatusChange,
  onNotesUpdate,
}) => {
  const [notes, setNotes] = useState(application.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const { user, internship, status, coverLetter, appliedAt } = application;
  const profile = user.profile;

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true);
    try {
      await onStatusChange(application.id, newStatus);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onNotesUpdate(application.id, notes);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const currentStatus = STATUSES.find(s => s.id === status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Kanban
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                {profile?.fullName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">
                  {profile?.fullName || 'Unknown Candidate'}
                </h2>
                <p className="text-slate-500">{user.email}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </span>
                  )}
                  {profile?.education && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      {profile.education}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {coverLetter && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-3">Cover Letter</h3>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 whitespace-pre-wrap">{coverLetter}</p>
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-3">Internal Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              placeholder="Add private notes about this candidate..."
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes || notes === (application.notes || '')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Application Details</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Position</p>
                <p className="font-medium text-slate-800">{internship.title}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Applied</p>
                <p className="font-medium text-slate-800">
                  {new Date(appliedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Current Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentStatus?.color || 'bg-slate-400'}`}></div>
                  <span className="font-medium text-slate-800">{currentStatus?.label || status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Change Status</h3>
            <div className="space-y-2">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStatusChange(s.id)}
                  disabled={isChangingStatus || s.id === status}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    s.id === status
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${s.color}`}></div>
                  {s.label}
                  {s.id === status && (
                    <span className="ml-auto text-xs text-slate-400">Current</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href={`mailto:${user.email}`}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </a>
              <button
                onClick={() => handleStatusChange('INTERVIEW')}
                disabled={isChangingStatus || status === 'INTERVIEW'}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Interview
              </button>
              <button
                onClick={() => handleStatusChange('REJECTED')}
                disabled={isChangingStatus || status === 'REJECTED'}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
