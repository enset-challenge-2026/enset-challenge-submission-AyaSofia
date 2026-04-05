import { Router } from 'express';
import * as companyAuthController from '../controllers/companyAuthController';

const router = Router();

router.post('/register', companyAuthController.register);
router.post('/login', companyAuthController.login);

export default router;
