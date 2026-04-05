import { Request, Response, NextFunction } from 'express';
import * as companyAuthService from '../services/companyAuthService';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = companyAuthService.companyRegisterSchema.parse(req.body);
    const result = await companyAuthService.register(input);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Company registration successful',
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
    const input = companyAuthService.companyLoginSchema.parse(req.body);
    const result = await companyAuthService.login(input);

    res.json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};
