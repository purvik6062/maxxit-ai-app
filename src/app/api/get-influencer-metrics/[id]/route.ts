import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const handlerStartMs = Date.now();
    const connectStartMs = Date.now();
    const client = await dbConnect();
    const dbConnectMs = Date.now() - connectStartMs;
    const db = client.db("ctxbt-signal-flow");

    // Determine if id is ObjectId or twitterHandle
    let query: any = {};
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      try {
        query = { _id: new ObjectId(id) };
      } catch {
        query = { twitterHandle: id };
      }
    } else {
      query = { twitterHandle: id };
    }

    const findStartMs = Date.now();
    const influencer = await db.collection("influencers").findOne(query, {
      projection: {
        twitterHandle: 1,
        subscriptionPrice: 1,
        subscribers: 1,
        userData: {
          username: 1,
          userProfileUrl: 1,
          mindshare: 1,
          herdedVsHidden: 1,
          convictionVsHype: 1,
          memeVsInstitutional: 1,
          impactFactor: 1,
          publicMetrics: { followers_count: 1 },
        },
      } as any,
    });
    const findMs = Date.now() - findStartMs;

    if (!influencer) {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
    }

    const totalMs = Date.now() - handlerStartMs;
    console.log("[get-influencer-metrics] request completed", {
      id,
      dbConnectMs,
      findMs,
      totalMs,
    });

    return NextResponse.json(influencer);
  } catch (error) {
    console.error("Error in get-influencer-metrics:", error);
    return NextResponse.json({ error: "Failed to fetch influencer" }, { status: 500 });
  }
}