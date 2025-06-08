import axios from 'axios';
import qs from 'qs';
import User from '../models/user.model';
import SleepEntry from '../models/sleep.model';
import { FitnessActivity, DailyFitnessSummary } from '../models/fitness.model';

// Base URLs for Fitbit API
const FITBIT_API_URL = 'https://api.fitbit.com';
const FITBIT_AUTH_URL = 'https://api.fitbit.com/oauth2/token';

// Handle refreshing access token
const refreshAccessToken = async (userId: string): Promise<string | null> => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fitbit || !user.fitbit.refreshToken) {
      throw new Error('User not found or missing Fitbit refresh token');
    }

    const response = await axios({
      method: 'post',
      url: FITBIT_AUTH_URL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      data: qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: user.fitbit.refreshToken,
      }),
    });

    // Update tokens in database
    user.fitbit.accessToken = response.data.access_token;
    user.fitbit.refreshToken = response.data.refresh_token;
    await user.save();

    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing Fitbit access token:', error);
    return null;
  }
};

// Define Fitbit API response types
interface FitbitSleepData {
  sleep: Array<{
    isMainSleep: boolean;
    dateOfSleep: string;
    startTime: string;
    endTime: string;
    minutesAsleep: number;
    minutesAwake: number;
    levels?: {
      summary?: {
        deep?: { minutes: number };
        rem?: { minutes: number };
        light?: { minutes: number };
      };
    };
    [key: string]: unknown;
  }>;
}

