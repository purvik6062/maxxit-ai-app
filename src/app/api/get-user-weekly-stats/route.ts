import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

export async function GET(request: Request): Promise<Response> {
  let client: MongoClient;
  try {
    const { searchParams } = new URL(request.url);
    const twitterId = searchParams.get("twitterId");

    // Validate inputs
    if (!twitterId) {
      return NextResponse.json(
        { success: false, error: { message: "Twitter ID is required" } },
        { status: 400 }
      );
    }

    // Connect to database
    client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const usersCollection = db.collection("users");
    const tradingSignalsCollection = db.collection("trading-signals");
    
    // For backtesting data
    const backtestingDb = client.db("backtesting_db");
    const backtestingCollection = backtestingDb.collection("backtesting_results_with_reasoning");

    // Get user profile with subscriptions
    const userProfile = await usersCollection.findOne({ twitterId });
    
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: { message: "User not found" } },
        { status: 404 }
      );
    }

    // Calculate current week start and end dates
    const now = new Date();
    const currentDay = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1; // Adjust to make Monday the first day
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysSinceMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Extract twitter handles from subscriptions
    const subscribedHandles = userProfile.subscribedAccounts.map(
      (sub: any) => sub.twitterHandle
    );

    // Get total active subscriptions
    const activeSubscriptions = userProfile.subscribedAccounts.filter(
      (sub: any) => new Date(sub.expiryDate) > now
    ).length;

    // Find signals for the current week from subscribed accounts
    const weeklySignals = await tradingSignalsCollection
      .find({
        twitterHandle: { $in: subscribedHandles },
        "signal_data.tweet_timestamp": {
          $gte: weekStart.toISOString(),
          $lte: weekEnd.toISOString(),
        },
      })
      .toArray();

    // Get tweet links for backtesting matching
    const tweetLinks = weeklySignals.map((signal: any) => signal.tweet_link);
    const coins = weeklySignals.map((signal: any) => signal.coin);

    // Find backtesting results for these signals
    const backtestingResults = await backtestingCollection
      .find({
        Tweet: { $in: tweetLinks },
        "Token ID": { $in: coins },
        "Final Exit Price": { $ne: "" }, // Only exited trades
      })
      .toArray();

    // Create map for fast lookup
    const backtestingMap = new Map();
    backtestingResults.forEach((result: any) => {
      const key = `${result.Tweet}:${result["Token ID"]}`;
      backtestingMap.set(key, result);
    });

    // Count profitable trades and calculate total profit/loss
    let profitableTradesCount = 0;
    let totalPnL = 0;
    let exitedTradesCount = 0;

    backtestingResults.forEach((result: any) => {
      const pnlString = result["Final P&L"];
      if (pnlString) {
        exitedTradesCount++;
        
        // Extract numeric value from PnL string (e.g., "+12.45%" → 12.45)
        // This matches the totalPnL.js approach - simply remove % and parse
        const pnlValue = parseFloat(pnlString.replace('%', ''));
        const isProfit = pnlValue >= 0;
        
        if (isProfit) {
          profitableTradesCount++;
        }
        
        // Add to total with the correct sign (already included in the parsed value)
        totalPnL += pnlValue;
      }
    });

    // Count total leads (signals) for the week
    const totalLeads = weeklySignals.length;

    // Create detailed signal objects with their PnL data
    const weeklySignalsWithPnL = weeklySignals.map((signal: any) => {
      const tweetLink = signal.tweet_link;
      const coin = signal.coin;
      const key = `${tweetLink}:${coin}`;
      const backtestResult = backtestingMap.get(key);
      
      // Process PnL value to ensure consistent format
      let pnlValue = null;
      if (backtestResult && backtestResult["Final P&L"]) {
        // Just store the raw percentage value, don't modify the sign
        // This matches the totalPnL.js approach
        pnlValue = backtestResult["Final P&L"];
      }
      
      return {
        id: signal._id.toString(),
        coin: signal.coin,
        twitterHandle: signal.twitterHandle,
        tweetLink: signal.tweet_link,
        timestamp: signal.signal_data?.tweet_timestamp,
        direction: signal.signal_data?.signal_type || "unknown",
        pnl: pnlValue,
        entryPrice: backtestResult ? backtestResult["Entry Price"] : null,
        exitPrice: backtestResult ? backtestResult["Final Exit Price"] : null,
        status: backtestResult && backtestResult["Final Exit Price"] ? "exited" : "active"
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        weeklyStats: {
          activeSubscriptions,
          totalLeads,
          exitedTradesCount,
          profitableTradesCount,
          totalPnL: parseFloat(totalPnL.toFixed(2)),
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
        },
        weeklySignalsWithPnL
      },
    });
  } catch (error) {
    console.error("Error fetching user weekly stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
} 