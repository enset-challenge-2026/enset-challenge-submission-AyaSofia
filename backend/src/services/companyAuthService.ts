import { z } from 'zod';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

// SIRET validation: 14 digits
const siretRegex = /^\d{14}$/;

export const companyRegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  siret: z.string().regex(siretRegex, 'SIRET must be exactly 14 digits'),
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  sector: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
});

export const companyLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type CompanyRegisterInput = z.infer<typeof companyRegisterSchema>;
export type CompanyLoginInput = z.infer<typeof companyLoginSchema>;

// Test company account
// Email: company@test.com
// Password: company123
const TEST_COMPANY = {
  id: 'test-company-1',
  email: 'company@test.com',
  password: 'company123',
  name: 'TechCorp France',
  siret: '12345678901234',
  sector: 'Technologies',
  description: 'Entreprise innovante spécialisée dans le développement de solutions logicielles.',
  website: 'https://techcorp.example.com',
  location: 'Paris, France',
  verified: true,
};

export const register = async (input: CompanyRegisterInput) => {
  // Check if email already exists
  // @ts-ignore - Company model may not exist yet
  const existingEmail = await prisma.company?.findUnique({
    where: { email: input.email },
  });

  if (existingEmail) {
    throw new AppError('Email already registered', 400);
  }

  // Check if SIRET already exists
  // @ts-ignore - Company model may not exist yet
  const existingSiret = await prisma.company?.findUnique({
    where: { siret: input.siret },
  });

  if (existingSiret) {
    throw new AppError('SIRET already registered', 400);
  }

  const passwordHash = await hashPassword(input.password);

  // @ts-ignore - Company model may not exist yet
  const company = await prisma.company?.create({
    data: {
      email: input.email,
      passwordHash,
      siret: input.siret,
      name: input.name,
      sector: input.sector || null,
      website: input.website || null,
      location: input.location || null,
    },
  });

  if (!company) {
    throw new AppError('Failed to create company', 500);
  }

  const token = generateToken({
    userId: company.id,
    email: company.email,
    userType: 'company',
  });

  return {
    company: {
      id: company.id,
      email: company.email,
      name: company.name,
      siret: company.siret,
      sector: company.sector,
      website: company.website,
      location: company.location,
      verified: company.verified,
    },
    token,
  };
};

export const login = async (input: CompanyLoginInput) => {
  // Check for test account first
  if (input.email === TEST_COMPANY.email && input.password === TEST_COMPANY.password) {
    const token = generateToken({
      userId: TEST_COMPANY.id,
      email: TEST_COMPANY.email,
      userType: 'company',
    });

    return {
      company: {
        id: TEST_COMPANY.id,
        email: TEST_COMPANY.email,
        name: TEST_COMPANY.name,
        siret: TEST_COMPANY.siret,
        sector: TEST_COMPANY.sector,
        description: TEST_COMPANY.description,
        website: TEST_COMPANY.website,
        location: TEST_COMPANY.location,
        verified: TEST_COMPANY.verified,
      },
      token,
    };
  }

  // Try database login
  // @ts-ignore - Company model may not exist yet
  const company = await prisma.company?.findUnique({
    where: { email: input.email },
  });

  if (!company) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValidPassword = await comparePassword(input.password, company.passwordHash);

  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({
    userId: company.id,
    email: company.email,
    userType: 'company',
  });

  return {
    company: {
      id: company.id,
      email: company.email,
      name: company.name,
      siret: company.siret,
      sector: company.sector,
      website: company.website,
      location: company.location,
      verified: company.verified,
    },
    token,
  };
};
