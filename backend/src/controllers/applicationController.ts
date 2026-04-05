import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as applicationService from '../services/applicationService';

export const getApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const applications = await applicationService.getApplications(req.user!.userId);

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = applicationService.createApplicationSchema.parse(req.body);
    const application = await applicationService.createApplication(req.user!.userId, input);

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = applicationService.updateApplicationSchema.parse(req.body);
    const application = await applicationService.updateApplicationStatus(
      req.user!.userId,
      req.params.id as string,
      input
    );

    res.json({
      success: true,
      data: application,
      message: 'Application status updated',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await applicationService.deleteApplication(req.user!.userId, req.params.id as string);

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
