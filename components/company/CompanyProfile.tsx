import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CompanyProfile as CompanyProfileType } from '../../types';

interface CompanyProfileProps {
  profile: CompanyProfileType;
  onProfileUpdate: (profile: CompanyProfileType) => void;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ profile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: profile.name,
    sector: profile.sector || '',
    description: profile.description || '',
    logoUrl: profile.logoUrl || '',
    website: profile.website || '',
    location: profile.location || '',
  });

  useEffect(() => {
    setFormData({
      name: profile.name,
      sector: profile.sector || '',
      description: profile.description || '',
      logoUrl: profile.logoUrl || '',
      website: profile.website || '',
      location: profile.location || '',
    });
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.updateCompanyProfile({
        name: formData.name,
        sector: formData.sector || undefined,
        description: formData.description || undefined,
        logoUrl: formData.logoUrl || undefined,
        website: formData.website || undefined,
        location: formData.location || undefined,
      });

      if (response.success && response.data) {
        const updatedProfile: CompanyProfileType = {
          id: profile.id,
          email: profile.email,
          siret: profile.siret,
          verified: profile.verified,
          name: response.data.name || profile.name,
          sector: response.data.sector || undefined,
          description: response.data.description || undefined,
          logoUrl: response.data.logoUrl || undefined,
          website: response.data.website || undefined,
          location: response.data.location || undefined,
        };
        onProfileUpdate(updatedProfile);
        setSuccess('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      sector: profile.sector || '',
      description: profile.description || '',
      logoUrl: profile.logoUrl || '',
      website: profile.website || '',
      location: profile.location || '',
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Company Profile</h2>
          <p className="text-slate-500 mt-1">Manage your company information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
          {success}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Company Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
          <div className="flex items-center gap-4">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt={formData.name}
                className="w-20 h-20 rounded-xl bg-white object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <div className="text-white">
              <h3 className="text-xl font-bold">{formData.name}</h3>
              <p className="text-white/80">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {profile.verified ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending verification
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form / Display */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* SIRET (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              SIRET
            </label>
            <input
              type="text"
              value={profile.siret}
              disabled
              className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all ${
                  isEditing
                    ? 'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'bg-slate-50 text-slate-600'
                }`}
                required
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sector
              </label>
              <input
                type="text"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Technology, Finance, Healthcare"
                className={`w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all ${
                  isEditing
                    ? 'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'bg-slate-50 text-slate-600'
                }`}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Paris, France"
                className={`w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all ${
                  isEditing
                    ? 'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'bg-slate-50 text-slate-600'
                }`}
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!isEditing}
                placeholder="https://example.com"
                className={`w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all ${
                  isEditing
                    ? 'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'bg-slate-50 text-slate-600'
                }`}
              />
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              disabled={!isEditing}
              placeholder="https://example.com/logo.png"
              className={`w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all ${
                isEditing
                  ? 'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  : 'bg-slate-50 text-slate-600'
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Company Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!isEditing}
              rows={4}
              placeholder="Tell candidates about your company, culture, and mission..."
              className={`w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all resize-none ${
                isEditing
                  ? 'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  : 'bg-slate-50 text-slate-600'
              }`}
            />
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
