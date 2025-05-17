import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import dbConnect from "src/utils/dbConnect";

export async function GET(req: Request) {
  try {
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

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const promoCodesCollection = db.collection("promoCodes");
    const promoCodeUsagesCollection = db.collection("promoCodeUsages");

    // Verify that the promo code belongs to the authenticated user
    const promoCodeDoc = await promoCodesCollection.findOne({ promoCode });
    if (!promoCodeDoc || promoCodeDoc.influencerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 403 }
      );
    }

    // Fetch usage data
    const usages = await promoCodeUsagesCollection
      .find({ promoCode })
      .sort({ appliedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ success: true, data: usages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching promo code usage:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
