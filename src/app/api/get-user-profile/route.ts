import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

export async function GET(request: Request): Promise<Response> {
  let client: MongoClient;
  try {
    const handlerStartMs = Date.now();
    const { searchParams } = new URL(request.url);
    const twitterId = searchParams.get("twitterId");

    if (!twitterId) {
      return NextResponse.json(
        { success: false, error: { message: "Twitter ID is required" } },
        { status: 400 }
      );
    }

    const connectStartMs = Date.now();
    client = await dbConnect();
    const dbConnectMs = Date.now() - connectStartMs;
    const db = client.db("ctxbt-signal-flow");
    const usersCollection = db.collection("users");

    const userFindStartMs = Date.now();
    // Single-pass aggregation: fetch minimal fields and enrich subscriptions with leadsCount
    const pipeline = [
      { $match: { twitterId } },
      {
        $project: {
          twitterId: 1,
          twitterUsername: 1,
          telegramId: 1,
          credits: 1,
          createdAt: 1,
          updatedAt: 1,
          subscribedAccounts: 1,
        },
      },
      {
        $addFields: {
          subscribedHandles: {
            $map: { input: "$subscribedAccounts", as: "s", in: "$$s.twitterHandle" },
          },
        },
      },
      {
        $lookup: {
          from: "influencers",
          let: { handles: "$subscribedHandles" },
          pipeline: [
            { $match: { $expr: { $in: ["$twitterHandle", "$$handles"] } } },
            {
              $project: {
                _id: 0,
                twitterHandle: 1,
                leadsCount: { $size: { $ifNull: ["$tweets", []] } },
              },
            },
          ],
          as: "influencers",
        },
      },
      {
        $addFields: {
          subscribedAccounts: {
            $map: {
              input: "$subscribedAccounts",
              as: "sub",
              in: {
                $mergeObjects: [
                  "$$sub",
                  {
                    leadsCount: {
                      $let: {
                        vars: {
                          match: {
                            $first: {
                              $filter: {
                                input: "$influencers",
                                as: "inf",
                                cond: { $eq: ["$$inf.twitterHandle", "$$sub.twitterHandle"] },
                              },
                            },
                          },
                        },
                        in: { $ifNull: ["$$match.leadsCount", 0] },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $project: { influencers: 0, subscribedHandles: 0 } },
    ];

    const docs = await usersCollection.aggregate(pipeline).toArray();
    const user = docs[0];
    const userFindMs = Date.now() - userFindStartMs;

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "User not found" } },
        { status: 404 }
      );
    }

    const totalMs = Date.now() - handlerStartMs;
    console.log("[get-user-profile] request completed", {
      twitterId,
      dbConnectMs,
      userFindMs,
      totalMs,
      // hasSubscriptions: !!(user.subscribedAccounts && user.subscribedAccounts.length),
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("[get-user-profile] error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
