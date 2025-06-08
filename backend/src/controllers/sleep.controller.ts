import { Request, Response } from 'express';
import SleepEntry from '../models/sleep.model';

// Get sleep entries for a user within a date range
export const getSleepEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'Start date and end date are required' });
      return;
    }

    const entries = await SleepEntry.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching sleep entries:', error);
    res.status(500).json({ message: 'Server error fetching sleep data' });
  }
};

// Get sleep statistics for a user
export const getSleepStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const startDate =
      req.query.startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = req.query.endDate || new Date().toISOString().split('T')[0];

    const entries = await SleepEntry.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (entries.length === 0) {
      res.status(200).json({
        averageDuration: 0,
        averageQuality: 0,
        averageDeepSleep: 0,
        averageRemSleep: 0,
        averageLightSleep: 0,
        startDate,
        endDate,
      });
      return;
    }

    // Calculate averages
    const totalEntries = entries.length;
    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalQuality = entries.reduce((sum, entry) => sum + entry.quality, 0);
    const totalDeepSleep = entries.reduce((sum, entry) => sum + entry.deepSleepPercentage, 0);
    const totalRemSleep = entries.reduce((sum, entry) => sum + entry.remSleepPercentage, 0);
    const totalLightSleep = entries.reduce((sum, entry) => sum + entry.lightSleepPercentage, 0);

    const stats = {
      averageDuration: Math.round(totalDuration / totalEntries),
      averageQuality: parseFloat((totalQuality / totalEntries).toFixed(1)),
      averageDeepSleep: parseFloat((totalDeepSleep / totalEntries).toFixed(1)),
      averageRemSleep: parseFloat((totalRemSleep / totalEntries).toFixed(1)),
      averageLightSleep: parseFloat((totalLightSleep / totalEntries).toFixed(1)),
      startDate,
      endDate,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching sleep statistics:', error);
    res.status(500).json({ message: 'Server error fetching sleep statistics' });
  }
};

// Create a new sleep entry
export const createSleepEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const {
      date,
      startTime,
      endTime,
      duration,
      quality,
      deepSleepPercentage,
      remSleepPercentage,
      lightSleepPercentage,
      awakeTime,
      notes,
    } = req.body;

    // Check for existing entry on the same date
    const existingEntry = await SleepEntry.findOne({ user: userId, date });
    if (existingEntry) {
      res.status(409).json({ message: 'Sleep entry already exists for this date' });
      return;
    }

    // Validate that percentages add up to 100%
    const totalPercentage = deepSleepPercentage + remSleepPercentage + lightSleepPercentage;
    if (Math.abs(totalPercentage - 100) > 0.1) {
      // Allow small floating point error
      res.status(400).json({ message: 'Sleep stage percentages must add up to 100%' });
      return;
    }

    const sleepEntry = new SleepEntry({
      user: userId,
      date,
      startTime,
      endTime,
      duration,
      quality,
      deepSleepPercentage,
      remSleepPercentage,
      lightSleepPercentage,
      awakeTime,
      notes,
      source: 'manual',
    });

    await sleepEntry.save();
    res.status(201).json(sleepEntry);
  } catch (error) {
    console.error('Error creating sleep entry:', error);
    res.status(500).json({ message: 'Server error creating sleep entry' });
  }
};

// Update a sleep entry
export const updateSleepEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const entry = await SleepEntry.findOne({ _id: id, user: userId });
    if (!entry) {
      res.status(404).json({ message: 'Sleep entry not found' });
      return;
    }

    const {
      date,
      startTime,
      endTime,
      duration,
      quality,
      deepSleepPercentage,
      remSleepPercentage,
      lightSleepPercentage,
      awakeTime,
      notes,
    } = req.body;

    // Validate that percentages add up to 100%
    if (
      deepSleepPercentage !== undefined &&
      remSleepPercentage !== undefined &&
      lightSleepPercentage !== undefined
    ) {
      const totalPercentage = deepSleepPercentage + remSleepPercentage + lightSleepPercentage;
      if (Math.abs(totalPercentage - 100) > 0.1) {
        // Allow small floating point error
        res.status(400).json({ message: 'Sleep stage percentages must add up to 100%' });
        return;
      }
    }

    // Update only the provided fields
    if (date !== undefined) entry.date = date;
    if (startTime !== undefined) entry.startTime = startTime;
    if (endTime !== undefined) entry.endTime = endTime;
    if (duration !== undefined) entry.duration = duration;
    if (quality !== undefined) entry.quality = quality;
    if (deepSleepPercentage !== undefined) entry.deepSleepPercentage = deepSleepPercentage;
    if (remSleepPercentage !== undefined) entry.remSleepPercentage = remSleepPercentage;
    if (lightSleepPercentage !== undefined) entry.lightSleepPercentage = lightSleepPercentage;
    if (awakeTime !== undefined) entry.awakeTime = awakeTime;
    if (notes !== undefined) entry.notes = notes;

    await entry.save();
    res.status(200).json(entry);
  } catch (error) {
    console.error('Error updating sleep entry:', error);
    res.status(500).json({ message: 'Server error updating sleep entry' });
  }
};

// Delete a sleep entry
export const deleteSleepEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const entry = await SleepEntry.findOneAndDelete({ _id: id, user: userId });

    if (!entry) {
      res.status(404).json({ message: 'Sleep entry not found' });
      return;
    }

    res.status(200).json({ message: 'Sleep entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting sleep entry:', error);
    res.status(500).json({ message: 'Server error deleting sleep entry' });
  }
};
