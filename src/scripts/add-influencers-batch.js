const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// List of influencers to be added
const influencersList = [
  'CryptoSignalMs',
  'fbmskills',
  'cryptotrading7',
  'crypto_guru_1',
  'CQS_Signals',
  'CryptoHeroTA',
  'Golden1Team',
  'cryptosignalbtc',
  'CryptoRK11',
  'BingXsignals_1',
  'TSFX_forex',
  'Binance_Killers',
  'FedInsiders',
  'direct_crypto',
  'opulencecryptos',
  'CSignalsVip',
  'merit2m',
  'MarketWizard94',
  'Crypt0_Savage',
  'GalaxyPals',
  'Sober_Trading',
  'wazirxp',
  'CryptoValex',
  'TradeMogulPro',
  'CRYPTO_BONAZ',
  'chr0lloluc1lfer',
  'CoinSignals_',
  'CryptoSage26_TA',
  'alphacryptosign',
  'ZACFutures',
  'BeePositiveBTC',
  'Cryptoo_Gemz',
  'Ashikur1589',
  'InversoSignals',
  'PumpDumpAlert',
  'cryptokupumps',
  'CryptoShillz06',
  'Goran_Crypto',
  'Whale_Pump_'
];

// TweetScout API details
const TWEETSCOUT_API_KEY = process.env.TWEETSCOUT_API_KEY;
const BASE_URL = 'https://api.tweetscout.io/v2/info/';

// MongoDB connection details
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'ctxbt-signal-flow';

if (!TWEETSCOUT_API_KEY) {
  throw new Error('TWEETSCOUT_API_KEY is not set in environment variables');
}

// Function to connect to MongoDB
async function connectToDB() {
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  console.log('Connected to MongoDB');
  return client;
}

// Function to calculate mindshare based on weighted metrics
function calculateMindshare(followers_count, following_count, tweet_count, verified) {
  const normFollowers = Math.min(followers_count / 2000000, 1);
  const normFollowing = Math.min(following_count / 10000, 1);
  const normTweets = Math.min(tweet_count / 200000, 1);
  const verifiedWeight = verified ? 1.35 : 1; // Slight bump to 35%

  const weights = { followers: 0.35, following: 0.25, tweets: 0.4 };

  const rawScore =
    weights.followers * normFollowers +
    weights.following * normFollowing +
    weights.tweets * normTweets;

  const mindshare = rawScore * verifiedWeight;

  return Math.min(1, parseFloat(mindshare.toFixed(2)));
}

// Function to fetch data from TweetScout API
async function fetchInfluencerData(handle) {
  const url = `${BASE_URL}${handle}`;
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ApiKey: TWEETSCOUT_API_KEY,
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const apiData = await response.json();
    console.log(`Got data from TweetScout for ${handle}`);
    return apiData;
  } catch (error) {
    console.error(`Failed to fetch data for ${handle}:`, error);
    return null;
  }
}

async function addInfluencersBatch() {
  const client = await connectToDB();
  try {
    const db = client.db(DB_NAME);
    const influencersCollection = db.collection('influencers');

    const results = [];
    for (const handle of influencersList) {
      const cleanHandle = handle.replace('@', '');
      const existingInfluencer = await influencersCollection.findOne({
        twitterHandle: cleanHandle
      });

      if (!existingInfluencer) {
        // Fetch data from TweetScout API
        const apiData = await fetchInfluencerData(cleanHandle);
        
        if (!apiData) {
          results.push(`Failed to fetch data for ${cleanHandle}`);
          continue; // Skip to the next influencer
        }

        // Extract data from apiData
        const {
          id: userId,
          name,
          screen_name: username,
          verified,
          followers_count,
          friends_count: following_count,
          tweets_count: tweet_count,
          avatar: rawAvatarUrl,
        } = apiData;

        // Clean avatar URL
        const userProfileUrl = rawAvatarUrl.replace(/_normal(?=\.(jpg|jpeg|png|gif|webp))/i, '');

        // Prepare publicMetrics
        const publicMetrics = {
          followers_count,
          following_count,
          tweet_count,
        };

        // Calculate mindshare
        const mindshare = calculateMindshare(
          followers_count,
          following_count,
          tweet_count,
          verified
        );

        // Create userData object
        const userData = {
          userId,
          username,
          verified,
          publicMetrics,
          userProfileUrl,
          mindshare,
          herdedVsHidden: 1,
          convictionVsHype: 1,
          memeVsInstitutional: 1,
        };

        // Insert into influencersCollection
        const influencerData = {
          name: name,
          twitterHandle: cleanHandle,
          impactFactor: 0,
          heartbeat: 0,
          subscribers: [],
          tweets: [],
          processedTweetIds: [],
          tweetScoutScore: 0,
          updatedAt: new Date(),
          isProcessing: false,
          lastProcessed: new Date(),
          userData,
          tweetScoutData: apiData,
          createdAt: new Date(),
        };

        await influencersCollection.insertOne(influencerData);
        results.push(`Added ${cleanHandle} to the collection with TweetScout data.`);
        console.log(`Added ${cleanHandle} to the collection with TweetScout data.`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        results.push(`${cleanHandle} already exists in the collection.`);
        console.log(`${cleanHandle} already exists in the collection.`);
      }
    }

    console.log('Batch processing complete:', results);
    return results;
  } catch (error) {
    console.error('Error adding influencers:', error);
    throw error;
  } finally {
    // Commented out to match fetchHeartbeatScores.js
    // await client.close();
    // console.log('Database connection closed.');
  }
}

// Run the script
addInfluencersBatch().catch(console.error); 