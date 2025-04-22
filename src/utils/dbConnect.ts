import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;

// Connection options to enable connection pooling
const options = {
  maxPoolSize: 20, // Limit maximum connections in the pool
  minPoolSize: 5,   // Keep a minimum number of connections ready
  maxIdleTimeMS: 60000 // Close connections after 1 minute of inactivity
};

// Global cached connection
let cachedClient: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

// Shared promise to avoid multiple concurrent connection attempts
async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  if (!clientPromise) {
    clientPromise = MongoClient.connect(uri, options)
      .then(client => {
        cachedClient = client;
        return client;
      })
      .catch(err => {
        clientPromise = null;
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }

  return clientPromise;
}

export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    clientPromise = null;
  }
}

async function dbConnect(): Promise<MongoClient> {
  return connectToDatabase();
}

export default dbConnect;