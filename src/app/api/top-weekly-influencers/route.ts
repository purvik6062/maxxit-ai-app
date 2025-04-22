import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

// Interface for the API response
export interface Influencer {
  id: string;
  name: string;
  followers: number;
  avatar: string;
}

export async function GET() {
  const client = await dbConnect();
  try {
    const db1 = client.db("backtesting_db");
    const db2 = client.db("ctxbt-signal-flow");
    const backtestingCollection = db1.collection("weekly_pnl");
    const ctxbtCollection = db2.collection("influencers");
    const tradingSignalsCollection = db2.collection("trading-signals");

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

    const weekStart = new Date(latestWeeklyPnl[0].timestamp);
    weekStart.setDate(weekStart.getDate() - 7);

    // Extract the data property and convert to array of { name, profit }
    const pnlData = latestWeeklyPnl[0].data;
    const influencers = Object.entries(pnlData) // this converts the object into array of arrays where arrays will be in [key, value] format
      .map(([name, profit]) => ({
        // array destructuring, will assign [key, value] key to name and value to profit and wrap them in array of objects
        name,
        profit: Number(profit),
      }))
      .sort((a, b) => b.profit - a.profit) // descending order sorting
      .slice(0, 6); // Get top 6

    // Fetch additional data from ctxbt-signal-flow.influencers
    const influencerDetails = await Promise.all(
      // Waiting for all asynchronous operations to finish
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

    const influencersWithSignals = await Promise.all(
      influencerDetails.map(async (influencer) => {
        if (!influencer) return null;

        const signals = await tradingSignalsCollection
          .find({
            twitterHandle: influencer.name,
            generatedAt: {
              $gte: weekStart,
              $lte: latestWeeklyPnl[0].timestamp,
            },
          })
          .toArray();

        const uniqueTokens = new Set(signals.map((signal) => signal.coin));

        return {
          ...influencer,
          recentWeekSignals: signals.length,
          recentWeekTokens: uniqueTokens.size,
        };
      })
    );

    const totalProfit = influencers.reduce(
      (sum, influencer) => sum + influencer.profit,
      0
    );

    return NextResponse.json({
      influencers: influencersWithSignals.filter(Boolean),
      totalProfit,
    });
  } catch (error) {
    console.error("Error fetching influencers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}