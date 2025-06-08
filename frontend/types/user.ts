// User profile and authentication types

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
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

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}
