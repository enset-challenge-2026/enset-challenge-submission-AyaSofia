import { Router } from 'express';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';
import applicationRoutes from './applicationRoutes';
import aiRoutes from './aiRoutes';
import companyAuthRoutes from './companyAuthRoutes';
import companyRoutes from './companyRoutes';
import publicInternshipRoutes from './publicInternshipRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// Student routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/applications', applicationRoutes);
router.use('/ai', aiRoutes);

// Company routes
router.use('/company/auth', companyAuthRoutes);
router.use('/company', companyRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Public internship routes (for students to browse and apply)
router.use('/internships', publicInternshipRoutes);

export default router;
