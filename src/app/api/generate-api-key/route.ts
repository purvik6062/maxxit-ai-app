import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import crypto from "crypto";
import dbConnect from "src/utils/dbConnect";

const SECRET_KEY = process.env.API_KEY_HASH_SECRET!;

export async function POST(request: Request): Promise<Response> {
  try {
    const { twitterId } = await request.json();
    if (!twitterId) {
      return NextResponse.json(
        { success: false, error: { message: "Twitter ID is required" } },
        { status: 400 }
      );
    }

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const apiKeysCollection = db.collection("apiKeys");
    const usersCollection = db.collection("users");

    // Check user's credits
    const user = await usersCollection.findOne({ twitterId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "User not found" } },
        { status: 404 }
      );
    }
    if (user.credits < 50) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Insufficient credits. Need at least 50 credits." },
        },
        { status: 403 }
      );
    }

    // Generate unique API key
    const timestamp = Date.now();
    const hash = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(`${twitterId}-${timestamp}`)
      .digest("hex");

    const apiKey = `maxxit_${timestamp}_${hash.substring(0, 24)}`;
    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year expiration
    // Store in MongoDB
    const result = await apiKeysCollection.findOneAndUpdate(
      { twitterId },
      {
        $set: {
          apiKey,
          expiresAt,
          createdAt,
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    // Deduct 50 credits after successful API key generation
    if (result?.apiKey) {
      await usersCollection.updateOne(
        { twitterId },
        { $inc: { credits: -50 } }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        apiKey: result?.apiKey,
        createdAt: result?.createdAt,
      },
    });
  } catch (error) {
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
