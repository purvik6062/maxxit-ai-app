import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri as string);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const influencerId = searchParams.get("influencerId");
    const skip = (page - 1) * limit;

    await client.connect();
    const database = client.db("backtesting_db");
    const collection = database.collection(
      "backtesting_results_with_reasoning"
    );

    const filter: any = {};
    if (influencerId) {
      filter["Twitter Account"] = influencerId;
    }

    const [signals, total] = await Promise.all([
      collection
        .find(filter)
        .skip(skip)
        .limit(limit)
        .project({
          _id: 1,
          "Token ID": 1,
          "Price at Tweet": 1,
          "Final Exit Price": 1,
          "Final P&L": 1,
          Reasoning: 1,
          SL: 1,
          "Signal Generation Date": 1,
          TP1: 1,
          TP2: 1,
          "IPFS Link": 1,
        })
        .toArray(),
      collection.countDocuments(filter),
    ]);

    const formattedSignals = signals.map((signal) => ({
      _id: signal._id.toString(),
      tokenId: signal["Token ID"],
      entryPrice: parseFloat(signal["Price at Tweet"]),
      exitPrice: signal["Final Exit Price"]
        ? parseFloat(signal["Final Exit Price"])
        : 0,
      pnl: signal["Final P&L"],
      reasoning: signal["Reasoning"],
      stopLoss: parseFloat(signal["SL"]),
      signalGenerationDate: signal["Signal Generation Date"],
      takeProfit1: parseFloat(signal["TP1"]),
      takeProfit2: parseFloat(signal["TP2"]),
      ipfsLink: signal["IPFS Link"],
    }));

    client.close();

    return NextResponse.json({
      signals: formattedSignals,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
