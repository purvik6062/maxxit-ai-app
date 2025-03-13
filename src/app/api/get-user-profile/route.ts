import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: { message: "Wallet address is required" } },
        { status: 400 }
      );
    }

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const usersCollection = db.collection("users");
    const influencerCollection = db.collection("influencers");

    const user = await usersCollection.findOne({ walletAddress });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "User not found" } },
        { status: 404 }
      );
    }

    // Enhance each subscription with the leads count from the influencer collection
    if (user.subscribedAccounts && Array.isArray(user.subscribedAccounts)) {
      const enhancedSubscriptions = await Promise.all(
        user.subscribedAccounts.map(async (sub: any) => {
          const influencerDoc = await influencerCollection.findOne({
            twitterHandle: sub.twitterHandle,
          });
          return {
            ...sub,
            leadsCount:
              influencerDoc && influencerDoc.tweets
                ? influencerDoc.tweets.length
                : 0,
          };
        })
      );
      user.subscribedAccounts = enhancedSubscriptions;
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
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
