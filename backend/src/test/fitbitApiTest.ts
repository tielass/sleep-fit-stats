import dotenv from 'dotenv';
import axios from 'axios';
import qs from 'qs';

// Load environment variables
dotenv.config();

/**
 * Test script for Fitbit API integration
 *
 * This script allows developers to manually test the Fitbit API by requesting
 * an access token and making simple API requests. It's not meant for production
 * use but for development/debugging purposes.
 */

// Configuration from environment variables
const clientId = process.env.FITBIT_CLIENT_ID;
const clientSecret = process.env.FITBIT_CLIENT_SECRET;

// Check if credentials are provided
if (!clientId || !clientSecret) {
  console.error(
    'Missing Fitbit credentials! Add FITBIT_CLIENT_ID and FITBIT_CLIENT_SECRET to your .env file.'
  );
  process.exit(1);
}

// Sample refresh token for testing (you'll need to obtain this first via OAuth2 flow)
const refreshToken = process.argv[2];

if (!refreshToken) {
  console.error('Usage: ts-node src/test/fitbitApiTest.ts <REFRESH_TOKEN>');
  console.error('You need to provide a valid Fitbit refresh token.');
  console.error('To get a refresh token:');
  console.error('1. Start the application');
  console.error('2. Log in and connect with Fitbit');
  console.error(
    '3. Check your database for the user document and extract the fitbit.refreshToken value'
  );
  process.exit(1);
}

// Define types for the API responses
interface FitbitTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface FitbitUserProfile {
  user: {
    fullName: string;
    memberSince: string;
    [key: string]: unknown;
  };
}

interface FitbitSleepData {
  sleep: Array<{
    dateOfSleep: string;
    duration: number;
    efficiency: number;
    minutesAsleep: number;
    levels?: {
      summary?: {
        deep?: { minutes: number };
        light?: { minutes: number };
        rem?: { minutes: number };
        wake?: { minutes: number };
      };
    };
    [key: string]: unknown;
  }>;
}

// Define a type for axios errors
interface AxiosError {
  response?: {
    data?: unknown;
    status?: number;
    headers?: Record<string, string>;
  };
  message: string;
}

// Request new tokens using refresh token
const getAccessToken = async (): Promise<FitbitTokenResponse> => {
  try {
    const response = await axios<FitbitTokenResponse>({
      method: 'post',
      url: 'https://api.fitbit.com/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      data: qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error('Error getting access token:', axiosError.response?.data || axiosError.message);
    throw error;
  }
};

// Fetch user profile
const getUserProfile = async (accessToken: string): Promise<FitbitUserProfile> => {
  try {
    const response = await axios<FitbitUserProfile>({
      method: 'get',
      url: 'https://api.fitbit.com/1/user/-/profile.json',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error('Error fetching user profile:', axiosError.response?.data || axiosError.message);
    throw error;
  }
};

// Fetch recent sleep data
const getRecentSleep = async (accessToken: string): Promise<FitbitSleepData> => {
  try {
    const response = await axios<FitbitSleepData>({
      method: 'get',
      url: 'https://api.fitbit.com/1.2/user/-/sleep/date/today.json',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error('Error fetching sleep data:', axiosError.response?.data || axiosError.message);
    throw error;
  }
};

// Main function
const runTests = async () => {
  try {
    // Get access token
    console.log('Requesting access token...');
    const tokenData = await getAccessToken();
    console.log('Token received successfully!');
    console.log('Access Token:', tokenData.access_token);
    console.log('New Refresh Token:', tokenData.refresh_token);
    console.log('\n');

    // Get user profile
    console.log('Fetching user profile...');
    const profile = await getUserProfile(tokenData.access_token);
    console.log('Profile received:');
    console.log(`Name: ${profile.user.fullName}`);
    console.log(`Member Since: ${profile.user.memberSince}`);
    console.log('\n');

    // Get recent sleep data
    console.log('Fetching recent sleep data...');
    const sleepData = await getRecentSleep(tokenData.access_token);
    console.log('Sleep data received:');
    console.log(`Total sleep records: ${sleepData.sleep.length}`);

    // Show details of the most recent sleep entry if available
    if (sleepData.sleep.length > 0) {
      const recentSleep = sleepData.sleep[0];
      console.log('\nMost recent sleep record:');
      console.log(`Date: ${recentSleep.dateOfSleep}`);
      console.log(`Duration: ${Math.round(recentSleep.duration / 60000)} minutes`);
      console.log(`Efficiency: ${recentSleep.efficiency}%`);

      if (recentSleep.levels && recentSleep.levels.summary) {
        console.log('\nSleep stages:');
        const summary = recentSleep.levels.summary;

        if (summary.deep) {
          console.log(
            `Deep sleep: ${summary.deep.minutes} minutes (${Math.round((summary.deep.minutes / recentSleep.minutesAsleep) * 100)}%)`
          );
        }

        if (summary.light) {
          console.log(
            `Light sleep: ${summary.light.minutes} minutes (${Math.round((summary.light.minutes / recentSleep.minutesAsleep) * 100)}%)`
          );
        }

        if (summary.rem) {
          console.log(
            `REM sleep: ${summary.rem.minutes} minutes (${Math.round((summary.rem.minutes / recentSleep.minutesAsleep) * 100)}%)`
          );
        }

        if (summary.wake) {
          console.log(`Awake: ${summary.wake.minutes} minutes`);
        }
      }
    } else {
      console.log('No recent sleep data available.');
    }

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

// Run the tests
runTests();
