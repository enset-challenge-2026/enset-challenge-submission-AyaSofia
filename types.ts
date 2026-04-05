// User types
export type UserType = 'student' | 'company' | 'admin';

export interface StudentProfile {
  fullName: string;
  email: string;
  education: string;
  skills: string[];
  interests: string[];
  location: string;
}

export interface CompanyProfile {
  id: string;
  email: string;
  name: string;
  siret: string;
  sector?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  location?: string;
  verified: boolean;
}

export interface CompanyStats {
  totalInternships: number;
  activeInternships: number;
  totalApplications: number;
}

// AI-matched internship (for students)
export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  relevanceScore: number;
  matchReason: string;
  requirements: string[];
}

// Company's internship posting
export interface InternshipPost {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: string;
  locationType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  duration: string;
  compensation?: string;
  startDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Student's application (student view)
export interface Application {
  id: string;
  internshipId: string;
  internshipTitle: string;
  company: string;
  status: 'Applied' | 'Interviewing' | 'Rejected' | 'Accepted';
  dateApplied: string;
}

// Company's application view
export interface CompanyApplicationStatus {
  NEW: 'NEW';
  REVIEWING: 'REVIEWING';
  SHORTLISTED: 'SHORTLISTED';
  INTERVIEW: 'INTERVIEW';
  OFFER: 'OFFER';
  ACCEPTED: 'ACCEPTED';
  REJECTED: 'REJECTED';
}

export interface CompanyApplication {
  id: string;
  internshipId: string;
  internship: {
    title: string;
  };
  userId: string;
  user: {
    email: string;
    profile: {
      fullName: string;
      education?: string;
      skills: string[];
      location?: string;
    } | null;
  };
  status: keyof CompanyApplicationStatus;
  coverLetter?: string;
  notes?: string;
  appliedAt: string;
  updatedAt: string;
}

// Tab enums
export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  PROFILE = 'PROFILE',
  CV_ANALYZER = 'CV_ANALYZER',
  FINDER = 'FINDER',
  BROWSE = 'BROWSE',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
}

export enum AdminTab {
  DASHBOARD = 'DASHBOARD',
  USERS = 'USERS',
  COMPANIES = 'COMPANIES',
  INTERNSHIPS = 'INTERNSHIPS',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
}

export enum CompanyTab {
  DASHBOARD = 'DASHBOARD',
  PROFILE = 'PROFILE',
  INTERNSHIPS = 'INTERNSHIPS',
  APPLICATIONS = 'APPLICATIONS',
}

export interface CVAnalysisResult {
  summary: string;
  extractedSkills: string[];
  careerSuggestions: string[];
  weaknesses: string[];
}

// CV Performance Analyzer types
export interface ATSAuditResult {
  score: number;
  isReadable: boolean;
  issues: string[];
  recommendations: string[];
}

export interface ContentDiagnosisResult {
  strengths: string[];
  weaknesses: string[];
  missingKeyElements: string[];
  suggestions: string[];
}

export interface SkillRecommendation {
  skill: string;
  reason: string;
  demandScore: number;
  relevantInternships: number;
}

export interface CVPerformanceResult {
  overallScore: number;
  atsAudit: ATSAuditResult;
  contentDiagnosis: ContentDiagnosisResult;
  skillRecommendations: SkillRecommendation[];
  matchScore: number;
  actionItems: string[];
  analyzedAt: string;
}

export interface CVPerformanceHistoryItem {
  id: string;
  fileName: string;
  overallScore: number;
  atsScore: number;
  matchScore: number;
  createdAt: string;
}
