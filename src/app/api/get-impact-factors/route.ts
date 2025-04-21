import { NextResponse } from "next/server";
import dbConnect from '../../../utils/dbConnect';

export async function POST(request: Request) {
  try {
    const client = await dbConnect();
    const db = client.db("backtesting_db");
    const collection = db.collection("impact_factors");

    const { handles } = await request.json();
    if (!handles || !Array.isArray(handles)) {
      return NextResponse.json(
        { error: "Invalid request: 'handles' array is required" },
        { status: 400 }
      );
    }

    const result: Record<string, number> = {};
    for (const handle of handles) {
      const impactData = await collection.findOne({ account: handle });
      result[handle] = impactData ? Math.round(impactData.impactFactor * 10) / 10 : 0;
    }

    // client.close();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching impact factor data:", error);
    return NextResponse.json(
      { error: "Failed to fetch impact factor data" },
      { status: 500 }
    );
  }
} 