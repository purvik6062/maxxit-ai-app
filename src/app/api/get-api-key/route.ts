import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "ctxbt-signal-flow";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection("api-keys");

    const apiKeyData = await collection.findOne({ walletAddress });

    await client.close();

    if (!apiKeyData) {
      return NextResponse.json(
        { success: false, error: "API key not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        apiKey: apiKeyData.apiKey,
        expiresAt: apiKeyData.expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching API key:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
