import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import dbConnect from "src/utils/dbConnect";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const handlerStartMs = Date.now();
    // Authenticate the request
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { twitterId, twitterUsername } = await req.json();

    if (!twitterId) {
      return NextResponse.json(
        { success: false, error: { message: "Missing required parameters" } },
        { status: 400 }
      );
    }

    if (twitterId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 403 }
      );
    }

    const connectStartMs = Date.now();
    const client = await dbConnect();
    const dbConnectMs = Date.now() - connectStartMs;
    const db = client.db("ctxbt-signal-flow");
    const promoCodesCollection = db.collection("promoCodes");

    // Determine username from session if not provided in body
    const sessionUsername = session.user.username;
    const finalUsername = (twitterUsername || sessionUsername || "").toString();
    if (!finalUsername) {
      return NextResponse.json(
        { success: false, error: { message: "Missing twitter username on session" } },
        { status: 400 }
      );
    }

    // Generate promo code from username + '10'
    const baseCode = `${finalUsername.toUpperCase()}10`;

    // Upsert idempotently: if exists return it; else create it
    const upsertStartMs = Date.now();
    const upsertResult = await promoCodesCollection.findOneAndUpdate(
      { influencerId: twitterId },
      {
        $setOnInsert: {
          influencerName: finalUsername,
          promoCode: baseCode,
          influencerId: twitterId,
          discountPercentage: 50,
          maxDiscount: 10,
          influencerEarningPercentage: 10,
          createdAt: new Date(),
          isActive: true,
        },
      },
      { upsert: true, returnDocument: "after", projection: { _id: 0, promoCode: 1, influencerId: 1 } }
    );
    const upsertMs = Date.now() - upsertStartMs;

    const totalMs = Date.now() - handlerStartMs;
    console.log("[generate-promo-code] upsert", {
      twitterId,
      dbConnectMs,
      upsertMs,
      totalMs,
    });

    if (!upsertResult || !upsertResult.value) {
      return NextResponse.json(
        { success: false, error: { message: "Failed to generate or retrieve promo code" } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: upsertResult.value }, { status: 201 });
  } catch (error) {
    console.error("Error generating promo code:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
