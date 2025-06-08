import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// User preferences interface
export interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  measurementSystem: 'metric' | 'imperial';
  timeFormat: '12h' | '24h';
  notifications: {
    sleepReminders: boolean;
    weeklyReports: boolean;
    goalUpdates: boolean;
  };
}

// Fitbit connection details
export interface IFitbitConnection {
  id: string;
  accessToken: string;
  refreshToken: string;
  lastSync: Date;
}

// User interface for MongoDB document
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  preferences: IUserPreferences;
  fitbit?: IFitbitConnection;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Schema
const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    weekStartsOn: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6],
      default: 1, // Monday
    },
    measurementSystem: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric',
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '24h',
    },
    notifications: {
      sleepReminders: {
        type: Boolean,
        default: true,
      },
      weeklyReports: {
        type: Boolean,
        default: true,
      },
      goalUpdates: {
        type: Boolean,
        default: true,
      },
    },
  },
  fitbit: {
    id: String,
    accessToken: String,
    refreshToken: String,
    lastSync: Date,
  },
});

// Password comparison method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // Using Document type since mongoose methods don't type 'this' correctly
  const self = this as unknown as { password: string };
  return await bcrypt.compare(candidatePassword, self.password);
};

export default mongoose.model<IUser>('User', UserSchema);
