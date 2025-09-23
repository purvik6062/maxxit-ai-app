import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import dbConnect from "src/utils/dbConnect";

export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const twitterId = url.searchParams.get("twitterId");

    if (!twitterId) {
      return NextResponse.json(
        { success: false, error: { message: "Missing Twitter ID" } },
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

    const findStartMs = Date.now();
    const promoCode = await promoCodesCollection.findOne(
      { influencerId: twitterId },
      { projection: { _id: 0, promoCode: 1, influencerId: 1, isActive: 1 } }
    );
    const findMs = Date.now() - findStartMs;

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: { message: "Promo code not found" } },
        { status: 404 }
      );
    }

    const totalMs = Date.now() - handlerStartMs;
    console.log("[promo-code] request completed", {
      twitterId,
      dbConnectMs,
      findMs,
      totalMs,
      hasPromoCode: !!promoCode,
    });

    return NextResponse.json({ success: true, data: promoCode }, { status: 200 });
  } catch (error) {
    console.error("Error fetching promo code:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
