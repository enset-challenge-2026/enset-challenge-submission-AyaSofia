import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as cvPerformanceService from '../services/cvPerformanceService';
import { AppError } from '../middleware/errorHandler';

export const analyzePerformance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    const base64Data = file.buffer.toString('base64');
    const result = await cvPerformanceService.analyzePerformance(
      req.user!.userId,
      base64Data,
      file.mimetype,
      file.originalname
    );

    res.json({
      success: true,
      data: result,
      message: 'CV performance analysis completed',
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestAnalysis = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await cvPerformanceService.getLatestAnalysis(req.user!.userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalysisHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const history = await cvPerformanceService.getAnalysisHistory(req.user!.userId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
