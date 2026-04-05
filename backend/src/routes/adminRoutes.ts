import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/auth/login', adminController.login);

// Protected routes (require admin authentication)
router.get('/profile', authenticate, adminController.getProfile);
router.get('/stats', authenticate, adminController.getStats);
router.get('/users', authenticate, adminController.getUsers);
router.get('/companies', authenticate, adminController.getCompanies);
router.get('/internships', authenticate, adminController.getInternships);

export default router;
