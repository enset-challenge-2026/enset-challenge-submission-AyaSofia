import { z } from 'zod';
import prisma from '../config/database';
import { ApplicationStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

export const createApplicationSchema = z.object({
  internshipId: z.string().min(1),
  internshipTitle: z.string().min(1),
  company: z.string().min(1),
});

export const updateApplicationSchema = z.object({
  status: z.enum(['APPLIED', 'INTERVIEWING', 'REJECTED', 'ACCEPTED']),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const getApplications = async (userId: string) => {
  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: { dateApplied: 'desc' },
  });

  return applications.map((app) => ({
    id: app.id,
    internshipId: app.internshipId,
    internshipTitle: app.internshipTitle,
    company: app.company,
    status: app.status,
    dateApplied: app.dateApplied.toISOString(),
  }));
};

export const createApplication = async (userId: string, input: CreateApplicationInput) => {
  const existing = await prisma.application.findUnique({
    where: {
      userId_internshipId: {
        userId,
        internshipId: input.internshipId,
      },
    },
  });

  if (existing) {
    throw new AppError('You have already applied to this internship', 400);
  }

  const application = await prisma.application.create({
    data: {
      userId,
      internshipId: input.internshipId,
      internshipTitle: input.internshipTitle,
      company: input.company,
    },
  });

  return {
    id: application.id,
    internshipId: application.internshipId,
    internshipTitle: application.internshipTitle,
    company: application.company,
    status: application.status,
    dateApplied: application.dateApplied.toISOString(),
  };
};

export const updateApplicationStatus = async (
  userId: string,
  applicationId: string,
  input: UpdateApplicationInput
) => {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId,
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: input.status as ApplicationStatus },
  });

  return {
    id: updated.id,
    internshipId: updated.internshipId,
    internshipTitle: updated.internshipTitle,
    company: updated.company,
    status: updated.status,
    dateApplied: updated.dateApplied.toISOString(),
  };
};

export const deleteApplication = async (userId: string, applicationId: string) => {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId,
    },
  });

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  await prisma.application.delete({
    where: { id: applicationId },
  });
};
