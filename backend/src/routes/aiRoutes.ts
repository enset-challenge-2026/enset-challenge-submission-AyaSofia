import { Router } from 'express';
import * as aiController from '../controllers/aiController';
import * as cvPerformanceController from '../controllers/cvPerformanceController';
import { authenticate } from '../middleware/authMiddleware';
import { uploadCV } from '../middleware/uploadMiddleware';

const router = Router();

router.use(authenticate);

// Basic CV analysis
router.post('/analyze-cv', uploadCV, aiController.analyzeCV);
router.post('/match-internships', aiController.matchInternships);

// CV Performance Analyzer (StageMatch IA)
router.post('/cv-performance', uploadCV, cvPerformanceController.analyzePerformance);
router.get('/cv-performance', cvPerformanceController.getLatestAnalysis);
router.get('/cv-performance/history', cvPerformanceController.getAnalysisHistory);

export default router;
