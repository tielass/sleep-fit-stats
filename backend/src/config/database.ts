import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sleep-fit-stats';

// Store connection state to avoid multiple connections
interface MongoConnection {
  isConnected: number;
}

const connection: MongoConnection = {
  isConnected: 0,
};

/**
 * Connect to MongoDB
 */
export const connectToDatabase = async (): Promise<void> => {
  if (connection.isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    connection.isConnected = db.connections[0].readyState;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  if (!connection.isConnected) {
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    // In production, we keep the connection alive
    return;
  }

  try {
    await mongoose.disconnect();
    connection.isConnected = 0;
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

// Add event listeners for mongoose connection
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Handle application termination gracefully
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

// Export mongoose for use elsewhere
export { mongoose };
