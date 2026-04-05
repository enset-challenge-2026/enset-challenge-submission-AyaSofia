import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = authService.registerSchema.parse(req.body);
    const result = await authService.register(input);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = authService.loginSchema.parse(req.body);
    const result = await authService.login(input);

    res.json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as Request & { user: { userId: string } }).user.userId;
    const input = authService.changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(userId, input);

    res.json({
      success: true,
      data: result,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
