import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient, ObjectId } from "mongodb";

// Define the same interface as in get-user-signals for consistency
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

// Interface for the trading_signals_backtesting collection format
interface BacktestingSignalData {
  _id: any;
  "Twitter Account": string;
  Tweet: string;
  "Tweet Date": string;
  "Signal Generation Date": string;
  "Signal Message": string;
  "Token Mentioned": string;
  "Token ID": string;
  "Price at Tweet": number;
  "Current Price": number;
  TP1: number;
  TP2: number;
  SL: number;
  "Max Exit Time": string;
  backtesting_done: boolean;
  "Best Strategy"?: string;
  "Final Exit Price"?: number;
  "Final P&L"?: string;
  Reasoning?: string;
  "IPFS Link"?: string;
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

// Helper function to convert a backtesting signal to the standard format
function convertBacktestingSignalToStandardFormat(
  backtestingSignal: BacktestingSignalData
): SignalData {
  const isCompleted =
    backtestingSignal.backtesting_done &&
    backtestingSignal["Final Exit Price"] !== undefined;

  return {
    _id: backtestingSignal._id,
    twitterHandle: backtestingSignal["Twitter Account"],
    coin: backtestingSignal["Token ID"],
    signal_message: backtestingSignal["Signal Message"],
    signal_data: {
      token: backtestingSignal["Token ID"],
      signal: backtestingSignal["Signal Message"],
      currentPrice: backtestingSignal["Price at Tweet"],
      targets: [backtestingSignal["TP1"], backtestingSignal["TP2"]].filter(
        Boolean
      ),
      stopLoss: backtestingSignal["SL"],
      maxExitTime: backtestingSignal["Max Exit Time"],
      tweet_link: backtestingSignal["Tweet"],
      exitValue: isCompleted ? backtestingSignal["Final Exit Price"] : null,
      exitPnL: isCompleted ? backtestingSignal["Final P&L"] : null,
      bestStrategy: backtestingSignal["Best Strategy"],
      twitterHandle: backtestingSignal["Twitter Account"],
      tokenMentioned: backtestingSignal["Token Mentioned"],
      tokenId: backtestingSignal["Token ID"],
      ipfsLink: backtestingSignal["IPFS Link"],
    },
    generatedAt: backtestingSignal["Signal Generation Date"],
    tweet_link: backtestingSignal["Tweet"],
    backtestingDone: backtestingSignal.backtesting_done,
    hasExited: isCompleted,
  };
}

export async function GET(request: Request): Promise<Response> {
  let client: MongoClient;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Validate inputs
    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Signal ID is required" } },
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
    const backtestingSignalsCollection = backtestingDb.collection(
      "trading_signals_backtesting"
    );

    // Try to find the signal in the main trading-signals collection
    let signal = null;
    let isBacktestingSignal = false;

    try {
      signal = (await tradingSignalsCollection.findOne({
        _id: new ObjectId(id),
      })) as SignalData;
    } catch (err) {
      console.log("Error finding signal in main collection:", err);
      // This could be an invalid ObjectId format or other error
      // We'll try the backtesting collection next
    }

    // If not found in main collection, look in the backtesting signals collection
    if (!signal) {
      try {
        const backtestingSignal = (await backtestingSignalsCollection.findOne({
          _id: new ObjectId(id),
        })) as BacktestingSignalData;

        if (backtestingSignal) {
          // Convert the backtesting signal to our standard format
          signal = convertBacktestingSignalToStandardFormat(backtestingSignal);
          isBacktestingSignal = true;
        }
      } catch (err) {
        return NextResponse.json(
          { success: false, error: { message: "Invalid signal ID format" } },
          { status: 400 }
        );
      }
    }

    if (!signal) {
      return NextResponse.json(
        { success: false, error: { message: "Signal not found" } },
        { status: 404 }
      );
    }

    // If this is a regular signal (not from backtesting collection), process it as before
    if (!isBacktestingSignal) {
      // Find backtesting result for this signal
      let backtestingResult = null;

      if (signal.tweet_link && signal.coin) {
        backtestingResult = await backtestingCollection.findOne({
          $and: [{ Tweet: signal.tweet_link }, { "Token ID": signal.coin }],
        });
      }

      // Process signal data the same way as in get-user-signals API
      if (!backtestingResult) {
        // No backtesting result found
        signal.hasExited = false;
        signal.backtestingDone = false;
      } else {
        // Check if this is an exited trade - verify Final Exit Price exists and is not empty
        const hasExitPrice =
          backtestingResult["Final Exit Price"] &&
          backtestingResult["Final Exit Price"] !== "";

        if (!hasExitPrice) {
          // This has backtesting data but hasn't exited
          signal.signal_data = {
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
          };

          signal.hasExited = false;
          signal.backtestingDone = true;
        } else {
          // This is an exited trade - use backtesting data
          // Ensure we use the exact same data processing as in get-user-signals
          const exitValue = parseFloat(backtestingResult["Final Exit Price"]);
          const exitPnL = backtestingResult["Final P&L"] || "";

          signal.signal_data = {
            ...signal.signal_data,
            currentPrice: backtestingResult["Price at Tweet"]
              ? parseFloat(backtestingResult["Price at Tweet"])
              : signal.signal_data.currentPrice,
            exitValue,
            exitPnL,
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
          };

          signal.hasExited = true;
          signal.backtestingDone = true;
        }

        // Add backtesting data in a structured format to match the details page
        signal.backtestingData = {
          "Coin ID": backtestingResult["Token ID"] || "",
          "Entry Price": backtestingResult["Price at Tweet"] || "",
          "Exit Price": hasExitPrice
            ? parseFloat(backtestingResult["Final Exit Price"])
            : null,
          "P&L": hasExitPrice ? backtestingResult["Final P&L"] || "" : null,
          Reasoning: backtestingResult["Reasoning"] || "",
          SL: backtestingResult["SL"] || "",
          "Signal Generation Date":
            backtestingResult["Signal Generation Date"] || "",
          "Signal Type": backtestingResult["Signal Message"] || "",
          TP1: backtestingResult["TP1"] || "",
          TP2: backtestingResult["TP2"] || "",
        };
      }
    } else {
      // For signals already from the backtesting collection, add backtesting data in the expected format
      const isCompleted = signal.hasExited;

      signal.backtestingData = {
        "Coin ID": signal.coin || "",
        "Entry Price": signal.signal_data.currentPrice?.toString() || "",
        "Exit Price": isCompleted ? signal.signal_data.exitValue || null : null,
        "P&L": isCompleted ? signal.signal_data.exitPnL || "" : null,
        Reasoning: signal.signal_data.tradeTip || "",
        SL: signal.signal_data.stopLoss?.toString() || "",
        "Signal Generation Date": signal.generatedAt || "",
        "Signal Type": signal.signal_data.signal || "",
        TP1: signal.signal_data.targets?.[0]?.toString() || "",
        TP2: signal.signal_data.targets?.[1]?.toString() || "",
      };
    }

    return NextResponse.json({
      success: true,
      data: signal,
    });
  } catch (error) {
    console.error("Error fetching signal details:", error);
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
