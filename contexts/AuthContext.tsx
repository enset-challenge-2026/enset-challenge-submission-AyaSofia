import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { UserType, CompanyProfile } from '../types';

interface StudentUser {
  id: string;
  email: string;
  userType: 'student';
  profile: {
    fullName: string;
    education?: string;
    skills: string[];
    interests: string[];
    location?: string;
  } | null;
}

interface CompanyUser {
  id: string;
  email: string;
  userType: 'company';
  name: string;
  siret: string;
  sector?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  location?: string;
  verified: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  userType: 'admin';
  name: string;
  role: string;
}

type User = StudentUser | CompanyUser | AdminUser;

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  companyLogin: (email: string, password: string) => Promise<void>;
  companyRegister: (data: {
    email: string;
    password: string;
    siret: string;
    name: string;
    sector?: string;
    website?: string;
    location?: string;
  }) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get userType from token
const getUserTypeFromToken = (token: string): UserType | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userType as UserType;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        const userType = getUserTypeFromToken(token);
        try {
          if (userType === 'admin') {
            const response = await api.getAdminProfile();
            if (response.success && response.data) {
              setUser({
                id: response.data.id,
                email: response.data.email,
                userType: 'admin',
                name: response.data.name,
                role: response.data.role,
              });
            }
          } else if (userType === 'company') {
            const response = await api.getCompanyProfile();
            if (response.success && response.data) {
              setUser({
                id: response.data.id,
                email: response.data.email,
                userType: 'company',
                name: response.data.name,
                siret: response.data.siret,
                sector: response.data.sector || undefined,
                description: response.data.description || undefined,
                logoUrl: response.data.logoUrl || undefined,
                website: response.data.website || undefined,
                location: response.data.location || undefined,
                verified: response.data.verified,
              });
            }
          } else {
            const response = await api.getProfile();
            if (response.success && response.data) {
              setUser({
                id: response.data.id,
                email: response.data.email,
                userType: 'student',
                profile: {
                  fullName: response.data.fullName,
                  education: response.data.education || undefined,
                  skills: response.data.skills,
                  interests: response.data.interests,
                  location: response.data.location || undefined,
                },
              });
            }
          }
        } catch {
          api.setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.success && response.data) {
      api.setToken(response.data.token);
      const userData = response.data.user as { id: string; email: string; profile: StudentUser['profile'] };
      setUser({
        ...userData,
        userType: 'student',
      } as StudentUser);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const response = await api.register(email, password, fullName);
    if (response.success && response.data) {
      api.setToken(response.data.token);
      const userData = response.data.user as { id: string; email: string; profile: StudentUser['profile'] };
      setUser({
        ...userData,
        userType: 'student',
      } as StudentUser);
    }
  };

  const companyLogin = async (email: string, password: string) => {
    const response = await api.companyLogin(email, password);
    if (response.success && response.data) {
      api.setToken(response.data.token);
      const companyData = response.data.company as Omit<CompanyUser, 'userType'>;
      setUser({
        ...companyData,
        userType: 'company',
      } as CompanyUser);
    }
  };

  const companyRegister = async (data: {
    email: string;
    password: string;
    siret: string;
    name: string;
    sector?: string;
    website?: string;
    location?: string;
  }) => {
    const response = await api.companyRegister(data);
    if (response.success && response.data) {
      api.setToken(response.data.token);
      const companyData = response.data.company as Omit<CompanyUser, 'userType'>;
      setUser({
        ...companyData,
        userType: 'company',
      } as CompanyUser);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    const response = await api.adminLogin(email, password);
    if (response.success && response.data) {
      api.setToken(response.data.token);
      const adminData = response.data.admin as { id: string; email: string; name: string; role: string };
      setUser({
        ...adminData,
        userType: 'admin',
      } as AdminUser);
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType: user?.userType || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        companyLogin,
        companyRegister,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
