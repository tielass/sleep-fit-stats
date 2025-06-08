import express from 'express';
import * as fitbitController from '../controllers/fitbit.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET Fitbit connection status
router.get('/status', fitbitController.checkConnectionStatus);

// POST - Sync sleep data from Fitbit
router.post('/sync/sleep', fitbitController.syncSleepData);

// POST - Sync activity data from Fitbit
router.post('/sync/activity', fitbitController.syncActivityData);

// POST - Sync all data from Fitbit
router.post('/sync/all', fitbitController.syncAllData);

// DELETE - Disconnect Fitbit
router.delete('/disconnect', fitbitController.disconnectFitbit);

export default router;
