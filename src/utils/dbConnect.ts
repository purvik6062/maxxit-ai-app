// Adjust this based on your actual implementation
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

// Use connection caching for better performance in serverless environments
let cachedClient: MongoClient | null = null;
let connectionPromise: Promise<MongoClient> | null = null;

export default async function dbConnect(retries = 3): Promise<MongoClient> {
  // If we have a cached client, test the connection first
  if (cachedClient) {
    try {
      // Test the connection with a simple ping
      await cachedClient.db('admin').command({ ping: 1 });
      return cachedClient;
    } catch (error) {
      console.log('Cached client connection failed, creating new connection...');
      cachedClient = null;
      connectionPromise = null;
    }
  }

  // If there's already a connection in progress, wait for it
  if (connectionPromise) {
    try {
      return await connectionPromise;
    } catch (error) {
      connectionPromise = null;
    }
  }

  // Create a new connection with retry logic
  connectionPromise = (async () => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Set server timeout options
        const options = {
          connectTimeoutMS: 10000,   // Increased timeout
          socketTimeoutMS: 15000,    // Increased timeout
          serverSelectionTimeoutMS: 10000,  // Increased timeout
          maxPoolSize: 10,
          minPoolSize: 5,
          retryWrites: true
        };

        const client = new MongoClient(MONGODB_URI, options);
        await client.connect();

        // Test the connection
        await client.db('admin').command({ ping: 1 });

        cachedClient = client;
        console.log('MongoDB connected successfully');
        return client;
      } catch (error) {
        lastError = error as Error;
        console.error(`MongoDB connection attempt ${attempt} failed:`, error);

        if (attempt < retries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    throw new Error(`Failed to connect to MongoDB after ${retries} attempts. Last error: ${lastError?.message}`);
  })();

  try {
    return await connectionPromise;
  } finally {
    connectionPromise = null;
  }
}

// Helper function to safely execute database operations
export async function executeDbOperation<T>(
  operation: (db: any, client: MongoClient) => Promise<T>,
  dbName = "ctxbt-signal-flow"
): Promise<T> {
  let client: MongoClient | undefined;

  try {
    client = await dbConnect();
    const db = client.db(dbName);
    return await operation(db, client);
  } catch (error) {
    console.error('Database operation failed:', error);

    // Clear cached client on connection errors
    if (error instanceof Error && error.message.includes('MongoNotConnectedError')) {
      cachedClient = null;
      connectionPromise = null;
    }

    throw error;
  } finally {
    // Don't close the client as we're using connection caching
  }
}