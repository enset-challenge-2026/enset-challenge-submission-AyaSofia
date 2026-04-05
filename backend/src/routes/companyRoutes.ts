import { Router } from 'express';
import * as companyProfileController from '../controllers/companyProfileController';
import * as internshipController from '../controllers/internshipController';
import * as companyApplicationController from '../controllers/companyApplicationController';
import { authenticate, requireCompany } from '../middleware/authMiddleware';

const router = Router();

// All routes require company authentication
router.use(authenticate);
router.use(requireCompany);

// Profile routes
router.get('/profile', companyProfileController.getProfile);
router.put('/profile', companyProfileController.updateProfile);
router.get('/stats', companyProfileController.getStats);

// Internship routes
router.get('/internships', internshipController.list);
router.post('/internships', internshipController.create);
router.get('/internships/:id', internshipController.get);
router.put('/internships/:id', internshipController.update);
router.delete('/internships/:id', internshipController.remove);
router.patch('/internships/:id/toggle-active', internshipController.toggleActive);

// Application routes
router.get('/applications', companyApplicationController.list);
router.get('/applications/stats', companyApplicationController.getStats);
router.get('/applications/:id', companyApplicationController.get);
router.patch('/applications/:id/status', companyApplicationController.updateStatus);
router.patch('/applications/:id/notes', companyApplicationController.updateNotes);
router.get('/internships/:internshipId/applications', companyApplicationController.listByInternship);

export default router;
