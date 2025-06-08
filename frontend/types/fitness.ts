// Core types for fitness data tracking

// Fitness activity record
export interface FitnessActivity {
  id: string;
  date: string; // ISO format date string
  type: 'running' | 'walking' | 'cycling' | 'swimming' | 'weightlifting' | 'yoga' | 'other';
  duration: number; // Duration in minutes
  caloriesBurned: number;
  distance?: number; // Distance in kilometers (for applicable activities)
  heartRate?: {
    average: number;
    max: number;
  };
  steps?: number; // For walking/running
  notes?: string;
}

// Daily stats summary
export interface DailyFitnessSummary {
  date: string;
  totalCaloriesBurned: number;
  totalActiveMinutes: number;
  totalSteps?: number;
  restingHeartRate?: number;
  activities: FitnessActivity[];
}

// Fitness goals
export interface FitnessGoal {
  id: string;
  type: 'caloriesBurned' | 'activeMinutes' | 'workoutFrequency' | 'steps' | 'distance';
  target: number;
  current: number;
  unit: string; // e.g., "cal", "min", "steps", "km"
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  isActive: boolean;
}

// Fitness trends
export interface FitnessTrend {
  period: 'week' | 'month' | 'year';
  data: {
    label: string; // Date or period label
    caloriesBurned: number;
    activeMinutes: number;
    activities: number; // Number of activities
  }[];
}
