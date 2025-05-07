import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

// Interface for the API response
export interface Influencer {
  id: string;
  name: string;
  followers: number;
  avatar: string;
  recentWeekSignals: number;
  recentWeekTokens: number;
  specialties: string[];
}

export async function GET() {
  console.time('top-weekly-influencers-data');
  const client = await dbConnect();
  try {
    const db1 = client.db("backtesting_db");
    const db2 = client.db("ctxbt-signal-flow");
    const backtestingCollection = db1.collection("weekly_pnl");
    const ctxbtCollection = db2.collection("influencers");
    const tradingSignalsCollection = db2.collection("trading-signals");

    console.time('fetch-weekly-pnl');
    // Fetch the latest document from weekly_pnl
    const latestWeeklyPnl = await backtestingCollection
      .find({}, { projection: { timestamp: 1, data: 1 } })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    console.timeEnd('fetch-weekly-pnl');

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
    const influencers = Object.entries(pnlData)
      .map(([name, profit]) => ({
        name,
        profit: Number(profit),
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 6); // Get top 6

    // Get all influencer Twitter handles
    const twitterHandles = influencers.map(influencer => influencer.name);

    // Fetch all influencer data in a single query with projection
    console.time('fetch-influencer-data');
    const influencerDocs = await ctxbtCollection.find(
      { twitterHandle: { $in: twitterHandles } },
      { 
        projection: { 
          twitterHandle: 1, 
          "userData.publicMetrics.followers_count": 1, 
          "userData.userProfileUrl": 1 
        } 
      }
    ).toArray();
    console.timeEnd('fetch-influencer-data');

    // Create a lookup map for easy access
    const influencerMap = influencerDocs.reduce((acc, doc) => {
      acc[doc.twitterHandle] = doc;
      return acc;
    }, {});

    // Fetch all signals for these influencers in the date range in a single query
    console.time('fetch-signals-data');
    const allSignals = await tradingSignalsCollection.find(
      {
        twitterHandle: { $in: twitterHandles },
        generatedAt: {
          $gte: weekStart,
          $lte: latestWeeklyPnl[0].timestamp,
        }
      },
      { projection: { twitterHandle: 1, coin: 1 } }
    ).toArray();
    console.timeEnd('fetch-signals-data');

    // Group signals by twitterHandle
    const signalsByInfluencer = {};
    allSignals.forEach(signal => {
      if (!signalsByInfluencer[signal.twitterHandle]) {
        signalsByInfluencer[signal.twitterHandle] = [];
      }
      signalsByInfluencer[signal.twitterHandle].push(signal);
    });

    // Map the data to the final format
    const result = influencers.map((influencer, index) => {
      const influencerDoc = influencerMap[influencer.name];
      if (!influencerDoc) return null;

      const influencerSignals = signalsByInfluencer[influencer.name] || [];
      const uniqueTokens = new Set(influencerSignals.map(signal => signal.coin));

      return {
        id: `inf${index + 1}`,
        name: influencer.name,
        followers: influencerDoc.userData?.publicMetrics?.followers_count || 0,
        avatar: influencerDoc.userData?.userProfileUrl || "https://via.placeholder.com/150",
        recentWeekSignals: influencerSignals.length,
        recentWeekTokens: uniqueTokens.size,
        specialties: ['Crypto Analysis', 'Trading Signals'] // Default specialties
      };
    }).filter(Boolean);

    const totalProfit = influencers.reduce(
      (sum, influencer) => sum + influencer.profit,
      0
    );

    console.timeEnd('top-weekly-influencers-data');
    return NextResponse.json(
      {
        influencers: result,
        totalProfit,
      },
      { 
        status: 200, 
      }
    );
  } catch (error) {
    console.error("Error fetching influencers:", error);
    console.timeEnd('top-weekly-influencers-data');
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}