import { z } from 'zod';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// Admin credentials
// Email: admin@internmatch.com
// Password: admin123
const ADMIN_EMAIL = 'admin@internmatch.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_ID = 'admin-1';
const ADMIN_NAME = 'System Admin';
const ADMIN_ROLE = 'super_admin';

export const adminLogin = async (input: AdminLoginInput) => {
  // Simple admin check - in production, use a database
  if (input.email !== ADMIN_EMAIL) {
    throw new AppError('Invalid admin credentials', 401);
  }

  if (input.password !== ADMIN_PASSWORD) {
    throw new AppError('Invalid admin credentials', 401);
  }

  const token = generateToken({
    userId: ADMIN_ID,
    email: ADMIN_EMAIL,
    userType: 'admin',
  });

  return {
    admin: {
      id: ADMIN_ID,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: ADMIN_ROLE,
    },
    token,
  };
};

export const getAdminProfile = async (adminId: string) => {
  if (adminId !== ADMIN_ID) {
    throw new AppError('Admin not found', 404);
  }

  return {
    id: ADMIN_ID,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: ADMIN_ROLE,
  };
};

export const getAdminStats = async () => {
  let totalStudents = 0;
  let totalCompanies = 0;

  try {
    totalStudents = await prisma.user.count();
  } catch {
    totalStudents = 0;
  }

  try {
    // @ts-ignore - Company model may not exist yet
    totalCompanies = await prisma.company?.count() || 0;
  } catch {
    totalCompanies = 0;
  }

  return {
    totalStudents,
    totalCompanies,
    totalInternships: 0,
    totalApplications: 0,
    recentActivity: [
      { id: '1', type: 'user_register', message: 'New student registered', createdAt: new Date().toISOString() },
      { id: '2', type: 'cv_analysis', message: 'CV Analysis completed', createdAt: new Date().toISOString() },
    ],
  };
};

export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.profile?.fullName || 'Unknown',
      createdAt: user.createdAt.toISOString(),
      applicationsCount: user._count.applications,
    }));
  } catch {
    return [];
  }
};

export const getAllCompanies = async () => {
  try {
    // @ts-ignore - Company model may not exist yet
    const companies = await prisma.company?.findMany({
      orderBy: { createdAt: 'desc' },
    }) || [];

    return companies.map((company: { id: string; email: string; name: string; sector: string | null; verified: boolean; createdAt: Date }) => ({
      id: company.id,
      email: company.email,
      name: company.name,
      sector: company.sector,
      verified: company.verified,
      internshipsCount: 0,
      createdAt: company.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
};

export const getAllInternships = async () => {
  try {
    // @ts-ignore - Internship model may not exist yet
    const internships = await prisma.internship?.findMany({
      include: {
        company: {
          select: { name: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) || [];

    return internships.map((internship: {
      id: string;
      title: string;
      company: { name: string };
      location: string;
      locationType: string;
      isActive: boolean;
      _count: { applications: number };
      createdAt: Date;
    }) => ({
      id: internship.id,
      title: internship.title,
      companyName: internship.company.name,
      location: internship.location,
      locationType: internship.locationType,
      isActive: internship.isActive,
      applicationsCount: internship._count.applications,
      createdAt: internship.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
};
