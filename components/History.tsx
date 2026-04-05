
import React, { useState } from 'react';
import { Application } from '../types';
import DropdownMenu from './ui/DropdownMenu';
import ConfirmDialog from './ui/ConfirmDialog';
import api from '../services/api';

interface HistoryProps {
  applications: Application[];
  setApplications?: (applications: Application[]) => void;
}

const History: React.FC<HistoryProps> = ({ applications, setApplications }) => {
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = (app: Application) => {
    setSelectedApplication(app);
    setShowWithdrawConfirm(true);
  };

  const confirmWithdraw = async () => {
    if (!selectedApplication || !setApplications) return;

    setIsWithdrawing(true);
    try {
      await api.deleteApplication(selectedApplication.id);
      setApplications(applications.filter(a => a.id !== selectedApplication.id));
      setShowWithdrawConfirm(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Failed to withdraw application:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleCopyLink = (app: Application) => {
    const link = `${window.location.origin}/applications/${app.id}`;
    navigator.clipboard.writeText(link);
  };

  const getMenuItems = (app: Application) => [
    {
      label: 'View Details',
      icon: 'fa-eye',
      onClick: () => {
        // Could open a modal with details in the future
        console.log('View details for', app.id);
      },
    },
    {
      label: 'Copy Link',
      icon: 'fa-link',
      onClick: () => handleCopyLink(app),
    },
    {
      label: 'Withdraw',
      icon: 'fa-times',
      onClick: () => handleWithdraw(app),
      variant: 'danger' as const,
      disabled: app.status === 'Accepted' || app.status === 'Rejected',
    },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden pb-8">
      <div className="p-8 border-b border-slate-50">
        <h3 className="text-xl font-bold text-slate-800">Track Your Journey</h3>
        <p className="text-slate-500 text-sm">Monitor all your submitted applications in one place.</p>
      </div>

      {applications.length > 0 ? (
        <div className="overflow-x-auto px-8">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="py-6">Internship Position</th>
                <th className="py-6">Company</th>
                <th className="py-6">Date Applied</th>
                <th className="py-6">Status</th>
                <th className="py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-6 pr-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {app.company.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{app.internshipTitle}</span>
                    </div>
                  </td>
                  <td className="py-6 pr-4">
                    <span className="text-slate-600 font-medium">{app.company}</span>
                  </td>
                  <td className="py-6 pr-4">
                    <span className="text-slate-400 text-sm">
                      {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="py-6 pr-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      app.status === 'Applied' ? 'bg-blue-50 text-blue-600' :
                      app.status === 'Interviewing' ? 'bg-amber-50 text-amber-600' :
                      app.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        app.status === 'Applied' ? 'bg-blue-600' :
                        app.status === 'Interviewing' ? 'bg-amber-600' :
                        app.status === 'Accepted' ? 'bg-emerald-600' :
                        'bg-red-600'
                      }`}></span>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-6 text-right">
                    <DropdownMenu
                      trigger={
                        <button className="w-10 h-10 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                      }
                      items={getMenuItems(app)}
                      position="right"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <i className="fas fa-folder-open text-3xl"></i>
          </div>
          <p className="text-slate-500 font-bold">No applications yet.</p>
          <p className="text-slate-400 text-sm mt-1">Start your career journey by applying to roles.</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={showWithdrawConfirm}
        onClose={() => {
          setShowWithdrawConfirm(false);
          setSelectedApplication(null);
        }}
        title="Withdraw Application"
        message={`Are you sure you want to withdraw your application for "${selectedApplication?.internshipTitle}" at ${selectedApplication?.company}? This action cannot be undone.`}
        confirmText="Withdraw"
        cancelText="Cancel"
        onConfirm={confirmWithdraw}
        variant="danger"
        isLoading={isWithdrawing}
      />
    </div>
  );
};

export default History;
