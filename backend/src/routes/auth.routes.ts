import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Fitbit OAuth routes
router.get('/fitbit', authController.connectFitbit);
router.get('/fitbit/callback', authController.fitbitCallback);
router.get('/fitbit/success', authController.fitbitSuccess);
router.get('/fitbit/failure', authController.fitbitFailure);

// Protected routes
router.use(authenticate); // Apply authentication middleware
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);

export default router;
