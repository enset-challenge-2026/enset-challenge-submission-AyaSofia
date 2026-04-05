import { z } from 'zod';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Test student account
// Email: student@test.com
// Password: student123
const TEST_STUDENT = {
  id: 'test-student-1',
  email: 'student@test.com',
  password: 'student123',
  profile: {
    fullName: 'Jean Dupont',
    education: 'Master Informatique - Université Paris-Saclay',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    interests: ['Intelligence Artificielle', 'Développement Web', 'Data Science'],
    location: 'Paris, France',
  },
};

export const register = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      profile: {
        create: {
          fullName: input.fullName,
          skills: [],
          interests: [],
        },
      },
    },
    include: {
      profile: true,
    },
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    userType: 'student',
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      userType: 'student' as const,
      profile: user.profile,
    },
    token,
  };
};

export const login = async (input: LoginInput) => {
  // Check for test account first
  if (input.email === TEST_STUDENT.email && input.password === TEST_STUDENT.password) {
    const token = generateToken({
      userId: TEST_STUDENT.id,
      email: TEST_STUDENT.email,
      userType: 'student',
    });

    return {
      user: {
        id: TEST_STUDENT.id,
        email: TEST_STUDENT.email,
        userType: 'student' as const,
        profile: TEST_STUDENT.profile,
      },
      token,
    };
  }

  // Try database login
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      profile: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValidPassword = await comparePassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    userType: 'student',
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      userType: 'student' as const,
      profile: user.profile,
    },
    token,
  };
};

export const changePassword = async (userId: string, input: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isValidPassword = await comparePassword(input.currentPassword, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 401);
  }

  const newPasswordHash = await hashPassword(input.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  return { message: 'Password changed successfully' };
};
