import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as geminiService from '../services/geminiService';
import * as profileService from '../services/profileService';
import { getBase64FromBuffer } from '../middleware/uploadMiddleware';
import { AppError } from '../middleware/errorHandler';

export const analyzeCV = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('CV file is required', 400);
    }

    const base64Data = getBase64FromBuffer(req.file.buffer, req.file.mimetype);
    const result = await geminiService.analyzeCV(
      req.user!.userId,
      base64Data,
      req.file.mimetype,
      req.file.originalname
    );

    res.json({
      success: true,
      data: result,
      message: 'CV analyzed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const matchInternships = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await profileService.getProfile(req.user!.userId);
    const cvAnalysis = await profileService.getLatestCVAnalysis(req.user!.userId);

    const studentProfile = {
      fullName: profile.fullName,
      email: profile.email,
      education: profile.education || '',
      skills: profile.skills,
      interests: profile.interests,
      location: profile.location || '',
    };

    const internships = await geminiService.matchInternships(
      studentProfile,
      cvAnalysis ? {
        summary: cvAnalysis.summary,
        extractedSkills: cvAnalysis.extractedSkills,
        careerSuggestions: cvAnalysis.careerSuggestions,
        weaknesses: cvAnalysis.weaknesses,
      } : null
    );

    res.json({
      success: true,
      data: internships,
    });
  } catch (error) {
    next(error);
  }
};
