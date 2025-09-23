// app/api/check-influencer/route.js
import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  let client: MongoClient;
  try {
    const handlerStartMs = Date.now();
    const { username } = await request.json();
    console.log("api check-influencer", username);

    if (!username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    client = await dbConnect();
    const database = client.db("ctxbt-signal-flow");
    const collection = database.collection("influencers");

    const aggStartMs = Date.now();
    const docs = await collection
      .aggregate([
        { $match: { twitterHandle: username } },
        {
          $project: {
            twitterHandle: 1,
            walletAddress: 1,
            subscribersCount: { $size: { $ifNull: ["$subscribers", []] } },
            creditAmount: 1,
            creditExpiry: 1,
            tweetsCount: { $size: { $ifNull: ["$tweets", []] } },
            monthlyPayouts: 1,
          },
        },
        {
          $addFields: {
            latestPayout: {
              $let: {
                vars: {
                  sorted: {
                    $slice: [
                      {
                        $sortArray: {
                          input: { $ifNull: ["$monthlyPayouts", []] },
                          sortBy: { updatedAt: 1 },
                        },
                      },
                      -1,
                    ],
                  },
                },
                in: { $ifNull: [{ $arrayElemAt: ["$$sorted", 0] }, null] },
              },
            },
          },
        },
        {
          $project: {
            monthlyPayouts: 0,
          },
        },
      ])
      .toArray();
    const aggMs = Date.now() - aggStartMs;
    const user = docs[0];

    if (user) {
      const latestPayoutAmount = user.latestPayout?.payout ?? 0;

      const totalMs = Date.now() - handlerStartMs;
      console.log("[check-influencer] request completed", {
        username,
        aggMs,
        totalMs,
      });

      return NextResponse.json({
        exists: true,
        userId: user._id.toString(),
        username: user.twitterHandle,
        walletAddress: user.walletAddress || null,
        subscriberCount: user.subscribersCount || 0,
        creditAmount: user.creditAmount || 0,
        creditExpiry: user.creditExpiry || null,
        tweetsCount: user.tweetsCount || 0,
        latestPayout: latestPayoutAmount,
      }, { status: 200 });
    } else {
      return NextResponse.json({ exists: false }, { status: 200 });
    }
  } catch (error) {
    console.error("MongoDB error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } 
}