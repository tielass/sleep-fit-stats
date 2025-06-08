import express from 'express';
import * as fitnessController from '../controllers/fitness.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET fitness activities by date range
router.get('/activities/:userId', fitnessController.getFitnessActivities);

// GET daily fitness summaries by date range
router.get('/summaries/:userId', fitnessController.getDailyFitnessSummaries);

// POST - Create a new fitness activity
router.post('/activities', fitnessController.createFitnessActivity);

// PUT - Update a fitness activity
router.put('/activities/:id', fitnessController.updateFitnessActivity);

// DELETE - Delete a fitness activity
router.delete('/activities/:id', fitnessController.deleteFitnessActivity);

export default router;
