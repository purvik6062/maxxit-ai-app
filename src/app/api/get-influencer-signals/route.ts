import { NextResponse } from "next/server";
import dbConnect from "../../../utils/dbConnect";
import { MongoClient } from "mongodb";

export async function GET(request: Request): Promise<Response> {
  let client: MongoClient;
  try {
    const { searchParams } = new URL(request.url);
    const twitterAccount = searchParams.get("twitterAccount");
    console.log("twitterAccount:::::", twitterAccount);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const filterType = searchParams.get("filterType") || "all";

    // Validate inputs
    if (!twitterAccount) {
      return NextResponse.json(
        { success: false, error: { message: "Twitter account is required" } },
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
    const db = client.db("backtesting_db");
    const collection = db.collection("trading_signals_backtesting");

    // Build the filter based on parameters
    const filter: any = { "Twitter Account": twitterAccount };

    // Apply additional filtering based on filterType
    if (filterType !== "all") {
      if (filterType === "completed") {
        filter.backtesting_done = true;
        filter["Final Exit Price"] = { $exists: true, $ne: null };
      } else if (
        filterType === "buy" ||
        filterType === "sell" ||
        filterType === "hold"
      ) {
        // Case-insensitive filter for signal type
        filter["Signal Message"] = new RegExp(`^${filterType}$`, "i");
      }
    }

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalSignals = await collection.countDocuments(filter);
    const totalPages = Math.ceil(totalSignals / limit);

    // Get the signals with pagination
    const signals = await collection
      .find(filter)
      .sort({ "Signal Generation Date": -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .toArray();

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
    console.error("Error fetching influencer signals:", error);
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
