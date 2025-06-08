// Main entry point for the application
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { connectToDatabase } from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import sleepRoutes from './routes/sleep.routes';
import fitnessRoutes from './routes/fitness.routes';
import userRoutes from './routes/user.routes';
import fitbitRoutes from './routes/fitbit.routes';

// Import configuration
import { configurePassport } from './config/passport';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectToDatabase().catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Configure middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://your-production-domain.com'
        : 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Import JWT error handler
import { handleJwtErrors } from './middleware/error.middleware';

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fitbit', fitbitRoutes);

// JWT error handling
app.use(handleJwtErrors);

// Default route
app.get('/', (_req, res) => {
  res.send('Sleep-Fit-Stats API is running');
});

// Error handling middleware
app.use(
  (
    err: Error & { statusCode?: number },
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
);

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Sleep-Fit-Stats API running on http://localhost:${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

export default app;
