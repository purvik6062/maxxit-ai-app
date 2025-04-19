const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// TweetScout API details
const API_KEY = process.env.TWEETSCOUT_API_KEY;
const BASE_URL = 'https://api.tweetscout.io/v2/score/';

// MongoDB connection details
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'ctxbt-signal-flow';

// Function to connect to MongoDB
async function connectToDB() {
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  console.log('Connected to MongoDB');
  return client;
}

// Function to fetch heartbeat score for a given Twitter handle
async function fetchHeartbeatScore(handle) {
  const url = `${BASE_URL}${handle}`;
  const options = {
    method: 'GET',
    headers: { Accept: 'application/json', ApiKey: API_KEY }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Failed to fetch score for ${handle}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.score;
  } catch (error) {
    console.error(`Error fetching score for ${handle}:`, error.message);
    return null;
  }
}

// Main function to fetch scores for all influencers and store in heartbeat collection
async function updateHeartbeatScores() {
  const client = await connectToDB();
  const db = client.db(DB_NAME);
  const influencersCollection = db.collection('influencers');
  const heartbeatCollection = db.collection('heartbeat');

  try {
    // Fetch all influencers from the influencers collection
    const influencers = await influencersCollection.find({}).toArray();
    console.log(`Found ${influencers.length} influencers to process.`);

    // Process each influencer
    for (const influencer of influencers) {
      const handle = influencer.twitterHandle;
      console.log(`Fetching score for ${handle}...`);
      
      const score = await fetchHeartbeatScore(handle);
      if (score !== null) {
        // Update or insert the score in the heartbeat collection
        await heartbeatCollection.updateOne(
          { twitterHandle: handle },
          { 
            $set: { 
              score: score,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
        console.log(`Updated score for ${handle}: ${score}`);
      } else {
        console.log(`Skipping ${handle} due to fetch error.`);
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Finished updating heartbeat scores.');
  } catch (error) {
    console.error('Error in updateHeartbeatScores:', error);
  } 
  // finally {
  //   await client.close();
  //   console.log('Database connection closed.');
  // }
}

// Run the script
updateHeartbeatScores().catch(console.error);