import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import dbConnect from "src/utils/dbConnect";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    // Authenticate the request
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { twitterId, twitterUsername } = await req.json();

    if (!twitterId || !twitterUsername) {
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

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const promoCodesCollection = db.collection("promoCodes");

    // Check if user already has a promo code
    const existingPromoCode = await promoCodesCollection.findOne({
      influencerId: twitterId,
    });
    if (existingPromoCode) {
      return NextResponse.json(
        { success: true, data: existingPromoCode },
        { status: 200 }
      );
    }

    // Generate promo code from Twitter username + '10'
    const promoCode = `${twitterUsername.toUpperCase()}10`;

    // Create new promo code document
    const promoCodeDoc = {
      influencerName: twitterUsername,
      promoCode,
      influencerId: twitterId,
      discountPercentage: 50,
      maxDiscount: 10,
      influencerEarningPercentage: 10,
      createdAt: new Date(),
      isActive: true,
    };

    const result = await promoCodesCollection.insertOne(promoCodeDoc);

    return NextResponse.json(
      { success: true, data: promoCodeDoc },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating promo code:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
