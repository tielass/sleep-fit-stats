import { Request, Response } from 'express';
import User from '../models/user.model';

// Get user profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      preferences: user.preferences,
      fitbitConnected: !!user.fitbit?.accessToken,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

// Update user preferences
export const updateUserPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { preferences } = req.body;

    if (!preferences) {
      res.status(400).json({ message: 'Preferences are required' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update only the provided preference fields
    if (preferences.theme !== undefined) {
      user.preferences.theme = preferences.theme;
    }

    if (preferences.weekStartsOn !== undefined) {
      user.preferences.weekStartsOn = preferences.weekStartsOn;
    }

    if (preferences.measurementSystem !== undefined) {
      user.preferences.measurementSystem = preferences.measurementSystem;
    }

    if (preferences.timeFormat !== undefined) {
      user.preferences.timeFormat = preferences.timeFormat;
    }

    if (preferences.notifications !== undefined) {
      if (preferences.notifications.sleepReminders !== undefined) {
        user.preferences.notifications.sleepReminders = preferences.notifications.sleepReminders;
      }

      if (preferences.notifications.weeklyReports !== undefined) {
        user.preferences.notifications.weeklyReports = preferences.notifications.weeklyReports;
      }

      if (preferences.notifications.goalUpdates !== undefined) {
        user.preferences.notifications.goalUpdates = preferences.notifications.goalUpdates;
      }
    }

    await user.save();

    res.status(200).json({
      message: 'Preferences updated successfully',
      preferences: user.preferences,
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Server error updating user preferences' });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, email } = req.body;

    if (!name && !email) {
      res.status(400).json({ message: 'At least one field to update is required' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update fields if provided
    if (name) {
      user.name = name;
    }

    if (email) {
      // Check if email is already in use
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });

      if (existingUser) {
        res.status(409).json({ message: 'Email is already in use' });
        return;
      }

      user.email = email;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error updating user profile' });
  }
};
