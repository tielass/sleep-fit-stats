import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import SleepEntry from '../models/sleep.model';
import { FitnessActivity, DailyFitnessSummary } from '../models/fitness.model';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sleep-fit-stats')
  .then(() => console.log('Connected to MongoDB for seeding data'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create test user
const createTestUser = async (): Promise<mongoose.Document> => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });

    if (existingUser) {
      console.log('Test user already exists, skipping creation.');
      return existingUser;
    }

    // Create new test user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = new User({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      preferences: {
        theme: 'system',
        weekStartsOn: 1, // Monday
        measurementSystem: 'metric',
        timeFormat: '24h',
        notifications: {
          sleepReminders: true,
          weeklyReports: true,
          goalUpdates: true,
        },
      },
    });

    await user.save();
    console.log('Test user created successfully.');
    return user;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
};

// Create sample sleep data
const createSampleSleepData = async (userId: string) => {
  try {
    // Check if sleep data already exists
    const existingEntries = await SleepEntry.findOne({ user: userId });

    if (existingEntries) {
      console.log('Sample sleep data already exists, skipping creation.');
      return;
    }

    // Generate dates for the last 30 days
    const entries = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      // Random values for sleep data
      const deepSleep = Math.floor(Math.random() * 25) + 15; // 15-40%
      const remSleep = Math.floor(Math.random() * 25) + 15; // 15-40%
      const lightSleep = 100 - deepSleep - remSleep; // Remaining %

      const startTime = new Date(date);
      startTime.setHours(22, 0, 0); // 10:00 PM

      const duration = Math.floor(Math.random() * 120) + 360; // 6-8 hours (in minutes)

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      entries.push({
        user: userId,
        date: dateString,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        quality: Math.floor(Math.random() * 4) + 6, // 6-10
        deepSleepPercentage: deepSleep,
        remSleepPercentage: remSleep,
        lightSleepPercentage: lightSleep,
        awakeTime: Math.floor(Math.random() * 30), // 0-30 minutes
        source: 'manual',
      });
    }

    await SleepEntry.insertMany(entries);
    console.log('Sample sleep data created successfully.');
  } catch (error) {
    console.error('Error creating sample sleep data:', error);
    throw error;
  }
};

// Define activity type
type ActivityType =
  | 'running'
  | 'walking'
  | 'cycling'
  | 'swimming'
  | 'weightlifting'
  | 'yoga'
  | 'other';

// Create sample fitness data
const createSampleFitnessData = async (userId: string) => {
  try {
    // Check if fitness data already exists
    const existingActivities = await FitnessActivity.findOne({ user: userId });

    if (existingActivities) {
      console.log('Sample fitness data already exists, skipping creation.');
      return;
    }

    const activities = [];
    const summaries = [];
    const today = new Date();
    const activityTypes: ActivityType[] = [
      'running',
      'walking',
      'cycling',
      'swimming',
      'weightlifting',
      'yoga',
    ];

    // Generate data for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      // Create 1-3 activities per day
      const dailyActivities = [];
      const activitiesCount = Math.floor(Math.random() * 3) + 1;

      let totalCalories = 0;
      let totalActiveMinutes = 0;
      let totalSteps = 0;
      for (let j = 0; j < activitiesCount; j++) {
        // Safe way to access array and ensure proper typing
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const duration = Math.floor(Math.random() * 60) + 30; // 30-90 minutes
        const caloriesBurned = Math.floor(Math.random() * 300) + 100; // 100-400 calories

        const activity = {
          user: userId,
          date: dateString,
          type: activityType,
          duration,
          caloriesBurned,
          distance:
            activityType === 'running' || activityType === 'walking' || activityType === 'cycling'
              ? parseFloat((Math.random() * 10 + 1).toFixed(2))
              : undefined,
          heartRate: {
            average: Math.floor(Math.random() * 40) + 120,
            max: Math.floor(Math.random() * 20) + 160,
          },
          steps:
            activityType === 'running' || activityType === 'walking'
              ? Math.floor(Math.random() * 5000) + 3000
              : undefined,
          source: 'manual',
        };

        dailyActivities.push(activity);
        totalCalories += caloriesBurned;
        totalActiveMinutes += duration;

        if (activity.steps) {
          totalSteps += activity.steps;
        }
      }

      // Create daily summary
      summaries.push({
        user: userId,
        date: dateString,
        totalCaloriesBurned: totalCalories,
        totalActiveMinutes,
        totalSteps,
        restingHeartRate: Math.floor(Math.random() * 15) + 60, // 60-75 bpm
        source: 'manual',
      });

      activities.push(...dailyActivities);
    }

    await FitnessActivity.insertMany(activities);
    await DailyFitnessSummary.insertMany(summaries);
    console.log('Sample fitness data created successfully.');
  } catch (error) {
    console.error('Error creating sample fitness data:', error);
    throw error;
  }
};

// Run seed function
const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Create test user
    const user = await createTestUser();

    // Extract user ID safely
    if (!user || !user._id) {
      throw new Error('Failed to create test user or user has no ID');
    }

    // Convert MongoDB ObjectId to string
    const userId = user._id.toString();

    // Create sample data
    await Promise.all([createSampleSleepData(userId), createSampleFitnessData(userId)]);

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Execute seed function
seedDatabase();
