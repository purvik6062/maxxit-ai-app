import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

const SUBSCRIPTION_COST = 30;
const TWEETSCOUT_API_KEY = process.env.TWEETSCOUT_API_KEY;

if (!TWEETSCOUT_API_KEY) {
  throw new Error("TWEETSCOUT_API_KEY is not set in environment variables");
}

// Function to calculate mindshare based on weighted metrics
function calculateMindshare(
  followers_count: number,
  following_count: number,
  tweet_count: number,
  verified: boolean
): number {
  // Normalize metrics (assuming reasonable max values)
  const normFollowers = Math.min(followers_count / 1000000, 1); // Max 1M followers
  const normFollowing = Math.min(following_count / 10000, 1); // Max 10K following
  const normTweets = Math.min(tweet_count / 100000, 1); // Max 100K tweets
  const verifiedWeight = verified ? 1.5 : 1; // 50% bonus if verified

  // Weighted sum (adjust weights as needed)
  const weights = { followers: 0.5, following: 0.2, tweets: 0.3 };
  const mindshare =
    (weights.followers * normFollowers +
      weights.following * normFollowing +
      weights.tweets * normTweets) *
    verifiedWeight;

  return Math.min(1, parseFloat(mindshare.toFixed(2))); // Cap at 1, round to 2 decimals
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      handle,
      impactFactor,
      heartbeat,
      createdAt,
      twitterId,
      sessionUserhandle,
    } = body;

    const cleanHandle = handle.replace("@", "");

    // Validate the input
    if (!name || !handle) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Name and handle are required" },
        },
        { status: 400 }
      );
    }

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const usersCollection = db.collection("users");
    const influencersAccountCollection = db.collection("influencers_account");
    const influencersCollection = db.collection("influencers");

    if (
      !(await db.listCollections({ name: "influencer_tweetscout_data" }).hasNext())
    ) {
      await db.createCollection("influencer_tweetscout_data");
    }
    const influencerRawDataCollection = db.collection("influencer_tweetscout_data");

    // Create new influencer in influencers_account collection
    const newInfluencer = {
      name,
      handle,
      impactFactor,
      heartbeat,
      createdAt: new Date(createdAt),
    };

    await influencersAccountCollection.insertOne(newInfluencer);

    // If twitterId is provided, process subscription
    if (twitterId) {
      // 1️⃣  Check once if influencer already exists
      const existingInfluencer = await influencersCollection.findOne({
        twitterHandle: cleanHandle,
      });
      
      // Fetch data from TweetScout API outside the transaction
      let apiData: any;
      if (!existingInfluencer) {
        try {
          const url = `https://api.tweetscout.io/v2/info/${cleanHandle}`;
          const options = {
            method: "GET",
            headers: {
              Accept: "application/json",
              ApiKey: TWEETSCOUT_API_KEY,
            },
          };

          const response = await fetch(url, options);
          if (!response.ok) {
            throw new Error(
              `API request failed with status ${response.status}`
            );
          }
          apiData = await response.json();
          console.log("got data from tweetscout");
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error: {
                message: `Failed to fetch influencer data: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              },
            },
            { status: 500 }
          );
        }
      }

      // Start a session for transaction
      const session = client.startSession();

      try {
        await session.withTransaction(async () => {
          // 1. Check and update user's credits
          const user = await usersCollection.findOne({ twitterId });

          if (!user) {
            throw new Error(
              "Register yourself first to receive 100 free credits!"
            );
          }

          if (user.credits < SUBSCRIPTION_COST) {
            throw new Error("Insufficient credits");
          }

          // Get user's telegram ID and clean it
          const cleanTelegramId = user?.telegramId.replace("@", "");

          // Check if user is already subscribed (case-insensitive)
          if (
            user.subscribedAccounts?.some(
              (account: { twitterHandle: string }) =>
                new RegExp(`^${cleanHandle}$`, "i").test(account.twitterHandle)
            )
          ) {
            throw new Error("Already subscribed to this influencer");
          }

          if (existingInfluencer) {
            // Update existing influencer
            await influencersCollection.updateOne(
              { twitterHandle: cleanHandle },
              {
                $set: { updatedAt: new Date() },
                $addToSet: { subscribers: cleanTelegramId },
              },
              { session }
            );
          } else {
            // Store raw data in influencer_tweetscout_data collection
            await influencerRawDataCollection.insertOne(
              {
                twitterHandle: cleanHandle,
                rawData: apiData,
                fetchedAt: new Date(),
              },
              { session }
            );

            console.log("data stored in raw DB");

            // Fetch the stored data from the database
            const storedData = await influencerRawDataCollection.findOne(
              { twitterHandle: cleanHandle },
              { session } // Include session here
            );

            if (!storedData) {
              throw new Error("Failed to retrieve stored influencer data");
            }

            const {
              id: userId,
              screen_name: username,
              verified,
              followers_count,
              friends_count: following_count,
              tweets_count: tweet_count,
              avatar: userProfileUrl,
            } = storedData.rawData;

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
            await influencersCollection.insertOne(
              {
                twitterHandle: cleanHandle,
                subscribers: [cleanTelegramId],
                tweets: [],
                processedTweetIds: [],
                updatedAt: new Date(),
                isProcessing: false,
                lastProcessed: new Date(),
                userData,
              },
              { session }
            );
          }

          // 3. Update user document
          const subscriptionDate = new Date();
          const expiryDate = new Date(subscriptionDate);
          expiryDate.setMonth(expiryDate.getMonth() + 1);

          await usersCollection.updateOne(
            { twitterId },
            {
              $inc: { credits: -SUBSCRIPTION_COST },
              $addToSet: {
                subscribedAccounts: {
                  twitterHandle: cleanHandle,
                  subscriptionDate,
                  expiryDate,
                },
              },
              $set: { updatedAt: new Date() },
            },
            { session }
          );
        });

        return NextResponse.json({
          success: true,
          message: "Successfully added influencer and processed subscription",
        });
      } finally {
        await session.endSession();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Successfully added influencer",
      data: newInfluencer,
    });
  } catch (error) {
    console.error("❌ /api/add-influencer failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
