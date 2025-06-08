import { Request, Response } from 'express';
import { FitnessActivity, DailyFitnessSummary } from '../models/fitness.model';

// Get fitness activities for a user within a date range
export const getFitnessActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, type } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'Start date and end date are required' });
      return;
    } // Build query
    const query: {
      user: string;
      date: { $gte: string | string[]; $lte: string | string[] };
      type?: string | string[];
    } = {
      user: userId,
      date: { $gte: startDate as string, $lte: endDate as string },
    };

    // Add type filter if provided
    if (type) {
      query.type = type as string | string[];
    }

    const activities = await FitnessActivity.find(query).sort({ date: 1 });

    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching fitness activities:', error);
    res.status(500).json({ message: 'Server error fetching fitness data' });
  }
};

// Get daily fitness summaries for a user within a date range
export const getDailyFitnessSummaries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'Start date and end date are required' });
      return;
    }

    const summaries = await DailyFitnessSummary.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    res.status(200).json(summaries);
  } catch (error) {
    console.error('Error fetching daily fitness summaries:', error);
    res.status(500).json({ message: 'Server error fetching fitness summary data' });
  }
};

// Create a new fitness activity
export const createFitnessActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { date, type, duration, caloriesBurned, distance, heartRate, steps, notes } = req.body;

    const fitnessActivity = new FitnessActivity({
      user: userId,
      date,
      type,
      duration,
      caloriesBurned,
      distance,
      heartRate,
      steps,
      notes,
      source: 'manual',
    });

    await fitnessActivity.save();

    // Update or create daily summary
    let summary = await DailyFitnessSummary.findOne({ user: userId, date });

    if (!summary) {
      // Create new summary
      summary = new DailyFitnessSummary({
        user: userId,
        date,
        totalCaloriesBurned: caloriesBurned,
        totalActiveMinutes: duration,
        totalSteps: steps,
        source: 'manual',
      });
    } else {
      // Update existing summary
      summary.totalCaloriesBurned += caloriesBurned;
      summary.totalActiveMinutes += duration;
      if (steps && summary.totalSteps) {
        summary.totalSteps += steps;
      } else if (steps) {
        summary.totalSteps = steps;
      }

      // If source was already Fitbit, keep it that way
      if (summary.source !== 'fitbit') {
        summary.source = 'manual';
      }
    }

    await summary.save();
    res.status(201).json(fitnessActivity);
  } catch (error) {
    console.error('Error creating fitness activity:', error);
    res.status(500).json({ message: 'Server error creating fitness activity' });
  }
};

// Update a fitness activity
export const updateFitnessActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const activity = await FitnessActivity.findOne({ _id: id, user: userId });
    if (!activity) {
      res.status(404).json({ message: 'Fitness activity not found' });
      return;
    }

    // If this is a Fitbit activity, don't allow updates
    if (activity.source === 'fitbit') {
      res.status(403).json({ message: 'Cannot update activities imported from Fitbit' });
      return;
    }

    const { date, type, duration, caloriesBurned, distance, heartRate, steps } = req.body;

    // Calculate differences for summary update
    const originalCalories = activity.caloriesBurned;
    const originalDuration = activity.duration;
    const originalSteps = activity.steps || 0;

    // Update only the provided fields
    if (date !== undefined) activity.date = date;
    if (type !== undefined) activity.type = type;
    if (duration !== undefined) activity.duration = duration;
    if (caloriesBurned !== undefined) activity.caloriesBurned = caloriesBurned;
    if (distance !== undefined) activity.distance = distance;
    if (heartRate !== undefined) activity.heartRate = heartRate;
    if (steps !== undefined) activity.steps = steps;
    // if (notes !== undefined) activity.notes = notes;

    await activity.save();

    // Update daily summary if needed
    if (
      date !== undefined ||
      caloriesBurned !== undefined ||
      duration !== undefined ||
      steps !== undefined
    ) {
      const summary = await DailyFitnessSummary.findOne({ user: userId, date: activity.date });

      if (summary) {
        // Adjust values
        if (caloriesBurned !== undefined) {
          summary.totalCaloriesBurned =
            summary.totalCaloriesBurned - originalCalories + caloriesBurned;
        }

        if (duration !== undefined) {
          summary.totalActiveMinutes = summary.totalActiveMinutes - originalDuration + duration;
        }

        if (steps !== undefined && summary.totalSteps) {
          summary.totalSteps = summary.totalSteps - originalSteps + (steps || 0);
        }

        await summary.save();
      }
    }

    res.status(200).json(activity);
  } catch (error) {
    console.error('Error updating fitness activity:', error);
    res.status(500).json({ message: 'Server error updating fitness activity' });
  }
};

// Delete a fitness activity
export const deleteFitnessActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const activity = await FitnessActivity.findOne({ _id: id, user: userId });

    if (!activity) {
      res.status(404).json({ message: 'Fitness activity not found' });
      return;
    }

    // If this is a Fitbit activity, don't allow deletion
    if (activity.source === 'fitbit') {
      res.status(403).json({ message: 'Cannot delete activities imported from Fitbit' });
      return;
    } // Store values for summary update
    const { date, caloriesBurned, duration, steps } = activity;

    // Delete the activity
    await FitnessActivity.deleteOne({ _id: id });

    // Update daily summary
    const summary = await DailyFitnessSummary.findOne({ user: userId, date });

    if (summary) {
      summary.totalCaloriesBurned -= caloriesBurned;
      summary.totalActiveMinutes -= duration;

      if (summary.totalSteps && steps) {
        summary.totalSteps -= steps;
      }

      await summary.save();
    }

    res.status(200).json({ message: 'Fitness activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting fitness activity:', error);
    res.status(500).json({ message: 'Server error deleting fitness activity' });
  }
};
