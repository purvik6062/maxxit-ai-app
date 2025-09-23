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
    const promoCode = url.searchParams.get("promoCode");

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: { message: "Missing promo code" } },
        { status: 400 }
      );
    }

    const connectStartMs = Date.now();
    const client = await dbConnect();
    const dbConnectMs = Date.now() - connectStartMs;
    const db = client.db("ctxbt-signal-flow");
    const promoCodesCollection = db.collection("promoCodes");
    const promoCodeUsagesCollection = db.collection("promoCodeUsages");

    // Verify that the promo code belongs to the authenticated user
    const verifyStartMs = Date.now();
    const promoCodeDoc = await promoCodesCollection.findOne(
      { promoCode },
      { projection: { _id: 0, promoCode: 1, influencerId: 1 } }
    );
    const verifyMs = Date.now() - verifyStartMs;
    if (!promoCodeDoc || promoCodeDoc.influencerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 403 }
      );
    }

    // Fetch usage data and count in parallel
    const usageFetchStartMs = Date.now();
    const [usages, totalUses] = await Promise.all([
      promoCodeUsagesCollection
        .find({ promoCode }, { projection: { _id: 0, appliedAt: 1, userId: 1, orderId: 1, discountApplied: 1 } })
        .sort({ appliedAt: -1 })
        .limit(50)
        .toArray(),
      promoCodeUsagesCollection.countDocuments({ promoCode }),
    ]);
    const usageFetchMs = Date.now() - usageFetchStartMs;

    const totalMs = Date.now() - handlerStartMs;
    console.log("[promo-code-usage] request completed", {
      promoCode,
      dbConnectMs,
      verifyMs,
      usageFetchMs,
      totalMs,
      totalUses,
      returned: usages.length,
    });

    return NextResponse.json({ success: true, data: usages, meta: { totalUses } }, { status: 200 });
  } catch (error) {
    console.error("Error fetching promo code usage:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
