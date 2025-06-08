import express from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// User routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.put('/preferences', userController.updateUserPreferences);

export default router;
