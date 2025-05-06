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

    // Fetch all signals for all handles in a single query
    const allSignals = await collection.find({ 
      twitterHandle: { $in: handles } 
    }).toArray();
    
    // Group signals by handle
    const result: Record<string, { signals: number, tokens: number }> = {};
    
    // Create result structure with default values
    handles.forEach(handle => {
      result[handle] = { signals: 0, tokens: 0 };
    });
    
    // Group signals by handle for efficient processing
    const signalsByHandle: Record<string, any[]> = {};
    allSignals.forEach(signal => {
      if (!signalsByHandle[signal.twitterHandle]) {
        signalsByHandle[signal.twitterHandle] = [];
      }
      signalsByHandle[signal.twitterHandle].push(signal);
    });
    
    // Calculate signals and tokens for each handle
    Object.keys(signalsByHandle).forEach(handle => {
      const handleSignals = signalsByHandle[handle];
      const uniqueTokens = new Set(handleSignals.map(signal => signal.coin));
      result[handle] = {
        signals: handleSignals.length,
        tokens: uniqueTokens.size
      };
    });

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