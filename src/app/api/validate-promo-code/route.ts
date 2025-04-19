// src/app/api/validate-promo-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function POST(req: NextRequest) {
  const { promoCode } = await req.json();
  console.log("Received promo code:", promoCode);
  const client = await dbConnect();
  const db = client.db("ctxbt-signal-flow");
  const promoCodeDoc = await db.collection("promoCodes").findOne({
    promoCode,
    isActive: true,
  });

  if (promoCodeDoc) {

    // client.close();
    
    return NextResponse.json({
      valid: true,
      influencerId: promoCodeDoc.influencerId,
    });
  } else {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}