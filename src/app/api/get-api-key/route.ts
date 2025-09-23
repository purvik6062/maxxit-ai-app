import { NextRequest, NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

export async function GET(request: Request): Promise<Response> {
  let client: MongoClient;
  try {
    const handlerStartMs = Date.now();
    const { searchParams } = new URL(request.url);
    const twitterId = searchParams.get("twitterId");

    if (!twitterId) {
      return NextResponse.json(
        { success: false, error: { message: "Twitter ID is required" } },
        { status: 400 }
      );
    }

    const connectStartMs = Date.now();
    client = await dbConnect();
    const dbConnectMs = Date.now() - connectStartMs;
    const db = client.db("ctxbt-signal-flow");
    const apiKeysCollection = db.collection("apiKeys");

    const findStartMs = Date.now();
    const apiKeyDoc = await apiKeysCollection.findOne(
      { twitterId },
      { projection: { _id: 0, apiKey: 1, createdAt: 1 } }
    );
    const findMs = Date.now() - findStartMs;

    if (!apiKeyDoc) {
      return NextResponse.json(
        { success: false, error: { message: "API key not found" } },
        { status: 404 }
      );
    }

    const totalMs = Date.now() - handlerStartMs;
    console.log("[get-api-key] request completed", {
      twitterId,
      dbConnectMs,
      findMs,
      totalMs,
    });

    return NextResponse.json({
      success: true,
      data: {
        apiKey: apiKeyDoc.apiKey,
        createdAt: apiKeyDoc.createdAt,
      },
    });
  } catch (error) {
    console.error("[get-api-key] error", {
      error: error instanceof Error ? error.message : String(error),
    });
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