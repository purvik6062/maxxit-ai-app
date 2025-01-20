import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const client = await dbConnect();
    const db = client.db("leaderboard-data");

    const leaderboard = await db
      .collection("impact-factor")
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection("impact-factor").countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: leaderboard.map((entry) => ({
          _id: entry._id,
          id: entry.id,
          handle: entry.handle,
          name: entry.name,
          impactFactor: entry.impactFactor,
        })),
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
