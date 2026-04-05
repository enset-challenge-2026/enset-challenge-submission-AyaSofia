import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.get('/cv-analysis', profileController.getLatestCVAnalysis);

export default router;
