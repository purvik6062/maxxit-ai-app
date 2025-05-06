import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

export async function POST(request: Request): Promise<Response> {
  let client: MongoClient;
  try {
    const { handles } = await request.json();

    if (!handles || !Array.isArray(handles)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid or missing handles array" } },
        { status: 400 }
      );
    }

    // Explicitly connect to the database
    client = await dbConnect();
    
    const db = client.db("ctxbt-signal-flow");
    const heartbeatCollection = db.collection("heartbeat");

    // Fetch heartbeat data for the provided handles
    const heartbeatData = await heartbeatCollection
      .find({ twitterHandle: { $in: handles } })
      .toArray();

    // Initialize result with default values for all handles
    const result: Record<string, number> = {};
    handles.forEach(handle => {
      result[handle] = 0; // Default value
    });

    // Map the data to a simple object with handle as key and score as value
    heartbeatData.forEach(doc => {
      // Scale the score to 0-100 range (assuming max raw score is 1000 for simplicity)
      // Adjust the max value based on actual data if needed
      const scaledScore = Math.min(Math.max((doc.score / 1000) * 100, 0), 100);
      result[doc.twitterHandle] = parseFloat(scaledScore.toFixed(1)); // Round to 1 decimal
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching heartbeat data:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
} 