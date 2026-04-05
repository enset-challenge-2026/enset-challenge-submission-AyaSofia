import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { LocationType, Prisma } from '@prisma/client';

// Test student constants
const TEST_STUDENT_ID = 'test-student-1';

// Ensure test student exists in database
const ensureTestStudentExists = async () => {
  try {
    const existing = await prisma.user.findUnique({
      where: { id: TEST_STUDENT_ID },
    });

    if (!existing) {
      // Check if email is already used
      const existingEmail = await prisma.user.findUnique({
        where: { email: 'student@test.com' },
      });

      if (existingEmail) {
        console.log('Test student email exists, using existing user');
        return;
      }

      // Create test student
      const user = await prisma.user.create({
        data: {
          id: TEST_STUDENT_ID,
          email: 'student@test.com',
          passwordHash: '$2b$10$placeholder', // Not used for login
        },
      });

      // Create profile for test student
      await prisma.profile.create({
        data: {
          userId: user.id,
          fullName: 'Jean Dupont (Test)',
          education: 'Master Informatique - Université Paris-Saclay',
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
          interests: ['Développement Web', 'Intelligence Artificielle', 'Startups'],
          location: 'Paris, France',
        },
      });

      console.log('Test student created successfully');
    }
  } catch (error) {
    console.log('Test student setup error:', error instanceof Error ? error.message : 'unknown error');
  }
};

export const applySchema = z.object({
  coverLetter: z.string().optional(),
});

export type ApplyInput = z.infer<typeof applySchema>;

export interface BrowseFilters {
  search?: string;
  location?: string;
  locationType?: string;
  skills?: string[];
}

export const browse = async (filters?: BrowseFilters) => {
  const where: Prisma.InternshipWhereInput = {
    isActive: true,
  };

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { company: { name: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  if (filters?.location) {
    where.location = { contains: filters.location, mode: 'insensitive' };
  }

  if (filters?.locationType && ['REMOTE', 'ONSITE', 'HYBRID'].includes(filters.locationType)) {
    where.locationType = filters.locationType as LocationType;
  }

  if (filters?.skills && filters.skills.length > 0) {
    where.skills = { hasSome: filters.skills };
  }

  const internships = await prisma.internship.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          sector: true,
          logoUrl: true,
          location: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return internships;
};

export const getById = async (internshipId: string) => {
  const internship = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      isActive: true,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          sector: true,
          description: true,
          logoUrl: true,
          website: true,
          location: true,
        },
      },
    },
  });

  if (!internship) {
    throw new AppError('Internship not found', 404);
  }

  return internship;
};

export const apply = async (userId: string, internshipId: string, input: ApplyInput) => {
  // Ensure test student exists if using test account
  if (userId === TEST_STUDENT_ID) {
    await ensureTestStudentExists();
  }

  // Check if internship exists and is active
  const internship = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      isActive: true,
    },
  });

  if (!internship) {
    throw new AppError('Internship not found or no longer active', 404);
  }

  // Check if already applied
  const existingApplication = await prisma.companyApplication.findUnique({
    where: {
      internshipId_userId: {
        internshipId,
        userId,
      },
    },
  });

  if (existingApplication) {
    throw new AppError('You have already applied to this internship', 400);
  }

  // Create application
  const application = await prisma.companyApplication.create({
    data: {
      internshipId,
      userId,
      coverLetter: input.coverLetter || null,
    },
    include: {
      internship: {
        select: {
          title: true,
          company: {
            select: { name: true },
          },
        },
      },
    },
  });

  return application;
};

export const getStudentApplications = async (userId: string) => {
  // Ensure test student exists if using test account
  if (userId === TEST_STUDENT_ID) {
    await ensureTestStudentExists();
  }

  const applications = await prisma.companyApplication.findMany({
    where: { userId },
    include: {
      internship: {
        select: {
          id: true,
          title: true,
          location: true,
          company: {
            select: {
              name: true,
              logoUrl: true,
            },
          },
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  });

  return applications;
};

export const withdrawApplication = async (userId: string, applicationId: string) => {
  const application = await prisma.companyApplication.findFirst({
    where: {
      id: applicationId,
      userId,
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  // Only allow withdrawal if status is NEW or REVIEWING
  if (!['NEW', 'REVIEWING'].includes(application.status)) {
    throw new AppError('Cannot withdraw application at this stage', 400);
  }

  await prisma.companyApplication.delete({
    where: { id: applicationId },
  });

  return { withdrawn: true };
};
