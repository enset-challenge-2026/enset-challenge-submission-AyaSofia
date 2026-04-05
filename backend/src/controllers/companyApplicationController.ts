import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as companyApplicationService from '../services/companyApplicationService';

export const list = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { internshipId, status } = req.query;
    const applications = await companyApplicationService.listByCompany(
      req.user!.userId,
      {
        internshipId: internshipId as string | undefined,
        status: status as string | undefined,
      }
    );

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const listByInternship = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const internshipId = req.params.internshipId as string;
    const applications = await companyApplicationService.listByInternship(
      req.user!.userId,
      internshipId
    );

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const get = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const application = await companyApplicationService.get(req.user!.userId, id);

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const input = companyApplicationService.updateStatusSchema.parse(req.body);
    const application = await companyApplicationService.updateStatus(
      req.user!.userId,
      id,
      input
    );

    res.json({
      success: true,
      data: application,
      message: 'Application status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const input = companyApplicationService.updateNotesSchema.parse(req.body);
    const application = await companyApplicationService.updateNotes(
      req.user!.userId,
      id,
      input
    );

    res.json({
      success: true,
      data: application,
      message: 'Notes updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await companyApplicationService.getStats(req.user!.userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
