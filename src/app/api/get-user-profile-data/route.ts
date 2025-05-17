import { NextResponse } from "next/server";
import dbConnect from '../../../utils/dbConnect';
import { MongoClient } from "mongodb";

export async function GET(request: Request) {
  let client: MongoClient;
  try {
    client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const collection = db.collection("influencers");

    // Only fetch the fields that are actually used by the application
    const users = await collection.find({}, {
      projection: {
        name: 1,
        twitterHandle: 1,
        subscriptionPrice: 1,
        subscribers: 1, // We'll use this for counting later
        impactFactor: 1, // Include impact factor field
        heartbeatScore: 1, // Include heartbeat score field
        // Include only the necessary userData fields
        "userData.mindshare": 1,
        "userData.publicMetrics.followers_count": 1,
        "userData.userProfileUrl": 1,
        "userData.verified": 1,
        "userData.herdedVsHidden": 1,
        "userData.convictionVsHype": 1,
        "userData.memeVsInstitutional": 1,
      }
    }).toArray();

    // Transform the data to include subscribers count instead of the entire array
    const transformedUsers = users.map(user => ({
      ...user,
      subscribers: user.subscribers ? user.subscribers.length : 0
    }));

    return NextResponse.json(transformedUsers, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}