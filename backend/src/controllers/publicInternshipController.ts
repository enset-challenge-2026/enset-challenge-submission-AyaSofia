import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as publicInternshipService from '../services/publicInternshipService';

export const browse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, location, locationType, skills } = req.query;

    const filters: publicInternshipService.BrowseFilters = {};

    if (search && typeof search === 'string') {
      filters.search = search;
    }
    if (location && typeof location === 'string') {
      filters.location = location;
    }
    if (locationType && typeof locationType === 'string') {
      filters.locationType = locationType;
    }
    if (skills) {
      filters.skills = Array.isArray(skills) ? skills as string[] : [skills as string];
    }

    const internships = await publicInternshipService.browse(filters);

    res.json({
      success: true,
      data: internships,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const internship = await publicInternshipService.getById(id);

    res.json({
      success: true,
      data: internship,
    });
  } catch (error) {
    next(error);
  }
};

export const apply = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const input = publicInternshipService.applySchema.parse(req.body);
    const application = await publicInternshipService.apply(
      req.user!.userId,
      id,
      input
    );

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const applications = await publicInternshipService.getStudentApplications(
      req.user!.userId
    );

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const applicationId = req.params.applicationId as string;
    await publicInternshipService.withdrawApplication(
      req.user!.userId,
      applicationId
    );

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
    });
  } catch (error) {
    next(error);
  }
};
