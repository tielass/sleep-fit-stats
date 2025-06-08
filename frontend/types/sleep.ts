// Core types for sleep data tracking

// Sleep record for a single night
export interface SleepEntry {
  id: string;
  date: string; // ISO format date string
  startTime: string; // ISO format datetime string
  endTime: string; // ISO format datetime string
  duration: number; // Duration in minutes
  quality: number; // Sleep quality rating 1-10
  deepSleepPercentage: number; // Percentage of deep sleep
  remSleepPercentage: number; // Percentage of REM sleep
  lightSleepPercentage: number; // Percentage of light sleep
  awakeTime: number; // Time awake during sleep session in minutes
  notes?: string; // Optional notes about the sleep
}

// Sleep statistics for a time period
export interface SleepStats {
  averageDuration: number; // Average sleep duration in minutes
  averageQuality: number; // Average sleep quality
  averageDeepSleep: number; // Average deep sleep percentage
  averageRemSleep: number; // Average REM sleep percentage
  averageLightSleep: number; // Average light sleep percentage
  startDate: string; // Period start date
  endDate: string; // Period end date
}

// Sleep goal
export interface SleepGoal {
  id: string;
  targetDuration: number; // Target sleep duration in minutes
  targetQuality: number; // Target sleep quality
  startDate: string; // When goal was set
  isActive: boolean; // Whether goal is currently active
}

// Sleep trends
export interface SleepTrend {
  period: 'week' | 'month' | 'year';
  data: {
    label: string; // Date or period label
    duration: number; // Average duration for the period
    quality: number; // Average quality for the period
  }[];
}
