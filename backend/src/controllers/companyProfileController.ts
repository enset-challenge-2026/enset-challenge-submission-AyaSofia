import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as companyProfileService from '../services/companyProfileService';

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await companyProfileService.getProfile(req.user!.userId);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = companyProfileService.updateCompanyProfileSchema.parse(req.body);
    const profile = await companyProfileService.updateProfile(req.user!.userId, input);

    res.json({
      success: true,
      data: profile,
      message: 'Company profile updated successfully',
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
    const stats = await companyProfileService.getCompanyStats(req.user!.userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
