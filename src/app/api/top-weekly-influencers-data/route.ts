import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { Collection } from "mongodb";

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
  console.time('top-weekly-influencers-api');
  
  try {
    // Connect to DB once and reuse the connection
    const client = await dbConnect();
    const db1 = client.db("backtesting_db");
    const db2 = client.db("ctxbt-signal-flow");
    
    // Get collections once
    const backtestingCollection = db1.collection("weekly_pnl");
    const ctxbtCollection = db2.collection("influencers");
    const tradingSignalsCollection = db2.collection("trading-signals");

    // Fetch only the latest weekly P&L document with minimal projection
    console.time('fetch-weekly-pnl');
    const latestWeeklyPnl = await backtestingCollection
      .find({}, { 
        projection: { timestamp: 1, data: 1, _id: 0 } 
      })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    console.timeEnd('fetch-weekly-pnl');

    if (!latestWeeklyPnl.length) {
      return NextResponse.json(
        { error: "No weekly P&L data found" },
        { status: 404 }
      );
    }

    const weekStartDate = new Date(latestWeeklyPnl[0].timestamp);
    weekStartDate.setDate(weekStartDate.getDate() - 7);
    
    // Extract and process P&L data - get top 6 influencers by profit
    const pnlData = latestWeeklyPnl[0].data;
    const topInfluencers = Object.entries(pnlData)
      .map(([name, profit]) => ({
        name,
        profit: Number(profit),
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 6);

    const twitterHandles = topInfluencers.map(influencer => influencer.name);
    const totalProfit = topInfluencers.reduce((sum, influencer) => sum + influencer.profit, 0);

    // Run these queries in parallel with Promise.all to save time
    console.time('parallel-data-fetch');
    const [influencerData, signalData] = await Promise.all([
      // Fetch influencer profile data with minimal projection
      ctxbtCollection.find(
        { twitterHandle: { $in: twitterHandles } },
        { 
          projection: { 
            twitterHandle: 1, 
            "userData.publicMetrics.followers_count": 1, 
            "userData.userProfileUrl": 1,
            _id: 0
          } 
        }
      ).toArray(),
      
      // Fetch signals data with minimal projection
      tradingSignalsCollection.find(
        {
          twitterHandle: { $in: twitterHandles },
          generatedAt: {
            $gte: weekStartDate,
            $lte: latestWeeklyPnl[0].timestamp,
          }
        },
        { projection: { twitterHandle: 1, coin: 1, _id: 0 } }
      ).toArray()
    ]);
    console.timeEnd('parallel-data-fetch');

    // Process signals data once (not in a loop)
    const signalsByInfluencer = new Map();
    const tokensByInfluencer = new Map();
    
    signalData.forEach(signal => {
      // Count signals
      if (!signalsByInfluencer.has(signal.twitterHandle)) {
        signalsByInfluencer.set(signal.twitterHandle, 0);
        tokensByInfluencer.set(signal.twitterHandle, new Set());
      }
      signalsByInfluencer.set(
        signal.twitterHandle, 
        signalsByInfluencer.get(signal.twitterHandle) + 1
      );
      
      // Track unique tokens
      tokensByInfluencer.get(signal.twitterHandle).add(signal.coin);
    });

    // Create lookup map for influencer data
    const influencerMap = new Map();
    influencerData.forEach(doc => {
      influencerMap.set(doc.twitterHandle, doc);
    });

    // Assemble final response data
    const result = topInfluencers.map((influencer, index) => {
      const influencerDoc = influencerMap.get(influencer.name);
      if (!influencerDoc) return null;

      return {
        id: `inf${index + 1}`,
        name: influencer.name,
        followers: influencerDoc.userData?.publicMetrics?.followers_count || 0,
        avatar: influencerDoc.userData?.userProfileUrl || "https://via.placeholder.com/150",
        recentWeekSignals: signalsByInfluencer.get(influencer.name) || 0,
        recentWeekTokens: tokensByInfluencer.get(influencer.name)?.size || 0,
        specialties: ['Crypto Analysis', 'Trading Signals'] // Default specialties
      };
    }).filter(Boolean);

    console.timeEnd('top-weekly-influencers-api');
    return NextResponse.json(
      {
        influencers: result,
        totalProfit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching influencers:", error);
    console.timeEnd('top-weekly-influencers-api');
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}