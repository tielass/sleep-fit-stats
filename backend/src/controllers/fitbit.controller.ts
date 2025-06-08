import { Request, Response } from 'express';
import * as FitbitService from '../services/fitbit.service';

// Sync sleep data from Fitbit
export const syncSleepData = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.query;

    // Validate dates
    if (!startDate || typeof startDate !== 'string') {
      res.status(400).json({ message: 'Valid start date is required' });
      return;
    }

    await FitbitService.syncSleepData(
      userId,
      startDate,
      endDate && typeof endDate === 'string' ? endDate : undefined
    );

    res.status(200).json({ message: 'Sleep data synchronized successfully' });
  } catch (error) {
    console.error('Error syncing sleep data:', error);
    res.status(500).json({ message: 'Error syncing sleep data from Fitbit' });
  }
};

// Sync activity data from Fitbit
export const syncActivityData = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { date } = req.query;

    await FitbitService.syncActivityData(
      userId,
      date && typeof date === 'string' ? date : undefined
    );

    res.status(200).json({ message: 'Activity data synchronized successfully' });
  } catch (error) {
    console.error('Error syncing activity data:', error);
    res.status(500).json({ message: 'Error syncing activity data from Fitbit' });
  }
};

// Check Fitbit connection status
export const checkConnectionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const status = await FitbitService.checkFitbitConnection(userId);
    res.status(200).json(status);
  } catch (error) {
    console.error('Error checking Fitbit connection status:', error);
    res.status(500).json({ message: 'Error checking Fitbit connection' });
  }
};

// Disconnect Fitbit
export const disconnectFitbit = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const success = await FitbitService.disconnectFitbit(userId);
    if (success) {
      res.status(200).json({ message: 'Fitbit disconnected successfully' });
    } else {
      res.status(400).json({ message: 'Failed to disconnect Fitbit' });
    }
  } catch (error) {
    console.error('Error disconnecting Fitbit:', error);
    res.status(500).json({ message: 'Error disconnecting from Fitbit' });
  }
};

// Sync all data
export const syncAllData = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Default to last 30 days if not specified
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const defaultStartDate = thirtyDaysAgo.toISOString().split('T')[0];

    const { startDate = defaultStartDate } = req.query;
    const today = new Date().toISOString().split('T')[0];

    // Run synchronization for sleep and activity data
    await FitbitService.syncSleepData(
      userId,
      typeof startDate === 'string' ? startDate : defaultStartDate,
      today
    );

    // For activity, we'll sync each day separately to ensure complete data
    const startDateObj = new Date(typeof startDate === 'string' ? startDate : defaultStartDate);
    const endDateObj = new Date(today);

    // Loop through each day in the range
    for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
      const currentDate = d.toISOString().split('T')[0];
      await FitbitService.syncActivityData(userId, currentDate);
    }

    res.status(200).json({
      message: 'All data synchronized successfully',
      period: {
        startDate: typeof startDate === 'string' ? startDate : defaultStartDate,
        endDate: today,
      },
    });
  } catch (error) {
    console.error('Error syncing all data:', error);
    res.status(500).json({ message: 'Error syncing data from Fitbit' });
  }
};
