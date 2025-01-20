import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const client = new MongoClient(process.env.MONGODB_URI);

// Create a cached connection variable
let cachedClient: MongoClient | null = null;

async function dbConnect(): Promise<MongoClient> {
  // If we have a cached connection, return it
  if (cachedClient) {
    return cachedClient;
  }

  // Create a new connection
  try {
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect;