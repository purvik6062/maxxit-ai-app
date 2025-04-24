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

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of matching signals
    const totalSignals = await tradingSignalsCollection.countDocuments({
      subscribers: {
        $elemMatch: {
          username: telegramId,
        },
      },
    });

    // Fetch paginated signals
    const signals = await tradingSignalsCollection
      .find({
        subscribers: {
          $elemMatch: {
            username: telegramId,
          },
        },
      })
      .sort({ generatedAt: -1 }) // Sort by date descending (newest first)
      .skip(skip)
      .limit(limit)
      .toArray();

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
