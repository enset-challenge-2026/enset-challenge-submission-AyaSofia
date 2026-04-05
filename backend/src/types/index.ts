import { Request } from 'express';

export type UserType = 'student' | 'company' | 'admin';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: UserType;
  };
}

export interface StudentProfile {
  fullName: string;
  email: string;
  education: string;
  skills: string[];
  interests: string[];
  location: string;
}

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

export interface CVAnalysisResult {
  summary: string;
  extractedSkills: string[];
  careerSuggestions: string[];
  weaknesses: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
