import { NextResponse } from "next/server";
import dbConnect from '../../../utils/dbConnect';

export async function POST(request: Request) {
  try {
    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const collection = db.collection("trading-signals");

    const { handles } = await request.json();
    if (!handles || !Array.isArray(handles)) {
      return NextResponse.json(
        { error: "Invalid request: 'handles' array is required" },
        { status: 400 }
      );
    }

    const result: Record<string, { signals: number, tokens: number }> = {};
    for (const handle of handles) {
      const signalsData = await collection.find({ twitterHandle: handle }).toArray();
      const uniqueTokens = new Set(signalsData.map(signal => signal.coin));
      result[handle] = {
        signals: signalsData.length,
        tokens: uniqueTokens.size
      };
    }

    console.log("result", result);

    // client.close();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching signals and tokens data:", error);
    return NextResponse.json(
      { error: "Failed to fetch signals and tokens data" },
      { status: 500 }
    );
  }
} 