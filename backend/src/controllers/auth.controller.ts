import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import passport from 'passport';
import User from '../models/user.model';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper to generate JWT token
const generateToken = (userId: string): string => {
  // @ts-expect-error - JWT sign method has compatibility issues with string secrets
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'User already exists with this email' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default preferences
    const user = new User({
      email,
      password: hashedPassword,
      name,
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

    // Generate JWT
    const token = generateToken(String(user._id));

    // Return user info (excluding password) and token
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      preferences: user.preferences,
    };

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = generateToken(String(user._id));

    // Return user info (excluding password) and token
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      preferences: user.preferences,
    };

    res.status(200).json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Logout user
export const logout = (req: Request, res: Response): void => {
  req.logout(() => {
    res.status(200).json({ message: 'Successfully logged out' });
  });
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
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
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error fetching user data' });
  }
};

// Initiate Fitbit OAuth
export const connectFitbit = (req: Request, res: Response): void => {
  passport.authenticate('fitbit', {
    scope: [
      'activity',
      'heartrate',
      'location',
      'nutrition',
      'profile',
      'settings',
      'sleep',
      'social',
      'weight',
    ],
  })(req, res);
};

// Fitbit OAuth callback
export const fitbitCallback = (req: Request, res: Response): void => {
  passport.authenticate('fitbit', {
    successRedirect: '/api/auth/fitbit/success',
    failureRedirect: '/api/auth/fitbit/failure',
  })(req, res);
};

// Fitbit connection success
export const fitbitSuccess = async (req: Request, res: Response): Promise<void> => {
  try {
    // Generate JWT for the authenticated user
    // @ts-expect-error - req.user is added by our authentication middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication failed' });
      return;
    }

    const token = generateToken(userId);

    // Redirect to frontend with token
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${token}`
    );
  } catch (error) {
    console.error('Fitbit success error:', error);
    res.status(500).json({ message: 'Server error during Fitbit authentication' });
  }
};

// Fitbit connection failure
export const fitbitFailure = (req: Request, res: Response): void => {
  res.redirect(
    `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error?message=fitbit_connection_failed`
  );
};
