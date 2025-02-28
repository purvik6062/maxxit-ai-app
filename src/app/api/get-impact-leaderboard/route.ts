import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function GET(): Promise<Response> {
  try {
    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");

    // Fetch all accounts from the influencers collection
    const influencers = await db.collection("influencers").find({}).toArray();

    return NextResponse.json({
      success: true,
      data: influencers.map((influencer, index) => ({
        id: index + 1,
        _id: influencer._id,
        name: influencer.name || influencer.twitterHandle, // fallback to handle if name isn't set
        handle: '@' + influencer.twitterHandle, // add @ prefix for display
        subscriberCount: influencer.subscribers?.length || 0
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}