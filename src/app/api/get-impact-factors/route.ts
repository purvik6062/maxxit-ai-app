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

    const query = { account: { $in: handles } };
    const impactData = await collection.find(query).toArray();
    
    const impactMap = impactData.reduce((acc, item) => {
      acc[item.account] = Math.round(item.impactFactor * 10) / 10;
      return acc;
    }, {});
    
    const result: Record<string, number> = {};
    for (const handle of handles) {
      result[handle] = impactMap[handle] || 0;
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