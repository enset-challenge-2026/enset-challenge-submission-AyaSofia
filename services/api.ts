const API_BASE_URL = '/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  }

  // Auth endpoints
  async register(email: string, password: string, fullName: string) {
    return this.request<{ user: unknown; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: unknown; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Admin endpoints
  async adminLogin(email: string, password: string) {
    return this.request<{ admin: unknown; token: string }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getAdminProfile() {
    return this.request<{
      id: string;
      email: string;
      name: string;
      role: string;
    }>('/admin/profile');
  }

  async getAdminStats() {
    return this.request<{
      totalStudents: number;
      totalCompanies: number;
      totalInternships: number;
      totalApplications: number;
      recentActivity: Array<{
        id: string;
        type: string;
        message: string;
        createdAt: string;
      }>;
    }>('/admin/stats');
  }

  async getAdminUsers() {
    return this.request<Array<{
      id: string;
      email: string;
      fullName: string;
      createdAt: string;
      applicationsCount: number;
    }>>('/admin/users');
  }

  async getAdminCompanies() {
    return this.request<Array<{
      id: string;
      email: string;
      name: string;
      sector: string | null;
      verified: boolean;
      internshipsCount: number;
      createdAt: string;
    }>>('/admin/companies');
  }

  async getAdminInternships() {
    return this.request<Array<{
      id: string;
      title: string;
      companyName: string;
      location: string;
      locationType: string;
      isActive: boolean;
      applicationsCount: number;
      createdAt: string;
    }>>('/admin/internships');
  }

  // Profile endpoints
  async getProfile() {
    return this.request<{
      id: string;
      fullName: string;
      email: string;
      education: string | null;
      skills: string[];
      interests: string[];
      location: string | null;
    }>('/profile');
  }

  async updateProfile(data: {
    fullName?: string;
    education?: string;
    skills?: string[];
    interests?: string[];
    location?: string;
  }) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getLatestCVAnalysis() {
    return this.request<{
      summary: string;
      extractedSkills: string[];
      careerSuggestions: string[];
      weaknesses: string[];
    } | null>('/profile/cv-analysis');
  }

  // Application endpoints
  async getApplications() {
    return this.request<Array<{
      id: string;
      internshipId: string;
      internshipTitle: string;
      company: string;
      status: string;
      dateApplied: string;
    }>>('/applications');
  }

  async createApplication(data: {
    internshipId: string;
    internshipTitle: string;
    company: string;
  }) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApplicationStatus(id: string, status: string) {
    return this.request(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteApplication(id: string) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // AI endpoints
  async analyzeCV(file: File) {
    const formData = new FormData();
    formData.append('cv', file);

    return this.request<{
      summary: string;
      extractedSkills: string[];
      careerSuggestions: string[];
      weaknesses: string[];
    }>('/ai/analyze-cv', {
      method: 'POST',
      body: formData,
    });
  }

  async matchInternships() {
    return this.request<Array<{
      id: string;
      title: string;
      company: string;
      location: string;
      description: string;
      relevanceScore: number;
      matchReason: string;
      requirements: string[];
    }>>('/ai/match-internships', {
      method: 'POST',
    });
  }

  // CV Performance Analyzer endpoints
  async analyzeCVPerformance(file: File) {
    const formData = new FormData();
    formData.append('cv', file);

    return this.request<{
      overallScore: number;
      atsAudit: {
        score: number;
        isReadable: boolean;
        issues: string[];
        recommendations: string[];
      };
      contentDiagnosis: {
        strengths: string[];
        weaknesses: string[];
        missingKeyElements: string[];
        suggestions: string[];
      };
      skillRecommendations: Array<{
        skill: string;
        reason: string;
        demandScore: number;
        relevantInternships: number;
      }>;
      matchScore: number;
      actionItems: string[];
      analyzedAt: string;
    }>('/ai/cv-performance', {
      method: 'POST',
      body: formData,
    });
  }

  async getLatestCVPerformance() {
    return this.request<{
      overallScore: number;
      atsAudit: {
        score: number;
        isReadable: boolean;
        issues: string[];
        recommendations: string[];
      };
      contentDiagnosis: {
        strengths: string[];
        weaknesses: string[];
        missingKeyElements: string[];
        suggestions: string[];
      };
      skillRecommendations: Array<{
        skill: string;
        reason: string;
        demandScore: number;
        relevantInternships: number;
      }>;
      matchScore: number;
      actionItems: string[];
      analyzedAt: string;
    } | null>('/ai/cv-performance');
  }

  async getCVPerformanceHistory() {
    return this.request<Array<{
      id: string;
      fileName: string;
      overallScore: number;
      atsScore: number;
      matchScore: number;
      createdAt: string;
    }>>('/ai/cv-performance/history');
  }

  // ===== Company Auth endpoints =====
  async companyRegister(data: {
    email: string;
    password: string;
    siret: string;
    name: string;
    sector?: string;
    website?: string;
    location?: string;
  }) {
    return this.request<{ company: unknown; token: string }>('/company/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async companyLogin(email: string, password: string) {
    return this.request<{ company: unknown; token: string }>('/company/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // ===== Company Profile endpoints =====
  async getCompanyProfile() {
    return this.request<{
      id: string;
      email: string;
      name: string;
      siret: string;
      sector: string | null;
      description: string | null;
      logoUrl: string | null;
      website: string | null;
      location: string | null;
      verified: boolean;
      createdAt: string;
    }>('/company/profile');
  }

  async updateCompanyProfile(data: {
    name?: string;
    sector?: string;
    description?: string;
    logoUrl?: string;
    website?: string;
    location?: string;
  }) {
    return this.request('/company/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getCompanyStats() {
    return this.request<{
      totalInternships: number;
      activeInternships: number;
      totalApplications: number;
    }>('/company/stats');
  }

  // ===== Company Internship endpoints =====
  async getCompanyInternships() {
    return this.request<Array<{
      id: string;
      title: string;
      description: string;
      requirements: string[];
      skills: string[];
      location: string;
      locationType: string;
      duration: string;
      compensation: string | null;
      startDate: string | null;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      _count?: { applications: number };
    }>>('/company/internships');
  }

  async createInternship(data: {
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
    location: string;
    locationType: 'REMOTE' | 'ONSITE' | 'HYBRID';
    duration: string;
    compensation?: string;
    startDate?: string;
  }) {
    return this.request('/company/internships', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInternship(id: string, data: {
    title?: string;
    description?: string;
    requirements?: string[];
    skills?: string[];
    location?: string;
    locationType?: 'REMOTE' | 'ONSITE' | 'HYBRID';
    duration?: string;
    compensation?: string;
    startDate?: string;
    isActive?: boolean;
  }) {
    return this.request(`/company/internships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInternship(id: string) {
    return this.request(`/company/internships/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleInternshipActive(id: string) {
    return this.request(`/company/internships/${id}/toggle-active`, {
      method: 'PATCH',
    });
  }

  // ===== Company Application endpoints =====
  async getCompanyApplications(filters?: { internshipId?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.internshipId) params.append('internshipId', filters.internshipId);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';

    return this.request<Array<{
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
    }>>(`/company/applications${query}`);
  }

  async updateCompanyApplicationStatus(applicationId: string, status: string) {
    return this.request(`/company/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateCompanyApplicationNotes(applicationId: string, notes: string) {
    return this.request(`/company/applications/${applicationId}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  }

  // ===== Public Internship endpoints (for students) =====
  async browseInternships(filters?: {
    search?: string;
    location?: string;
    locationType?: string;
    skills?: string[];
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.locationType) params.append('locationType', filters.locationType);
    if (filters?.skills) filters.skills.forEach(s => params.append('skills', s));
    const query = params.toString() ? `?${params.toString()}` : '';

    return this.request<Array<{
      id: string;
      title: string;
      description: string;
      requirements: string[];
      skills: string[];
      location: string;
      locationType: string;
      duration: string;
      compensation: string | null;
      startDate: string | null;
      company: {
        id: string;
        name: string;
        sector: string | null;
        logoUrl: string | null;
        location: string | null;
      };
      createdAt: string;
    }>>(`/internships${query}`);
  }

  async applyToInternship(internshipId: string, coverLetter?: string) {
    return this.request(`/internships/${internshipId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ coverLetter }),
    });
  }

  async getStudentInternshipApplications() {
    return this.request<Array<{
      id: string;
      internshipId: string;
      internship: {
        title: string;
        company: { name: string };
      };
      status: string;
      coverLetter: string | null;
      appliedAt: string;
      updatedAt: string;
    }>>('/internships/my-applications');
  }
}

export const api = new ApiClient();
export default api;
