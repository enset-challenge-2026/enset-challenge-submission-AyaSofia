import { z } from 'zod';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CompanyApplicationStatus } from '@prisma/client';

export const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED']),
});

export const updateNotesSchema = z.object({
  notes: z.string(),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdateNotesInput = z.infer<typeof updateNotesSchema>;

export const listByCompany = async (
  companyId: string,
  filters?: { internshipId?: string; status?: string }
) => {
  const applications = await prisma.companyApplication.findMany({
    where: {
      internship: {
        companyId,
        ...(filters?.internshipId ? { id: filters.internshipId } : {}),
      },
      ...(filters?.status ? { status: filters.status as CompanyApplicationStatus } : {}),
    },
    include: {
      internship: {
        select: {
          id: true,
          title: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              education: true,
              skills: true,
              location: true,
            },
          },
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  });

  return applications;
};

export const listByInternship = async (companyId: string, internshipId: string) => {
  // Verify the internship belongs to the company
  const internship = await prisma.internship.findFirst({
    where: { id: internshipId, companyId },
  });

  if (!internship) {
    throw new AppError('Internship not found', 404);
  }

  const applications = await prisma.companyApplication.findMany({
    where: { internshipId },
    include: {
      internship: {
        select: {
          id: true,
          title: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              education: true,
              skills: true,
              location: true,
            },
          },
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  });

  return applications;
};

export const get = async (companyId: string, applicationId: string) => {
  const application = await prisma.companyApplication.findFirst({
    where: {
      id: applicationId,
      internship: { companyId },
    },
    include: {
      internship: {
        select: {
          id: true,
          title: true,
          description: true,
          skills: true,
          requirements: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              education: true,
              skills: true,
              interests: true,
              location: true,
            },
          },
          cvAnalyses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              summary: true,
              extractedSkills: true,
              careerSuggestions: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  return application;
};

export const updateStatus = async (
  companyId: string,
  applicationId: string,
  input: UpdateStatusInput
) => {
  // Verify ownership
  const existing = await prisma.companyApplication.findFirst({
    where: {
      id: applicationId,
      internship: { companyId },
    },
  });

  if (!existing) {
    throw new AppError('Application not found', 404);
  }

  const application = await prisma.companyApplication.update({
    where: { id: applicationId },
    data: { status: input.status },
    include: {
      internship: {
        select: { title: true },
      },
      user: {
        select: {
          email: true,
          profile: {
            select: { fullName: true },
          },
        },
      },
    },
  });

  return application;
};

export const updateNotes = async (
  companyId: string,
  applicationId: string,
  input: UpdateNotesInput
) => {
  // Verify ownership
  const existing = await prisma.companyApplication.findFirst({
    where: {
      id: applicationId,
      internship: { companyId },
    },
  });

  if (!existing) {
    throw new AppError('Application not found', 404);
  }

  const application = await prisma.companyApplication.update({
    where: { id: applicationId },
    data: { notes: input.notes },
  });

  return application;
};

export const getStats = async (companyId: string) => {
  const stats = await prisma.companyApplication.groupBy({
    by: ['status'],
    where: {
      internship: { companyId },
    },
    _count: true,
  });

  const statusCounts: Record<string, number> = {
    NEW: 0,
    REVIEWING: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    OFFER: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  };

  stats.forEach((s) => {
    statusCounts[s.status] = s._count;
  });

  return statusCounts;
};
