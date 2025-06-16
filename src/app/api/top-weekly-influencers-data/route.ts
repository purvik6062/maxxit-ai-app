import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { Collection } from "mongodb";

// Interface for the API response
export interface Influencer {
  id: string;
  name: string;
  followers: number;
  avatar: string;
  recentMonthSignals: number;
  recentMonthTokens: number;
  specialties: string[];
  monthlyROI: number;
}

export async function GET() {
  console.time('top-monthly-influencers-api');
  
  try {
    // Connect to DB once and reuse the connection
    const client = await dbConnect();
    const db1 = client.db("backtesting_db");
    const db2 = client.db("ctxbt-signal-flow");
    
    // Get collections once
    const backtestingCollection = db1.collection("weekly_pnl");
    const ctxbtCollection = db2.collection("influencers");
    const tradingSignalsCollection = db2.collection("trading-signals");

    // Calculate month start date (30 days ago from now)
    const currentDate = new Date();
    const monthStartDate = new Date();
    monthStartDate.setDate(currentDate.getDate() - 30);

    console.time('fetch-monthly-pnl');
    // Fetch all weekly P&L documents from the last month
    const monthlyPnlDocs = await backtestingCollection
      .find({
        timestamp: {
          $gte: monthStartDate,
          $lte: currentDate
        }
      }, { 
        projection: { timestamp: 1, data: 1, _id: 0 } 
      })
      .sort({ timestamp: -1 })
      .toArray();
    console.timeEnd('fetch-monthly-pnl');

    if (!monthlyPnlDocs.length) {
      return NextResponse.json(
        { error: "No monthly P&L data found" },
        { status: 404 }
      );
    }

    // Aggregate P&L data across all weeks in the month
    const monthlyPnlData: { [key: string]: number } = {};
    
    monthlyPnlDocs.forEach(doc => {
      const weekData = doc.data;
      Object.entries(weekData).forEach(([name, profit]) => {
        if (!monthlyPnlData[name]) {
          monthlyPnlData[name] = 0;
        }
        monthlyPnlData[name] += Number(profit);
      });
    });

    // Get all influencer handles for signal count calculation
    const allInfluencerHandles = Object.keys(monthlyPnlData);

    // Run these queries in parallel with Promise.all to save time
    console.time('parallel-data-fetch');
    const [influencerData, signalData] = await Promise.all([
      // Fetch influencer profile data with minimal projection
      ctxbtCollection.find(
        { twitterHandle: { $in: allInfluencerHandles } },
        { 
          projection: { 
            twitterHandle: 1, 
            "userData.publicMetrics.followers_count": 1, 
            "userData.userProfileUrl": 1,
            subscriptionPrice: 1,
            _id: 0
          } 
        }
      ).toArray(),
      
      // Fetch signals data for the entire month with minimal projection
      tradingSignalsCollection.find(
        {
          twitterHandle: { $in: allInfluencerHandles },
          generatedAt: {
            $gte: monthStartDate,
            $lte: currentDate,
          }
        },
        { projection: { twitterHandle: 1, coin: 1, _id: 0 } }
      ).toArray()
    ]);
    console.timeEnd('parallel-data-fetch');

    // Process signals data to count signals per influencer
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

    // Calculate ROI for each influencer and get top performers
    const influencersWithROI = Object.entries(monthlyPnlData)
      .map(([name, totalPnl]) => {
        const signalCount = signalsByInfluencer.get(name) || 0;
        const roi = signalCount > 0 ? (totalPnl / signalCount) : 0;
        
        return {
          name,
          totalPnl: Number(totalPnl),
          signalCount,
          roi
        };
      })
      .sort((a, b) => b.roi - a.roi) // Sort by ROI instead of just profit
      .slice(0, 6); // Get top 6 by ROI

    // Create lookup map for influencer data
    const influencerMap = new Map();
    influencerData.forEach(doc => {
      influencerMap.set(doc.twitterHandle, doc);
    });

    // Calculate total ROI (average of all top influencers' ROIs)
    const totalROI = influencersWithROI.reduce((sum, inf) => sum + inf.roi, 0) / influencersWithROI.length;

    // Assemble final response data
    const result = influencersWithROI.map((influencer, index) => {
      const influencerDoc = influencerMap.get(influencer.name);
      if (!influencerDoc) return null;

      return {
        id: `inf${index + 1}`,
        name: influencer.name,
        followers: influencerDoc.userData?.publicMetrics?.followers_count || 0,
        avatar: influencerDoc.userData?.userProfileUrl || "https://via.placeholder.com/150",
        recentMonthSignals: influencer.signalCount,
        recentMonthTokens: tokensByInfluencer.get(influencer.name)?.size || 0,
        subscriptionPrice: influencerDoc.subscriptionPrice,
        specialties: ['Crypto Analysis', 'Trading Signals'], // Default specialties
        monthlyROI: influencer.roi
      };
    }).filter(Boolean);

    console.timeEnd('top-monthly-influencers-api');
    return NextResponse.json(
      {
        influencers: result,
        totalProfit: totalROI, // This is now the average ROI
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching influencers:", error);
    console.timeEnd('top-monthly-influencers-api');
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}