// src/app/api/validate-promo-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

export async function POST(req: NextRequest) {
  let client: MongoClient;
  try {
    const { promoCode } = await req.json();
    console.log("Received promo code:", promoCode);
    client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const promoCodeDoc = await db.collection("promoCodes").findOne({
      promoCode,
      isActive: true,
    });

    if (promoCodeDoc) {
      return NextResponse.json({
        valid: true,
        influencerId: promoCodeDoc.influencerId,
      });
    } else {
      return NextResponse.json({ valid: false }, { status: 400 });
    }
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate promo code" },
      { status: 500 }
    );
  }
}