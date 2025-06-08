import express from 'express';
import * as sleepController from '../controllers/sleep.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET sleep statistics - this more specific route must come first
router.get('/statistics/:userId', sleepController.getSleepStats);

// GET sleep entries by date range
router.get('/:userId', sleepController.getSleepEntries);

// POST - Create a new sleep entry
router.post('/', sleepController.createSleepEntry);

// PUT - Update a sleep entry
router.put('/:id', sleepController.updateSleepEntry);

// DELETE - Delete a sleep entry
router.delete('/:id', sleepController.deleteSleepEntry);

export default router;
