import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

// Define a type for the signal object
interface SignalData {
  _id: any;
  tweet_id?: string;
  twitterHandle?: string;
  coin?: string;
  signal_message?: string;
  signal_data: {
    token: string;
    signal: string;
    currentPrice: number;
    targets: number[];
    stopLoss: number;
    timeline?: string;
    maxExitTime?: string;
    tradeTip?: string;
    tweet_id?: string;
    tweet_link?: string;
    tweet_timestamp?: string;
    priceAtTweet?: number;
    exitValue?: number | null;
    exitPnL?: string | null;
    bestStrategy?: string;
    twitterHandle?: string;
    tokenMentioned?: string;
    tokenId?: string;
    ipfsLink?: string;
  };
  generatedAt: string;
  subscribers?: Array<{
    username: string;
    sent: boolean;
  }>;
  tweet_link: string;
  messageSent?: boolean;
  backtestingDone?: boolean;
  hasExited?: boolean;
}

// Helper function to fetch data from IPFS link
async function fetchFromIpfs(ipfsUrl: string) {
  try {
    const response = await fetch(ipfsUrl);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching data from IPFS:", error);
  }
  return null;
}

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

    // For backtesting data - main source for exited trades
    const backtestingDb = client.db("backtesting_db");
    const backtestingCollection = backtestingDb.collection(
      "backtesting_results_with_reasoning"
    );

    // Get user's trading signals
    const userSignals = (await tradingSignalsCollection
      .find({
        subscribers: {
          $elemMatch: {
            username: telegramId,
          },
        },
      })
      .toArray()) as SignalData[];

    // Get all tweet links for backtesting matching
    const userTweetLinks = userSignals.map((signal) => signal.tweet_link);

    // Find all backtesting results for these signals
    const backtestingResults = await backtestingCollection
      .find({
        $or: userSignals.map((signal) => ({
          $and: [{ Tweet: signal.tweet_link }, { "Token ID": signal.coin }],
        })),
      })
      .toArray();

    // Create a map of tweet links to backtesting results for fast lookup
    const backtestingMap = new Map();
    backtestingResults.forEach((result) => {
      // Create a composite key using both Tweet and Token ID
      const key = `${result.Tweet}:${result["Token ID"]}`;
      backtestingMap.set(key, result);
    });

    // Process each signal
    const enrichedSignals = userSignals.map((signal) => {
      // Get matching backtesting result using composite key
      const compositeKey = `${signal.tweet_link}:${signal.coin}`;
      const backtestingResult = backtestingMap.get(compositeKey);

      // If no backtesting result, return signal as is
      if (!backtestingResult) {
        return {
          ...signal,
          hasExited: false,
          backtestingDone: false,
        } as SignalData;
      }

      // Check if this is an exited trade - verify Final Exit Price exists and is not empty
      const hasExitPrice =
        backtestingResult["Final Exit Price"] &&
        backtestingResult["Final Exit Price"] !== "";

      if (!hasExitPrice) {
        // This has backtesting data but hasn't exited
        return {
          ...signal,
          signal_data: {
            ...signal.signal_data,
            // Update stopLoss and targets from backtesting if available
            stopLoss: backtestingResult["SL"]
              ? parseFloat(backtestingResult["SL"])
              : signal.signal_data.stopLoss,
            targets:
              [
                parseFloat(backtestingResult["TP1"] || "0"),
                parseFloat(backtestingResult["TP2"] || "0"),
              ].filter((t) => t > 0).length > 0
                ? [
                    parseFloat(backtestingResult["TP1"] || "0"),
                    parseFloat(backtestingResult["TP2"] || "0"),
                  ].filter((t) => t > 0)
                : signal.signal_data.targets,
          },
          hasExited: false,
          backtestingDone: true,
        } as SignalData;
      }

      // This is an exited trade - use backtesting data
      return {
        ...signal,
        signal_data: {
          ...signal.signal_data,
          // Use backtesting data for entry price, exit price, PnL
          currentPrice: backtestingResult["Price at Tweet"]
            ? parseFloat(backtestingResult["Price at Tweet"])
            : signal.signal_data.currentPrice,
          exitValue: parseFloat(backtestingResult["Final Exit Price"]),
          exitPnL: backtestingResult["Final P&L"] || "",
          stopLoss: backtestingResult["SL"]
            ? parseFloat(backtestingResult["SL"])
            : signal.signal_data.stopLoss,
          targets:
            [
              parseFloat(backtestingResult["TP1"] || "0"),
              parseFloat(backtestingResult["TP2"] || "0"),
            ].filter((t) => t > 0).length > 0
              ? [
                  parseFloat(backtestingResult["TP1"] || "0"),
                  parseFloat(backtestingResult["TP2"] || "0"),
                ].filter((t) => t > 0)
              : signal.signal_data.targets,
          bestStrategy: backtestingResult["Best Strategy"] || "",
          ipfsLink:
            backtestingResult["IPFS Link"] || signal.signal_data.ipfsLink,
        },
        hasExited: true,
        backtestingDone: true,
      } as SignalData;
    });

    // Apply filtering
    let filteredSignals: any[] = [];
    if (filterType === "all") {
      filteredSignals = enrichedSignals;
    } else if (filterType === "exited") {
      filteredSignals = enrichedSignals.filter((signal) => signal.hasExited);
    } else if (
      filterType === "buy" ||
      filterType === "sell" ||
      filterType === "hold"
    ) {
      filteredSignals = enrichedSignals.filter(
        (signal) =>
          signal.signal_data.signal.toLowerCase() === filterType.toLowerCase()
      );
    }

    // Sort by date (newest first)
    filteredSignals.sort(
      (a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );

    // Calculate total count for pagination
    const totalSignals = filteredSignals.length;
    const totalPages = Math.ceil(totalSignals / limit);

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedSignals = filteredSignals.slice(start, end);

    return NextResponse.json({
      success: true,
      data: paginatedSignals,
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
