import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/adminService';
import { AuthenticatedRequest } from '../types';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = adminService.adminLoginSchema.parse(req.body);
    const result = await adminService.adminLogin(input);

    res.json({
      success: true,
      data: result,
      message: 'Admin login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user!.userId;
    const profile = await adminService.getAdminProfile(adminId);

    res.json({
      success: true,
      data: profile,
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
    const stats = await adminService.getAdminStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await adminService.getAllUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companies = await adminService.getAllCompanies();

    res.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

export const getInternships = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const internships = await adminService.getAllInternships();

    res.json({
      success: true,
      data: internships,
    });
  } catch (error) {
    next(error);
  }
};
