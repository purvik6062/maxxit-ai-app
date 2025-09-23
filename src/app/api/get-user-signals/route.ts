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
    const handlerStartMs = Date.now();
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
    const connectStartMs = Date.now();
    client = await dbConnect();
    const dbConnectMs = Date.now() - connectStartMs;
    const db = client.db("ctxbt-signal-flow");
    const tradingSignalsCollection = db.collection("trading-signals");

    // For backtesting data - main source for exited trades
    const backtestingDb = client.db("backtesting_db");
    const backtestingCollection = backtestingDb.collection(
      "backtesting_results_with_reasoning"
    );

    // Build base filter (+ server-side signal filter where possible)
    const baseFilter: any = {
      subscribers: {
        $elemMatch: {
          username: telegramId,
        },
      },
    };
    if (filterType === "buy" || filterType === "sell" || filterType === "hold") {
      // Case-insensitive match on signal type
      baseFilter["signal_data.signal"] = { $regex: `^${filterType}$`, $options: "i" };
    }

    // Count total matching signals for pagination (matches DB-side filter)
    const countStartMs = Date.now();
    const countPromise = tradingSignalsCollection.countDocuments(baseFilter);

    // Fetch only one page with projection and sort
    const fetchSignalsStartMs = Date.now();
    const pagePromise = tradingSignalsCollection
      .find(baseFilter, {
        projection: {
          tweet_link: 1,
          coin: 1,
          generatedAt: 1,
          "signal_data.token": 1,
          "signal_data.signal": 1,
          "signal_data.currentPrice": 1,
          "signal_data.targets": 1,
          "signal_data.stopLoss": 1,
          "signal_data.exitValue": 1,
          "signal_data.exitPnL": 1,
          "signal_data.bestStrategy": 1,
          "signal_data.ipfsLink": 1,
        },
        sort: { generatedAt: -1 },
        skip: (page - 1) * limit,
        limit,
      })
      .toArray();
    const [totalSignals, userSignals] = await Promise.all([
      countPromise,
      pagePromise,
    ]) as [number, SignalData[]];
    const fetchSignalsMs = Date.now() - fetchSignalsStartMs;

    // Fetch backtesting only for the current page
    const backtestingFetchStartMs = Date.now();
    const backtestingResults = await backtestingCollection
      .find(
        {
          $or: userSignals.map((signal) => ({
            $and: [{ Tweet: signal.tweet_link }, { "Token ID": signal.coin }],
          })),
        },
        {
          projection: {
            Tweet: 1,
            "Token ID": 1,
            "Final Exit Price": 1,
            "Final P&L": 1,
            SL: 1,
            TP1: 1,
            TP2: 1,
            "Best Strategy": 1,
            "Price at Tweet": 1,
            "IPFS Link": 1,
          },
        }
      )
      .toArray();
    const backtestingFetchMs = Date.now() - backtestingFetchStartMs;

    // Create a map of tweet links to backtesting results for fast lookup
    const backtestingMap = new Map();
    backtestingResults.forEach((result) => {
      // Create a composite key using both Tweet and Token ID
      const key = `${result.Tweet}:${result["Token ID"]}`;
      backtestingMap.set(key, result);
    });

    // Process each signal
    const enrichStartMs = Date.now();
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
    const enrichMs = Date.now() - enrichStartMs;

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

    // Already sorted by DB on generatedAt desc; keep order

    // Calculate total pages
    const totalPages = Math.ceil(totalSignals / limit);

    // We already fetched one page; now apply post-enrichment filtering if needed
    let pageSignals = enrichedSignals;
    if (filterType === "exited") {
      pageSignals = enrichedSignals.filter((signal) => signal.hasExited);
    } else if (
      filterType === "buy" ||
      filterType === "sell" ||
      filterType === "hold"
    ) {
      pageSignals = enrichedSignals.filter(
        (signal) =>
          signal.signal_data.signal.toLowerCase() === filterType.toLowerCase()
      );
    }

    // Note: If filter reduces below limit, that's expected; count remains totalSignals from base filter
    const paginatedSignals = pageSignals;

    const totalMs = Date.now() - handlerStartMs;
    console.log("[get-user-signals] request completed", {
      telegramId,
      page,
      limit,
      filterType,
      dbConnectMs,
      fetchSignalsMs,
      backtestingFetchMs,
      enrichMs,
      totalMs,
      inputSignals: userSignals.length,
      outputSignals: paginatedSignals.length,
    });

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
