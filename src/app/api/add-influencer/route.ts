import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

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

export async function POST(request: Request) {
  let client: MongoClient;
  try {
    const body = await request.json();
    const {
      handle,
      impactFactor,
      heartbeat,
      createdAt,
      twitterId,
      sessionUserhandle,
    } = body;

    const cleanHandle = handle.replace("@", "");

    // Validate the input
    if (!handle) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Handle is required" },
        },
        { status: 400 }
      );
    }

    client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const usersCollection = db.collection("users");
    const influencersCollection = db.collection("influencers");

    // If twitterId is provided, process subscription
    if (twitterId) {
      // 1️⃣  Check once if influencer already exists
      const existingInfluencer = await influencersCollection.findOne({
        twitterHandle: cleanHandle,
      });

      // Define apiData at a higher scope to use throughout the function
      let apiData: any = null;
      
      // Fetch data from TweetScout API only if the influencer doesn't exist
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
              "Register yourself first!"
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
            // Extract directly from apiData for new influencer
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
            const userProfileUrl = rawAvatarUrl.replace(/_normal(?=\.(jpg|jpeg|png|gif|webp))/i, "");    

            // Prepare publicMetrics
            const publicMetrics = {
              followers_count,
              following_count,
              tweet_count,
            };

            // Calculate mindshare directly using apiData values
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

            // Insert into influencersCollection with the apiData included
            await influencersCollection.insertOne(
              {
                name: name,
                twitterHandle: cleanHandle,
                impactFactor,
                heartbeat,
                subscribers: [cleanTelegramId],
                tweets: [],
                processedTweetIds: [],
                tweetScoutScore: 0,
                updatedAt: new Date(),
                isProcessing: false,
                lastProcessed: new Date(),
                userData,
                tweetScoutData: apiData, // Store the raw API data directly here
                createdAt: new Date(createdAt),
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