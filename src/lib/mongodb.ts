import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "trading_minds";

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return db;
}
