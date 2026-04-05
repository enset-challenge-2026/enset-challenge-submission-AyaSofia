import React, { useState, useEffect } from 'react';
import { StudentProfile, CVAnalysisResult } from '../types';
import api from '../services/api';

interface ProfileProps {
  profile: StudentProfile;
  onSave: (p: StudentProfile) => void;
  cvAnalysis: CVAnalysisResult | null;
  setCvAnalysis: (r: CVAnalysisResult | null) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onSave, cvAnalysis, setCvAnalysis }) => {
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await api.analyzeCV(file);
      if (response.success && response.data) {
        setCvAnalysis(response.data);
        setFormData(prev => ({
          ...prev,
          skills: [...new Set([...prev.skills, ...response.data!.extractedSkills])]
        }));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze CV.';
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills : [...prev.skills, skill]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <i className="fas fa-file-upload text-indigo-600"></i>
          CV Analysis
        </h3>
        
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-10 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group relative">
          <input 
            type="file" 
            accept=".pdf,.jpg,.png,.jpeg" 
            onChange={handleFileUpload} 
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isAnalyzing}
          />
          <div className="text-center">
            {isAnalyzing ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-bold">Gemini is analyzing your CV...</p>
                <p className="text-slate-400 text-sm mt-1">This takes a few seconds.</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <i className="fas fa-cloud-upload-alt text-2xl text-indigo-600"></i>
                </div>
                <p className="text-slate-700 font-bold mb-1">Click to upload or drag and drop</p>
                <p className="text-slate-400 text-sm italic">Supports PDF, JPG, PNG</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}

        {cvAnalysis && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-slate-800 mb-2">AI Summary</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{cvAnalysis.summary}</p>
            </div>
            <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <h4 className="font-bold text-slate-800 mb-2">Career Recommendations</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {cvAnalysis.careerSuggestions.map((s, i) => (
                  <li key={i}><i className="fas fa-arrow-right text-emerald-500 mr-2 text-xs"></i> {s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-8">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <input 
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <input 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Education</label>
            <input 
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="e.g. BS in Computer Science"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Location</label>
            <input 
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="e.g. New York, NY"
            />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Skills</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold flex items-center gap-2">
                {skill}
                <button 
                  onClick={() => setFormData(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))}
                  className="hover:text-red-500"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              id="skillInput"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Add a skill (e.g. React)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addSkill((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <button 
              onClick={() => {
                const el = document.getElementById('skillInput') as HTMLInputElement;
                addSkill(el.value);
                el.value = '';
              }}
              className="px-6 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <button 
          onClick={() => onSave(formData)}
          className="mt-10 w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 hover:scale-[1.02] transition-all"
        >
          Save Profile Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;
