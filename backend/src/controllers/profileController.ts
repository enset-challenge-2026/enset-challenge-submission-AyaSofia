import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as profileService from '../services/profileService';

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await profileService.getProfile(req.user!.userId);

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
    const input = profileService.updateProfileSchema.parse(req.body);
    const profile = await profileService.updateProfile(req.user!.userId, input);

    res.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestCVAnalysis = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analysis = await profileService.getLatestCVAnalysis(req.user!.userId);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};
