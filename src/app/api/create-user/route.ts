import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function POST(request: Request): Promise<Response> {
  try {
    const { walletAddress, telegramId, credits } = await request.json();

    // Validate required fields
    if (!walletAddress || !telegramId) {
      return NextResponse.json(
        { success: false, error: { message: "Missing required fields" } },
        { status: 400 }
      );
    }

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [
        { walletAddress: walletAddress },
        { telegramId: telegramId }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { message: "User already exists" } },
        { status: 409 }
      );
    }

    // Create new user
    const now = new Date();
    const newUser = {
      walletAddress,
      telegramId,
      credits,
      subscribedAccounts: [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        ...newUser,
      },
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
} 