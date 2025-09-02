import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

// POST: upsert preferences inside userInfo.preferences for a given wallet/safe
export async function POST(request: Request): Promise<Response> {
  let client: MongoClient | null = null;
  try {
    const body = await request.json();
    const {
      walletAddress,
      networkKey,
      safeAddress,
      tradingType,
      selectedTokens,
    } = body || {};

    if (
      !walletAddress ||
      !safeAddress ||
      !tradingType ||
      !Array.isArray(selectedTokens)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "walletAddress, safeAddress, tradingType, selectedTokens are required",
          },
        },
        { status: 400 }
      );
    }

    client = await dbConnect();
    const db = client.db("safe-deployment-service");
    const safes = db.collection("safes");

    // Build OR conditions safely with computed keys
    const orConditions: any[] = [
      { "config.owners": walletAddress },
      { "userInfo.walletAddress": walletAddress },
    ];

    if (networkKey) {
      orConditions.push({ [`deployments.${networkKey}.address`]: safeAddress });
    }

    const query: any = { $or: orConditions };

    const update = {
      $set: {
        "userInfo.walletAddress": walletAddress,
        "userInfo.preferences.tradingType": tradingType,
        "userInfo.preferences.selectedTokens": selectedTokens,
        ...(networkKey
          ? { "userInfo.preferences.networkKey": networkKey }
          : {}),
        "userInfo.preferences.safeAddress": safeAddress,
        updatedAt: new Date(),
      },
    };

    const options = { upsert: true };
    const result = await safes.updateOne(query, update, options);

    return NextResponse.json({
      success: true,
      data: {
        matchedCount: result.matchedCount,
        upsertedId: result.upsertedId,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error?.message || "Failed to save preferences" },
      },
      { status: 500 }
    );
  }
}

// GET: fetch preferences by walletAddress
export async function GET(request: Request): Promise<Response> {
  let client: MongoClient | null = null;
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: { message: "walletAddress is required" } },
        { status: 400 }
      );
    }

    client = await dbConnect();
    const db = client.db("safe-deployment-service");
    const safes = db.collection("safes");

    const doc = await safes.findOne(
      {
        $or: [
          { "userInfo.walletAddress": walletAddress },
          { "config.owners": walletAddress },
        ],
      },
      { projection: { userInfo: 1, deployments: 1, config: 1 } }
    );

    if (!doc) {
      return NextResponse.json(
        { success: false, error: { message: "Not found" } },
        { status: 404 }
      );
    }

    const preferences = doc?.userInfo?.preferences || null;
    return NextResponse.json({
      success: true,
      data: {
        preferences,
        safe: { deployments: doc.deployments, config: doc.config },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error?.message || "Failed to fetch preferences" },
      },
      { status: 500 }
    );
  }
}
