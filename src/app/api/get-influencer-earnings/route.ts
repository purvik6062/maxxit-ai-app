// src/app/api/get-influencer-earnings/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const influencerId = searchParams.get("influencerId");

  if (!influencerId) {
    return NextResponse.json(
      { error: "Missing influencerId" },
      { status: 400 }
    );
  }

  const client = await dbConnect();
  const db = client.db("ctxbt-signal-flow");
  const promoCodeDoc = await db.collection("promoCodes").findOne({
    influencerId: new ObjectId(influencerId),
  });

  if (!promoCodeDoc) {
    return NextResponse.json(
      { error: "No promo code found for influencer" },
      { status: 404 }
    );
  }

  const earnings = await db.collection("influencerEarnings").findOne({
    influencerId: new ObjectId(influencerId),
  });

  const claimableUSD = earnings ? earnings.availableEarnings : 0;
  const usageCount = await db.collection("promoCodeUsages").countDocuments({
    promoCodeId: promoCodeDoc._id,
  });

  return NextResponse.json({ claimableUSD, usageCount });
}