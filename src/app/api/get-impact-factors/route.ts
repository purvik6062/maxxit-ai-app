import { NextResponse } from "next/server";
import dbConnect from '../../../utils/dbConnect';
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  let client: MongoClient;
  try {
    client = await dbConnect();
    const db = client.db("backtesting_db");
    const collection = db.collection("impact_factors");

    const { handles } = await request.json();
    if (!handles || !Array.isArray(handles)) {
      return NextResponse.json(
        { error: "Invalid request: 'handles' array is required" },
        { status: 400 }
      );
    }

    // Fetch all impact factors in a single query
    const impactFactorsData = await collection.find({ 
      account: { $in: handles } 
    }).toArray();
    
    // Create a lookup map for faster access
    const impactFactorMap = impactFactorsData.reduce((acc, data) => {
      acc[data.account] = Math.round(data.impactFactor * 10) / 10;
      return acc;
    }, {} as Record<string, number>);
    
    // Generate the result object, defaulting to 0 for handles without data
    const result: Record<string, number> = {};
    for (const handle of handles) {
      result[handle] = impactFactorMap[handle] || 0;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching impact factor data:", error);
    return NextResponse.json(
      { error: "Failed to fetch impact factor data" },
      { status: 500 }
    );
  }
} 