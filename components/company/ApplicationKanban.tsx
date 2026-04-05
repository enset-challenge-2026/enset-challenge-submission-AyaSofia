import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ApplicationCard from './ApplicationCard';
import ApplicationDetail from './ApplicationDetail';

interface ApplicationData {
  id: string;
  internshipId: string;
  internship: { title: string };
  userId: string;
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

const ApplicationKanban: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [draggedApp, setDraggedApp] = useState<ApplicationData | null>(null);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const response = await api.getCompanyApplications();
      if (response.success && response.data) {
        setApplications(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleDragStart = (app: ApplicationData) => {
    setDraggedApp(app);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: string) => {
    if (!draggedApp || draggedApp.status === status) {
      setDraggedApp(null);
      return;
    }

    try {
      await api.updateCompanyApplicationStatus(draggedApp.id, status);
      setApplications(applications.map(app =>
        app.id === draggedApp.id ? { ...app, status } : app
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setDraggedApp(null);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await api.updateCompanyApplicationStatus(appId, newStatus);
      setApplications(applications.map(app =>
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleNotesUpdate = async (appId: string, notes: string) => {
    try {
      await api.updateCompanyApplicationNotes(appId, notes);
      setApplications(applications.map(app =>
        app.id === appId ? { ...app, notes } : app
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notes');
    }
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  if (selectedApp) {
    return (
      <ApplicationDetail
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onStatusChange={handleStatusChange}
        onNotesUpdate={handleNotesUpdate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Applications</h2>
        <p className="text-slate-500 mt-1">
          Drag and drop to change status, or click to view details
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : applications.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No applications yet</h3>
          <p className="text-slate-500">
            When students apply to your internships, they will appear here.
          </p>
        </div>
      ) : (
        /* Kanban Board */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => {
            const statusApps = getApplicationsByStatus(status.id);
            return (
              <div
                key={status.id}
                className="flex-shrink-0 w-72"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(status.id)}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  <h3 className="font-semibold text-slate-700">{status.label}</h3>
                  <span className="ml-auto text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {statusApps.length}
                  </span>
                </div>

                {/* Column Content */}
                <div
                  className={`bg-slate-100 rounded-lg p-2 min-h-[400px] transition-colors ${
                    draggedApp && draggedApp.status !== status.id
                      ? 'bg-indigo-50 border-2 border-dashed border-indigo-300'
                      : ''
                  }`}
                >
                  {statusApps.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-sm text-slate-400">
                      Drop here
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {statusApps.map((app) => (
                        <ApplicationCard
                          key={app.id}
                          application={app}
                          onDragStart={() => handleDragStart(app)}
                          onClick={() => setSelectedApp(app)}
                          isDragging={draggedApp?.id === app.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationKanban;
