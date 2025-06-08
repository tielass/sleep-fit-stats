import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user.model';

// Heart rate data interface
export interface IHeartRate {
  average: number;
  max: number;
  min?: number;
  zones?: {
    outOfRange?: number; // Minutes in this zone
    fatBurn?: number; // Minutes in this zone
    cardio?: number; // Minutes in this zone
    peak?: number; // Minutes in this zone
  };
}

// Fitness activity interface
export interface IFitnessActivity extends Document {
  user: IUser['_id']; // Reference to the user
  date: string; // ISO format date string
  type: 'running' | 'walking' | 'cycling' | 'swimming' | 'weightlifting' | 'yoga' | 'other';
  duration: number; // Duration in minutes
  caloriesBurned: number;
  distance?: number; // Distance in kilometers
  heartRate?: IHeartRate;
  steps?: number; // For walking/running  notes?: string;
  source: 'manual' | 'fitbit' | 'other'; // Data source
  rawData?: Record<string, unknown>; // Raw data from source (fitbit, etc.)
  createdAt: Date;
  updatedAt: Date;
}

// Daily fitness summary interface
export interface IDailyFitnessSummary extends Document {
  user: IUser['_id']; // Reference to the user
  date: string; // ISO format date string
  totalCaloriesBurned: number;
  totalActiveMinutes: number;
  totalSteps?: number;
  restingHeartRate?: number;
  source: 'manual' | 'fitbit' | 'other'; // Data source
  rawData?: Record<string, unknown>; // Raw data from source (fitbit, etc.)
  createdAt: Date;
  updatedAt: Date;
}

// Fitness activity schema
const FitnessActivitySchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['running', 'walking', 'cycling', 'swimming', 'weightlifting', 'yoga', 'other'],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    caloriesBurned: {
      type: Number,
      required: true,
      min: 0,
    },
    distance: {
      type: Number,
      min: 0,
    },
    heartRate: {
      average: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
      },
      min: {
        type: Number,
        min: 0,
      },
      zones: {
        outOfRange: {
          type: Number,
          min: 0,
        },
        fatBurn: {
          type: Number,
          min: 0,
        },
        cardio: {
          type: Number,
          min: 0,
        },
        peak: {
          type: Number,
          min: 0,
        },
      },
    },
    steps: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
    },
    source: {
      type: String,
      enum: ['manual', 'fitbit', 'other'],
      default: 'manual',
    },
    rawData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Daily fitness summary schema
const DailyFitnessSummarySchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    totalCaloriesBurned: {
      type: Number,
      required: true,
      min: 0,
    },
    totalActiveMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSteps: {
      type: Number,
      min: 0,
    },
    restingHeartRate: {
      type: Number,
      min: 0,
    },
    source: {
      type: String,
      enum: ['manual', 'fitbit', 'other'],
      default: 'manual',
    },
    rawData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes
FitnessActivitySchema.index({ user: 1, date: 1, type: 1 });
DailyFitnessSummarySchema.index({ user: 1, date: 1 }, { unique: true });

export const FitnessActivity = mongoose.model<IFitnessActivity>(
  'FitnessActivity',
  FitnessActivitySchema
);
export const DailyFitnessSummary = mongoose.model<IDailyFitnessSummary>(
  'DailyFitnessSummary',
  DailyFitnessSummarySchema
);
