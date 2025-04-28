import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

export async function GET(request: Request): Promise<Response> {
  let client: MongoClient;
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get("telegramId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const filterType = searchParams.get("filterType") || "all";

    // Validate inputs
    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: { message: "Telegram ID is required" } },
        { status: 400 }
      );
    }

    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid page number" } },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid limit (must be 1-100)" } },
        { status: 400 }
      );
    }

    // Connect to database
    client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const tradingSignalsCollection = db.collection("trading-signals");
    
    // For exited signals, we need to connect to backtesting_db
    const backtestingDb = client.db("backtesting_db");
    const backtestingCollection = backtestingDb.collection("backtesting_results_with_reasoning");

    // Get user's trading signals
    const userSignals = await tradingSignalsCollection
      .find({
        subscribers: {
          $elemMatch: {
            username: telegramId,
          },
        },
      })
      .toArray();
    
    let signals = [];
    let totalSignals = 0;
    
    if (filterType === "exited") {
      // Get tweet links from user's signals to find matching backtesting results
      const userTweetLinks = userSignals.map(signal => signal.tweet_link);
      
      // Find backtesting results that match the user's signals and have a Final Exit Price
      const backtestingResults = await backtestingCollection
        .find({
          Tweet: { $in: userTweetLinks },
          "Final Exit Price": { $exists: true, $ne: "" }
        })
        .sort({ "Signal Generation Date": -1 })
        .toArray();
      
      // Map backtesting results to match the format of trading signals
      signals = backtestingResults.map(result => {
        // Find the matching user signal to get the subscribers info
        const matchingSignal = userSignals.find(s => s.tweet_link === result.Tweet);
        
        return {
          _id: result._id,
          tweet_id: result.Tweet.split('/').pop(),
          twitterHandle: result["Twitter Account"],
          coin: result["Token ID"],
          signal_message: result["Signal Message"],
          signal_data: {
            token: result["Token Mentioned"],
            signal: result["Signal Message"],
            currentPrice: parseFloat(result["Price at Tweet"]),
            targets: [parseFloat(result["TP1"] || 0), parseFloat(result["TP2"] || 0)].filter(t => t > 0),
            stopLoss: parseFloat(result["SL"] || 0),
            timeline: "Backtested",
            maxExitTime: result["Max Exit Time"],
            tradeTip: result["Reasoning"] || "",
            tweet_id: result.Tweet.split('/').pop(),
            tweet_link: result.Tweet,
            tweet_timestamp: result["Tweet Date"],
            priceAtTweet: parseFloat(result["Price at Tweet"]),
            exitValue: parseFloat(result["Final Exit Price"]),
            exitPnL: result["Final P&L"],
            bestStrategy: result["Best Strategy"],
            ipfsLink: result["IPFS Link"] || "",
            twitterHandle: result["Twitter Account"],
            tokenMentioned: result["Token Mentioned"],
            tokenId: result["Token ID"]
          },
          generatedAt: result["Signal Generation Date"],
          subscribers: matchingSignal?.subscribers || [],
          tweet_link: result.Tweet,
          messageSent: true,
          backtestingDone: true
        };
      });
      
      totalSignals = signals.length;
      
      // Apply pagination manually
      const skip = (page - 1) * limit;
      signals = signals.slice(skip, skip + limit);
      
    } else {
      // Get regular signals based on the filter type
      let query = {
        subscribers: {
          $elemMatch: {
            username: telegramId,
          },
        }
      };
      
      // Add signal filter if needed
      if (filterType === "buy" || filterType === "sell" || filterType === "hold") {
        query["signal_data.signal"] = { $regex: new RegExp(filterType, "i") };
      }
      
      // Calculate total count of matching signals
      totalSignals = await tradingSignalsCollection.countDocuments(query);
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Fetch paginated signals
      signals = await tradingSignalsCollection
        .find(query)
        .sort({ generatedAt: -1 }) // Sort by date descending (newest first)
        .skip(skip)
        .limit(limit)
        .toArray();
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalSignals / limit);

    return NextResponse.json({
      success: true,
      data: signals,
      pagination: {
        currentPage: page,
        limit,
        totalSignals,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching user trading signals:", error);
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
