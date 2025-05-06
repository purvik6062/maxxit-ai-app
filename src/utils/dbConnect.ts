// Adjust this based on your actual implementation
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

// Use connection caching for better performance in serverless environments
let cachedClient: MongoClient | null = null;

export default async function dbConnect(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    // Set server timeout options
    const options = {
      connectTimeoutMS: 5000,   // Reduce from default 30000ms
      socketTimeoutMS: 8000,    // Reduce from default 30000ms
      serverSelectionTimeoutMS: 5000,  // Default is 30000ms
      maxPoolSize: 10,
      minPoolSize: 5
    };

    const client = new MongoClient(MONGODB_URI, options);
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}