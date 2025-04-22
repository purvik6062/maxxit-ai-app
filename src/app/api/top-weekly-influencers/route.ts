import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

// Interface for the API response
export interface Influencer {
  id: string;
  name: string;
  followers: number;
  avatar: string;
}

export async function GET() {
  let client: MongoClient;
  try {
    client = await dbConnect();
    const db1 = client.db("backtesting_db");
    const db2 = client.db("ctxbt-signal-flow");
    const backtestingCollection = db1.collection("weekly_pnl");
    const ctxbtCollection = db2.collection("influencers");

    // Fetch the latest document from weekly_pnl
    const latestWeeklyPnl = await backtestingCollection
      .find()
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (!latestWeeklyPnl.length) {
      return NextResponse.json(
        { error: "No weekly P/L data found" },
        { status: 404 }
      );
    }

    // Extract the data property and convert to array of { name, profit }
    const pnlData = latestWeeklyPnl[0].data;
    const influencers = Object.entries(pnlData)
      .map(([name, profit]) => ({
        name,
        profit: Number(profit),
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 6); // Get top 6

    // Fetch additional data from ctxbt-signal-flow.influencers
    const influencerDetails = await Promise.all(
      influencers.map(async (influencer, index) => {
        const influencerDoc = await ctxbtCollection.findOne({
          twitterHandle: influencer.name,
        });

        if (!influencerDoc) {
          return null;
        }

        return {
          id: `inf${index + 1}`,
          name: influencer.name,
          followers:
            influencerDoc.userData?.publicMetrics?.followers_count || 0,
          avatar:
            influencerDoc.userData?.userProfileUrl ||
            "https://via.placeholder.com/150",
        };
      })
    );

    return NextResponse.json(influencerDetails);
  } catch (error) {
    console.error("Error fetching influencers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } 
}
