//resultRoutes.js
import express from 'express';
import auth from '../middleware/auth.js';
import adminCheck from '../middleware/adminCheck.js';
import { distributeRewards } from '../controllers/resultController.js';

const router = express.Router();

router.post('/distribute', auth, adminCheck, distributeRewards);

export default router;