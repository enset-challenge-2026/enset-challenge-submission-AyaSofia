import React, { useState, useEffect, useRef } from 'react';
import { CVPerformanceResult, CVPerformanceHistoryItem } from '../types';
import api from '../services/api';

// Score Gauge Component
const ScoreGauge: React.FC<{
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}> = ({ score, label, size = 'md', color }) => {
  const getColor = (s: number) => {
    if (color) return color;
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#eab308';
    if (s >= 40) return '#f97316';
    return '#ef4444';
  };

  const sizeConfig = {
    sm: { width: 80, stroke: 6, fontSize: 'text-lg' },
    md: { width: 120, stroke: 8, fontSize: 'text-2xl' },
    lg: { width: 160, stroke: 10, fontSize: 'text-4xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg className="transform -rotate-90" width={config.width} height={config.width}>
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={config.stroke}
            fill="none"
          />
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke={getColor(score)}
            strokeWidth={config.stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${config.fontSize} font-bold text-slate-800`}>{score}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-slate-600">{label}</span>
    </div>
  );
};

// Progress Bar Component
const ProgressBar: React.FC<{
  value: number;
  label: string;
  showValue?: boolean;
}> = ({ value, label, showValue = true }) => {
  const getColor = (v: number) => {
    if (v >= 80) return 'bg-green-500';
    if (v >= 60) return 'bg-yellow-500';
    if (v >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        {showValue && <span className="font-medium text-slate-800">{value}%</span>}
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(value)} rounded-full transition-all duration-1000`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

// Checklist Item Component
const ChecklistItem: React.FC<{
  text: string;
  type: 'success' | 'warning' | 'error' | 'info';
}> = ({ text, type }) => {
  const config = {
    success: { icon: 'fa-check-circle', color: 'text-green-500', bg: 'bg-green-50' },
    warning: { icon: 'fa-exclamation-triangle', color: 'text-yellow-500', bg: 'bg-yellow-50' },
    error: { icon: 'fa-times-circle', color: 'text-red-500', bg: 'bg-red-50' },
    info: { icon: 'fa-info-circle', color: 'text-blue-500', bg: 'bg-blue-50' },
  };

  const { icon, color, bg } = config[type];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${bg}`}>
      <i className={`fas ${icon} ${color} mt-0.5`}></i>
      <span className="text-sm text-slate-700">{text}</span>
    </div>
  );
};

// Skill Card Component
const SkillCard: React.FC<{
  skill: string;
  reason: string;
  demandScore: number;
  relevantInternships: number;
}> = ({ skill, reason, demandScore, relevantInternships }) => {
  return (
    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-slate-800">{skill}</h4>
        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
          {demandScore}% demand
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-2">{reason}</p>
      <p className="text-xs text-slate-500">
        <i className="fas fa-briefcase mr-1"></i>
        {relevantInternships} internships require this skill
      </p>
    </div>
  );
};

const CVPerformanceAnalyzer: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CVPerformanceResult | null>(null);
  const [history, setHistory] = useState<CVPerformanceHistoryItem[]>([]);
  const [activeSection, setActiveSection] = useState<'ats' | 'content' | 'skills' | 'actions'>('ats');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLatestAnalysis();
    loadHistory();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      const response = await api.getLatestCVPerformance();
      if (response.success && response.data) {
        setAnalysis(response.data);
      }
    } catch (error) {
      console.error('Failed to load latest analysis:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.getCVPerformanceHistory();
      if (response.success && response.data) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or image file (PNG, JPG)');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await api.analyzeCVPerformance(file);
      if (response.success && response.data) {
        setAnalysis(response.data);
        loadHistory();
      }
    } catch (error) {
      console.error('Failed to analyze CV:', error);
      alert('Failed to analyze CV. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const sections = [
    { id: 'ats', label: 'ATS Audit', icon: 'fa-robot' },
    { id: 'content', label: 'Content Diagnosis', icon: 'fa-file-alt' },
    { id: 'skills', label: 'Skill Recommendations', icon: 'fa-lightbulb' },
    { id: 'actions', label: 'Action Items', icon: 'fa-tasks' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <i className="fas fa-chart-line text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold">CV Performance Analyzer</h1>
            <p className="text-indigo-200">StageMatch IA - Optimize your CV for success</p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleInputChange}
          className="hidden"
        />

        {isAnalyzing ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-indigo-600"></i>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Analyzing your CV...</p>
              <p className="text-sm text-slate-500">AI is evaluating ATS compatibility, content quality, and market fit</p>
            </div>
            <div className="max-w-xs mx-auto">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
              <i className="fas fa-cloud-upload-alt text-2xl text-slate-400"></i>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Drop your CV here</p>
              <p className="text-sm text-slate-500">or click to browse (PDF, PNG, JPG)</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <i className="fas fa-upload mr-2"></i>
              Upload CV
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {analysis && (
        <>
          {/* Score Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ScoreGauge score={analysis.overallScore} label="Overall Score" size="lg" />
              <ScoreGauge score={analysis.atsAudit.score} label="ATS Score" size="md" color="#6366f1" />
              <ScoreGauge score={analysis.matchScore} label="Market Match" size="md" color="#8b5cf6" />
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProgressBar value={analysis.atsAudit.score} label="ATS Compatibility" />
              <ProgressBar value={analysis.matchScore} label="Market Relevance" />
            </div>
          </div>

          {/* Section Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as typeof activeSection)}
                  className={`flex-1 px-4 py-4 text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fas ${section.icon} mr-2`}></i>
                  {section.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* ATS Audit Section */}
              {activeSection === 'ats' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      analysis.atsAudit.isReadable ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <i className={`fas ${analysis.atsAudit.isReadable ? 'fa-check' : 'fa-times'} text-xl ${
                        analysis.atsAudit.isReadable ? 'text-green-600' : 'text-red-600'
                      }`}></i>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {analysis.atsAudit.isReadable ? 'ATS Compatible' : 'ATS Issues Detected'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {analysis.atsAudit.isReadable
                          ? 'Your CV can be properly parsed by Application Tracking Systems'
                          : 'Your CV may have issues being read by Application Tracking Systems'}
                      </p>
                    </div>
                  </div>

                  {analysis.atsAudit.issues.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">Issues Found</h3>
                      <div className="space-y-2">
                        {analysis.atsAudit.issues.map((issue, idx) => (
                          <ChecklistItem key={idx} text={issue} type="error" />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Recommendations</h3>
                    <div className="space-y-2">
                      {analysis.atsAudit.recommendations.map((rec, idx) => (
                        <ChecklistItem key={idx} text={rec} type="info" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Diagnosis Section */}
              {activeSection === 'content' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-500"></i>
                        Strengths
                      </h3>
                      <div className="space-y-2">
                        {analysis.contentDiagnosis.strengths.map((strength, idx) => (
                          <ChecklistItem key={idx} text={strength} type="success" />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle text-yellow-500"></i>
                        Areas to Improve
                      </h3>
                      <div className="space-y-2">
                        {analysis.contentDiagnosis.weaknesses.map((weakness, idx) => (
                          <ChecklistItem key={idx} text={weakness} type="warning" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {analysis.contentDiagnosis.missingKeyElements.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <i className="fas fa-times-circle text-red-500"></i>
                        Missing Key Elements
                      </h3>
                      <div className="space-y-2">
                        {analysis.contentDiagnosis.missingKeyElements.map((element, idx) => (
                          <ChecklistItem key={idx} text={element} type="error" />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <i className="fas fa-lightbulb text-blue-500"></i>
                      Suggestions
                    </h3>
                    <div className="space-y-2">
                      {analysis.contentDiagnosis.suggestions.map((suggestion, idx) => (
                        <ChecklistItem key={idx} text={suggestion} type="info" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  <p className="text-slate-600 mb-4">
                    Based on current internship market demand, consider adding or highlighting these skills:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.skillRecommendations.map((skill, idx) => (
                      <SkillCard
                        key={idx}
                        skill={skill.skill}
                        reason={skill.reason}
                        demandScore={skill.demandScore}
                        relevantInternships={skill.relevantInternships}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items Section */}
              {activeSection === 'actions' && (
                <div className="space-y-4">
                  <p className="text-slate-600 mb-4">
                    Here are the most important actions to improve your CV:
                  </p>
                  <div className="space-y-3">
                    {analysis.actionItems.map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                      >
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 pt-1">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Info */}
          <div className="text-center text-sm text-slate-500">
            Last analyzed: {new Date(analysis.analyzedAt).toLocaleString()}
          </div>
        </>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Analysis History</h2>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-file-pdf text-indigo-600"></i>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{item.fileName}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800">{item.overallScore}</p>
                    <p className="text-xs text-slate-500">Overall</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-indigo-600">{item.atsScore}</p>
                    <p className="text-xs text-slate-500">ATS</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-purple-600">{item.matchScore}</p>
                    <p className="text-xs text-slate-500">Match</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CVPerformanceAnalyzer;
