import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { ObjectId } from "mongodb";

interface TokenCount {
  [tokenId: string]: number;
}

interface DailyStat {
  date: string;
  signalCount: number;
  tokens: TokenCount;
}

interface TokenStat {
  tokenId: string;
  tokenName: string;
  count: number;
}

export async function GET(request, { params }) {
  const { id } = await params;
  console.log("get-influencer-signals-stats called with ID:", id);

  try {
    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");

    // Try to determine if the id is an ObjectId or a Twitter handle
    let query = {};
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (isValidObjectId) {
      try {
        // First find the influencer to get their Twitter handle
        const influencer = await db
          .collection("influencers")
          .findOne({ _id: new ObjectId(id) });
        
        if (influencer) {
          query = { twitterHandle: influencer.twitterHandle };
        } else {
          return NextResponse.json(
            { error: "Influencer not found" },
            { status: 404 }
          );
        }
      } catch (error) {
        console.error("ObjectId query failed:", error);
        return NextResponse.json(
          { error: "Invalid influencer ID" },
          { status: 400 }
        );
      }
    } else {
      // Use it as a Twitter handle directly
      query = { twitterHandle: id };
    }

    // Get all signals for this influencer
    const signals = await db
      .collection("trading-signals")
      .find(query)
      .sort({ generatedAt: -1 })
      .toArray();

    if (!signals || signals.length === 0) {
      return NextResponse.json({ 
        stats: [],
        message: "No signals found for this influencer" 
      });
    }

    // Process signals to get daily stats
    const dailyStats: Record<string, DailyStat> = {};
    const tokenStats: Record<string, TokenStat> = {};

    signals.forEach(signal => {
      // Get the date string (YYYY-MM-DD)
      const date = new Date(signal.generatedAt).toISOString().split('T')[0];
      
      // Initialize if this date doesn't exist
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          signalCount: 0,
          tokens: {}
        };
      }
      
      // Increment count
      dailyStats[date].signalCount++;
      
      // Track tokens mentioned on this day
      const tokenId = signal.signal_data?.tokenId || 'unknown';
      if (!dailyStats[date].tokens[tokenId]) {
        dailyStats[date].tokens[tokenId] = 0;
      }
      dailyStats[date].tokens[tokenId]++;
      
      // Track overall token stats
      if (!tokenStats[tokenId]) {
        tokenStats[tokenId] = {
          tokenId,
          tokenName: signal.coin || tokenId,
          count: 0
        };
      }
      tokenStats[tokenId].count++;
    });

    // Convert to arrays for easier consumption by the frontend
    const dailyStatsArray = Object.values(dailyStats).map(day => ({
      ...day,
      tokens: Object.entries(day.tokens).map(([tokenId, count]) => ({
        tokenId,
        tokenName: tokenStats[tokenId]?.tokenName || tokenId,
        count
      }))
    }));

    const tokenStatsArray = Object.values(tokenStats)
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      stats: dailyStatsArray,
      tokenStats: tokenStatsArray,
      totalSignals: signals.length
    });
  } catch (error) {
    console.error("Error in get-influencer-signals-stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch influencer signals stats" },
      { status: 500 }
    );
  }
} 