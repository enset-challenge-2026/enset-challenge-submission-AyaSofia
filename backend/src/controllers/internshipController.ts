import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as internshipService from '../services/internshipService';

export const create = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = internshipService.createInternshipSchema.parse(req.body);
    const internship = await internshipService.create(req.user!.userId, input);

    res.status(201).json({
      success: true,
      data: internship,
      message: 'Internship created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const list = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const internships = await internshipService.list(req.user!.userId);

    res.json({
      success: true,
      data: internships,
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
    const internship = await internshipService.get(req.user!.userId, id);

    res.json({
      success: true,
      data: internship,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const input = internshipService.updateInternshipSchema.parse(req.body);
    const internship = await internshipService.update(req.user!.userId, id, input);

    res.json({
      success: true,
      data: internship,
      message: 'Internship updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    await internshipService.remove(req.user!.userId, id);

    res.json({
      success: true,
      message: 'Internship deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const internship = await internshipService.toggleActive(req.user!.userId, id);

    res.json({
      success: true,
      data: internship,
      message: `Internship ${internship.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};
