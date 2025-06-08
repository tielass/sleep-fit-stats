import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as FitbitStrategy, VerifyError } from 'passport-fitbit-oauth2';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/user.model';

export const configurePassport = (): void => {
  // Serialize user
  passport.serializeUser((user: Express.User, done) => {
    // Type assertion to access the id property
    const userDocument = user as IUser;
    done(null, userDocument.id);
  });
  // Deserialize user
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      // Convert unknown error to Error type for compatibility with VerifyError
      const verifyError: VerifyError = error instanceof Error ? error : new Error(String(error));
      done(verifyError, null);
    }
  });

  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });

          if (!user) {
            return done(null, false, { message: 'User not found' });
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          return done(null, user);
        } catch (error) {
          // Convert unknown error to Error type for compatibility with VerifyError
          const verifyError: VerifyError =
            error instanceof Error ? error : new Error(String(error));
          return done(verifyError);
        }
      }
    )
  );

  // Fitbit OAuth2 Strategy
  passport.use(
    new FitbitStrategy(
      {
        clientID: process.env.FITBIT_CLIENT_ID || '',
        clientSecret: process.env.FITBIT_CLIENT_SECRET || '',
        callbackURL:
          process.env.FITBIT_CALLBACK_URL || 'http://localhost:3001/api/auth/fitbit/callback',
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
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists by Fitbit ID
          const user = await User.findOne({ 'fitbit.id': profile.id });

          if (user) {
            // Update tokens and lastSync
            user.fitbit = {
              id: profile.id,
              accessToken,
              refreshToken,
              lastSync: new Date(),
            };
            await user.save();
            return done(null, user);
          }

          // Create new user from Fitbit profile
          const newUser = new User({
            name: profile.displayName,
            email: (profile._json.user?.email || `${profile.id}@fitbit.user`).toLowerCase(),
            password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
            fitbit: {
              id: profile.id,
              accessToken,
              refreshToken,
              lastSync: new Date(),
            },
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

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          // Convert unknown error to Error type for compatibility with VerifyError
          const verifyError: VerifyError =
            error instanceof Error ? error : new Error(String(error));
          return done(verifyError);
        }
      }
    )
  );
};
