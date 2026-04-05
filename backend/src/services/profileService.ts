import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  education: z.string().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  location: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Test student profile data
const TEST_STUDENT_ID = 'test-student-1';
const TEST_STUDENT_PROFILE = {
  id: 'test-profile-1',
  userId: TEST_STUDENT_ID,
  fullName: 'Jean Dupont',
  education: 'Master Informatique - Université Paris-Saclay',
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
  interests: ['Intelligence Artificielle', 'Développement Web', 'Data Science'],
  location: 'Paris, France',
  email: 'student@test.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const getProfile = async (userId: string) => {
  // Return test profile for test user
  if (userId === TEST_STUDENT_ID) {
    return TEST_STUDENT_PROFILE;
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!profile) {
    throw new AppError('Profile not found', 404);
  }

  return {
    ...profile,
    email: profile.user.email,
  };
};

export const updateProfile = async (userId: string, input: UpdateProfileInput) => {
  const profile = await prisma.profile.update({
    where: { userId },
    data: input,
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return {
    ...profile,
    email: profile.user.email,
  };
};

export const getLatestCVAnalysis = async (userId: string) => {
  const analysis = await prisma.cVAnalysis.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return analysis;
};
