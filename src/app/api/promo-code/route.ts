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

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const promoCodesCollection = db.collection("promoCodes");

    const promoCode = await promoCodesCollection.findOne({
      influencerId: twitterId,
    });

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: { message: "Promo code not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: promoCode },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching promo code:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
