import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function GET(request, { params }) {
  const { id } = await params;

  const client = await dbConnect();
  try {
    const db = client.db("ctxbt-signal-flow");

    const influencer = await db
      .collection("influencers")
      .findOne({ twitterHandle: id });

    if (!influencer) {
      return NextResponse.json(
        { error: "Influencer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(influencer);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch influencer" },
      { status: 500 }
    );
  }finally {
    if (client) {
      await client.close();
    }
  }
}