interface FitbitActivityData {
  summary: {
    caloriesOut?: number;
    fairlyActiveMinutes?: number;
    veryActiveMinutes?: number;
    steps?: number;
    [key: string]: unknown;
  };
  activities?: Array<{
    activityName: string;
    logId: number | string;
    duration: number;
    calories?: number;
    distance?: number;
    steps?: number;
    averageHeartRate?: number;
    maxHeartRate?: number;
    heartRateZones?: Array<{
      name: string;
      minutes?: number;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface FitbitHeartRateData {
  activities?: Array<{
    value?: {
      restingHeartRate?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

// Create API request with automatic token refresh
const apiRequest = async <T = Record<string, unknown>>(
  userId: string,
  endpoint: string,
  method: 'get' | 'post' = 'get',
  data: Record<string, unknown> | null = null
): Promise<T> => {
  try {
    const user = await User.findById(userId);
    if (!user?.fitbit?.accessToken) {
      throw new Error('User not found or missing Fitbit access token');
    }

    try {
      // Try with current token
      const response = await axios({
        method,
        url: `${FITBIT_API_URL}${endpoint}`,
        headers: {
          Authorization: `Bearer ${user.fitbit.accessToken}`,
        },
        ...(data !== null ? { data } : {}),
      });

      return response.data as T;
    } catch (error: unknown) {
      // If token expired (401), refresh and retry
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status === 401
      ) {
        const newToken = await refreshAccessToken(userId);
        if (!newToken) throw new Error('Failed to refresh token');

        const response = await axios({
          method,
          url: `${FITBIT_API_URL}${endpoint}`,
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
          ...(data && { data }),
        });

        return response.data as T;
      }

      throw error;
    }
  } catch (error) {
    console.error(`Error in Fitbit API request to ${endpoint}:`, error);
    throw error;
  }
};

// Sync sleep data from Fitbit
export const syncSleepData = async (
  userId: string,
  startDate: string,
  endDate: string = new Date().toISOString().split('T')[0]
): Promise<void> => {
  try {
    // Get sleep data from Fitbit API
    const sleepData = await apiRequest<FitbitSleepData>(
      userId,
      `/1.2/user/-/sleep/date/${startDate}/${endDate}.json`
    );

    // Process and save each sleep entry
    for (const day of sleepData.sleep) {
      // Skip non-main sleep entries (like naps)
      if (!day.isMainSleep) continue;

      // Convert dateOfSleep to YYYY-MM-DD format if it's not already
      const date = new Date(day.dateOfSleep).toISOString().split('T')[0];

      // Parse sleep stages
      let deepSleepPercentage = 0;
      let remSleepPercentage = 0;
      let lightSleepPercentage = 0;
      let awakeTime = 0;

      if (day.levels && day.levels.summary) {
        const summary = day.levels.summary;
        // Remove unused variable
        // const totalMinutes = day.minutesAsleep + day.minutesAwake;

        // Calculate percentages
        deepSleepPercentage = summary.deep ? (summary.deep.minutes / day.minutesAsleep) * 100 : 0;
        remSleepPercentage = summary.rem ? (summary.rem.minutes / day.minutesAsleep) * 100 : 0;
        lightSleepPercentage = summary.light
          ? (summary.light.minutes / day.minutesAsleep) * 100
          : 0;
        awakeTime = day.minutesAwake || 0;

        // Adjust percentages to ensure they add up to 100%
        const totalPercentage = deepSleepPercentage + remSleepPercentage + lightSleepPercentage;
        if (totalPercentage > 0 && Math.abs(totalPercentage - 100) > 0.1) {
          const adjustmentFactor = 100 / totalPercentage;
          deepSleepPercentage *= adjustmentFactor;
          remSleepPercentage *= adjustmentFactor;
          lightSleepPercentage *= adjustmentFactor;
        }
      }

      // Calculate sleep quality based on deep sleep and REM percentages
      // This is a simplified formula - you may want to adjust this logic
      const quality = Math.min(
        10,
        Math.round((deepSleepPercentage * 0.6 + remSleepPercentage * 0.4) / 10)
      );

      // Create or update sleep entry
      await SleepEntry.findOneAndUpdate(
        { user: userId, date },
        {
          user: userId,
          date,
          startTime: new Date(day.startTime).toISOString(),
          endTime: new Date(day.endTime).toISOString(),
          duration: day.minutesAsleep,
          quality,
          deepSleepPercentage,
          remSleepPercentage,
          lightSleepPercentage,
          awakeTime,
          source: 'fitbit',
          rawData: day,
        },
        { upsert: true, new: true }
      );
    }

    // Update last sync time
    await User.findByIdAndUpdate(userId, {
      'fitbit.lastSync': new Date(),
    });
  } catch (error) {
    console.error('Error syncing sleep data from Fitbit:', error);
    throw error;
  }
};

// Sync activity data from Fitbit
export const syncActivityData = async (
  userId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<void> => {
  try {
    // Get activity data from Fitbit API
    const activityData = await apiRequest<FitbitActivityData>(
      userId,
      `/1/user/-/activities/date/${date}.json`
    );

    // Get heartrate data
    const heartrateData = await apiRequest<FitbitHeartRateData>(
      userId,
      `/1/user/-/activities/heart/date/${date}/1d.json`
    );

    // Create or update daily summary
    await DailyFitnessSummary.findOneAndUpdate(
      { user: userId, date },
      {
        user: userId,
        date,
        totalCaloriesBurned: activityData.summary.caloriesOut || 0,
        totalActiveMinutes:
          (activityData.summary.fairlyActiveMinutes || 0) +
          (activityData.summary.veryActiveMinutes || 0),
        totalSteps: activityData.summary.steps || 0,
        restingHeartRate: heartrateData?.activities?.[0]?.value?.restingHeartRate || null,
        source: 'fitbit',
        rawData: {
          summary: activityData.summary,
          heartrate: heartrateData,
        },
      },
      { upsert: true, new: true }
    );

    // Process and save each activity
    if (activityData.activities && activityData.activities.length > 0) {
      for (const activity of activityData.activities) {
        const type = mapFitbitActivityType(activity.activityName);

        await FitnessActivity.findOneAndUpdate(
          {
            user: userId,
            date,
            // Use Fitbit activity log ID to identify unique activities
            'rawData.logId': activity.logId,
          },
          {
            user: userId,
            date,
            type,
            duration: activity.duration / 60000, // Convert milliseconds to minutes
            caloriesBurned: activity.calories || 0,
            distance: activity.distance || null,
            heartRate: activity.heartRateZones
              ? {
                  average: activity.averageHeartRate || null,
                  max: activity.maxHeartRate || null,
                  zones: {
                    outOfRange:
                      activity.heartRateZones.find((z) => z.name === 'Out of Range')?.minutes || 0,
                    fatBurn:
                      activity.heartRateZones.find((z) => z.name === 'Fat Burn')?.minutes || 0,
                    cardio: activity.heartRateZones.find((z) => z.name === 'Cardio')?.minutes || 0,
                    peak: activity.heartRateZones.find((z) => z.name === 'Peak')?.minutes || 0,
                  },
                }
              : null,
            steps: activity.steps || null,
            source: 'fitbit',
            rawData: activity,
          },
          { upsert: true, new: true }
        );
      }
    }

    // Update last sync time
    await User.findByIdAndUpdate(userId, {
      'fitbit.lastSync': new Date(),
    });
  } catch (error) {
    console.error('Error syncing activity data from Fitbit:', error);
    throw error;
  }
};

// Helper to map Fitbit activity types to our schema types
const mapFitbitActivityType = (
  fitbitType: string
): 'running' | 'walking' | 'cycling' | 'swimming' | 'weightlifting' | 'yoga' | 'other' => {
  const lowerType = fitbitType.toLowerCase();

  if (lowerType.includes('run') || lowerType.includes('jog')) {
    return 'running';
  } else if (lowerType.includes('walk')) {
    return 'walking';
  } else if (lowerType.includes('cycl') || lowerType.includes('bike')) {
    return 'cycling';
  } else if (lowerType.includes('swim')) {
    return 'swimming';
  } else if (lowerType.includes('weight') || lowerType.includes('strength')) {
    return 'weightlifting';
  } else if (lowerType.includes('yoga')) {
    return 'yoga';
  } else {
    return 'other';
  }
};

// Check Fitbit connection status
export const checkFitbitConnection = async (
  userId: string
): Promise<{ connected: boolean; lastSync: Date | null }> => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.fitbit || !user.fitbit.accessToken) {
      return { connected: false, lastSync: null };
    }

    return {
      connected: true,
      lastSync: user.fitbit.lastSync || null,
    };
  } catch (error: unknown) {
    console.error('Error checking Fitbit connection:', error);
    return { connected: false, lastSync: null };
  }
};

// Disconnect Fitbit
export const disconnectFitbit = async (userId: string): Promise<boolean> => {
  try {
    const user = await User.findById(userId);

    if (!user) return false;

    // Remove Fitbit connection data
    user.fitbit = undefined;
    await user.save();

    return true;
  } catch (error: unknown) {
    console.error('Error disconnecting Fitbit:', error);
    return false;
  }
};
