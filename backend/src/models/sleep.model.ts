import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user.model';

// Sleep entry interface
export interface ISleepEntry extends Document {
  user: IUser['_id']; // Reference to the user
  date: string; // ISO format date string
  startTime: string; // ISO format datetime string
  endTime: string; // ISO format datetime string
  duration: number; // Duration in minutes
  quality: number; // Sleep quality rating 1-10
  deepSleepPercentage: number; // Percentage of deep sleep
  remSleepPercentage: number; // Percentage of REM sleep
  lightSleepPercentage: number; // Percentage of light sleep
  awakeTime: number; // Time awake during sleep session in minutes
  notes?: string; // Optional notes about the sleep  source: 'manual' | 'fitbit' | 'other'; // Data source
  rawData?: Record<string, unknown>; // Raw data from source (fitbit, etc.)
  createdAt: Date;
  updatedAt: Date;
}

// Sleep entry schema
const SleepEntrySchema: Schema = new Schema(
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
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    quality: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    deepSleepPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    remSleepPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    lightSleepPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    awakeTime: {
      type: Number,
      required: true,
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

// Create a compound index on user and date
SleepEntrySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model<ISleepEntry>('SleepEntry', SleepEntrySchema);
