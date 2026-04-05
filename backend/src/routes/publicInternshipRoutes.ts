import { Router } from 'express';
import * as publicInternshipController from '../controllers/publicInternshipController';
import { authenticate, requireStudent } from '../middleware/authMiddleware';

const router = Router();

// Public routes (no auth required)
router.get('/', publicInternshipController.browse);

// Protected routes (student auth required) - must come before /:id
router.get('/my-applications', authenticate, requireStudent, publicInternshipController.getMyApplications);
router.delete('/applications/:applicationId', authenticate, requireStudent, publicInternshipController.withdrawApplication);

// Public route for viewing a single internship
router.get('/:id', publicInternshipController.getById);

// Protected route for applying
router.post('/:id/apply', authenticate, requireStudent, publicInternshipController.apply);

export default router;
