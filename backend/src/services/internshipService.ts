import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Test company constants
const TEST_COMPANY_ID = 'test-company-1';

// Ensure test company exists in database
const ensureTestCompanyExists = async () => {
  try {
    const existing = await prisma.company.findUnique({
      where: { id: TEST_COMPANY_ID },
    });

    if (!existing) {
      // Check if email is already used
      const existingEmail = await prisma.company.findUnique({
        where: { email: 'company@test.com' },
      });

      if (existingEmail) {
        // Email exists, update the record to use our test ID
        console.log('Test company email exists, using existing company');
        return;
      }

      await prisma.company.create({
        data: {
          id: TEST_COMPANY_ID,
          email: 'company@test.com',
          passwordHash: '$2b$10$placeholder', // Not used for login (handled in authService)
          siret: '99999999999999', // Unique SIRET for test company
          name: 'TechCorp France (Test)',
          sector: 'Technologies',
          description: 'Entreprise innovante spécialisée dans le développement de solutions logicielles.',
          website: 'https://techcorp.example.com',
          location: 'Paris, France',
          verified: true,
        },
      });
      console.log('Test company created successfully');
    }
  } catch (error) {
    // Company might already exist or creation might fail
    console.log('Test company setup error:', error instanceof Error ? error.message : 'unknown error');
  }
};

export const createInternshipSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  skills: z.array(z.string()).min(1, 'At least one skill is needed'),
  location: z.string().min(2, 'Location is required'),
  locationType: z.enum(['REMOTE', 'ONSITE', 'HYBRID']),
  duration: z.string().min(1, 'Duration is required'),
  compensation: z.string().optional(),
  startDate: z.string().optional(),
});

export const updateInternshipSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(50).optional(),
  requirements: z.array(z.string()).min(1).optional(),
  skills: z.array(z.string()).min(1).optional(),
  location: z.string().min(2).optional(),
  locationType: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).optional(),
  duration: z.string().min(1).optional(),
  compensation: z.string().optional(),
  startDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;

export const create = async (companyId: string, input: CreateInternshipInput) => {
  // Ensure test company exists if using test account
  if (companyId === TEST_COMPANY_ID) {
    await ensureTestCompanyExists();
  }

  const internship = await prisma.internship.create({
    data: {
      companyId,
      title: input.title,
      description: input.description,
      requirements: input.requirements,
      skills: input.skills,
      location: input.location,
      locationType: input.locationType,
      duration: input.duration,
      compensation: input.compensation || null,
      startDate: input.startDate ? new Date(input.startDate) : null,
    },
  });

  return internship;
};

export const list = async (companyId: string) => {
  // Ensure test company exists if using test account
  if (companyId === TEST_COMPANY_ID) {
    await ensureTestCompanyExists();
  }

  const internships = await prisma.internship.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return internships;
};

export const get = async (companyId: string, internshipId: string) => {
  const internship = await prisma.internship.findFirst({
    where: {
      id: internshipId,
      companyId,
    },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!internship) {
    throw new AppError('Internship not found', 404);
  }

  return internship;
};

export const update = async (companyId: string, internshipId: string, input: UpdateInternshipInput) => {
  // Verify ownership
  const existing = await prisma.internship.findFirst({
    where: { id: internshipId, companyId },
  });

  if (!existing) {
    throw new AppError('Internship not found', 404);
  }

  const internship = await prisma.internship.update({
    where: { id: internshipId },
    data: {
      ...input,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
    },
  });

  return internship;
};

export const remove = async (companyId: string, internshipId: string) => {
  // Verify ownership
  const existing = await prisma.internship.findFirst({
    where: { id: internshipId, companyId },
  });

  if (!existing) {
    throw new AppError('Internship not found', 404);
  }

  await prisma.internship.delete({
    where: { id: internshipId },
  });

  return { deleted: true };
};

export const toggleActive = async (companyId: string, internshipId: string) => {
  // Verify ownership
  const existing = await prisma.internship.findFirst({
    where: { id: internshipId, companyId },
  });

  if (!existing) {
    throw new AppError('Internship not found', 404);
  }

  const internship = await prisma.internship.update({
    where: { id: internshipId },
    data: {
      isActive: !existing.isActive,
    },
  });

  return internship;
};
