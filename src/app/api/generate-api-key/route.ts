import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "ctxbt-signal-flow";
const SECRET_KEY = process.env.API_KEY_HASH_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection("api-keys");

    // **Added: Check user's credits**
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ walletAddress: address });
    if (!user) {
      await client.close();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.credits < 50) {
      await client.close();
      return NextResponse.json(
        { error: "Insufficient credits. Need at least 50 credits." },
        { status: 403 }
      );
    }

    // Generate unique API key
    const timestamp = Date.now();
    const hash = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(`${address}-${timestamp}`)
      .digest("hex");

    const apiKey = `ctxbt_${timestamp}_${hash.substring(0, 24)}`;
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year expiration

    // Store in MongoDB
    const result = await collection.findOneAndUpdate(
      { walletAddress: address },
      {
        $set: {
          apiKey,
          expiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    console.log("API key generated:", result);
    // **Added: Deduct 50 credits after successful API key generation**
    if (result?.apiKey) {
      await usersCollection.updateOne(
        { walletAddress: address },
        { $inc: { credits: -50 } }
      );
    }

    await client.close();
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Failed to generate API key" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: true, apiKey: result.value?.apiKey },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating API key:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
