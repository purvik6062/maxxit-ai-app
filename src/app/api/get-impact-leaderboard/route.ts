import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function GET(): Promise<Response> {
  try {
    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");

    // Fetch all accounts from the influencers collection
    const influencers = await db.collection("influencers_account").find().sort({ createdAt: 1 }).toArray();

    return NextResponse.json({
      success: true,
      data: influencers.map((influencer, index) => ({
        id: index + 1,
        _id: influencer._id,
        name: influencer.name, // fallback to handle if name isn't set
        handle: influencer.handle, // add @ prefix for display
        impactFactor: influencer.impactFactor,
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