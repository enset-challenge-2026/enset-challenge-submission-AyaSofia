import React from 'react';

interface ApplicationCardProps {
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
    appliedAt: string;
    notes: string | null;
  };
  onDragStart: () => void;
  onClick: () => void;
  isDragging: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onDragStart,
  onClick,
  isDragging,
}) => {
  const { user, internship, appliedAt, notes } = application;
  const profile = user.profile;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      {/* Candidate Name */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {profile?.fullName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-800 text-sm">
              {profile?.fullName || 'Unknown'}
            </p>
            <p className="text-xs text-slate-500 truncate max-w-[140px]">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Internship */}
      <div className="mb-2">
        <p className="text-xs text-slate-500">Applied for:</p>
        <p className="text-sm font-medium text-indigo-600 truncate">{internship.title}</p>
      </div>

      {/* Skills Preview */}
      {profile?.skills && profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {profile.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="text-xs text-slate-400">+{profile.skills.length - 3}</span>
          )}
        </div>
      )}

      {/* Notes indicator */}
      {notes && (
        <div className="flex items-center gap-1 text-xs text-amber-600">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
          </svg>
          Has notes
        </div>
      )}

      {/* Date */}
      <div className="mt-2 pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Applied {new Date(appliedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default ApplicationCard;
