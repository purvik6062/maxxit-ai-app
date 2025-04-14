import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dbConnect from "src/utils/dbConnect";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "ctxbt-signal-flow";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const twitterId = searchParams.get("twitterId");

    if (!twitterId) {
      return NextResponse.json(
        { success: false, error: { message: "Twitter ID is required" } },
        { status: 400 }
      );
    }

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const apiKeysCollection = db.collection("apiKeys");

    const apiKeyDoc = await apiKeysCollection.findOne({ twitterId });

    if (!apiKeyDoc) {
      return NextResponse.json(
        { success: false, error: { message: "API key not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        apiKey: apiKeyDoc.apiKey,
        createdAt: apiKeyDoc.createdAt,
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
