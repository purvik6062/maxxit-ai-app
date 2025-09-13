import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

export async function POST(request: Request): Promise<Response> {
  let client: MongoClient;
  try {
    const { twitterUsername, twitterId, telegramId, credits, customizationOptions } = await request.json();

    // Validate required fields
    if (!twitterUsername || !telegramId || !twitterId) {
      return NextResponse.json(
        { success: false, error: { message: "Missing required fields" } },
        { status: 400 }
      );
    }

    client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");

    // Verify Telegram user by querying welcomed_users collection
    let chatId: number | null = null;
    let telegramUserId: number | null = null;
    
    try {
      const cleanUsername = telegramId.replace("@", "").toLowerCase();

      const welcomedUser = await db.collection("welcomed_users").findOne({
        username: cleanUsername
      });

      if (!welcomedUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                "Please start a chat with our bot first and send the 'start' message. Check step 1 & 2 in the instructions.",
            },
          },
          { status: 404 }
        );
      }

      // Extract user ID and chat ID from the welcomed user document
      telegramUserId = welcomedUser.user_id;
      chatId = telegramUserId; 
      
      console.log(`User verified: ${cleanUsername} (ID: ${telegramUserId})`);
    } catch (error) {
      console.error("Database verification error:", error);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error instanceof Error ? error.message : "Failed to verify Telegram user. Please try again.",
          },
        },
        { status: 500 }
      );
    }

    const usersCollection = db.collection("users");
    const transactionsCollection = db.collection("transactions");

    // Check existing users
    const existingUser = await usersCollection.findOne({
      $or: [{ twitterUsername }, { twitterId }, { telegramId }, { chatId }],
    });

    if (existingUser) {
      let errorMessage = "User already exists";
      if (existingUser.telegramId === telegramId)
        errorMessage = "Telegram username already registered";
      if (existingUser.twitterUsername === twitterUsername)
        errorMessage = "Twitter username already registered";
      if (existingUser.twitterId === twitterId)
        errorMessage = "Twitter account already linked to another user";
      if (existingUser.chatId === chatId)
        errorMessage = "Telegram account already linked to another user";

      return NextResponse.json(
        { success: false, error: { message: errorMessage } },
        { status: 409 }
      );
    }

    // Create new user
    const now = new Date();
    const initialCredits = credits || 100;
    const newUser = {
      twitterUsername,
      twitterId,
      telegramId,
      telegramUserId, // Store the actual Telegram user ID from welcomed_users
      chatId,
      credits: initialCredits,
      subscribedAccounts: [],
      customizationOptions: customizationOptions || {
        r_last6h_pct: 0,
        d_pct_mktvol_6h: 0,
        d_pct_socvol_6h: 0,
        d_pct_sent_6h: 0,
        d_pct_users_6h: 0,
        d_pct_infl_6h: 0,
        d_galaxy_6h: 0,
        neg_d_altrank_6h: 0,
      },
      createdAt: now,
      updatedAt: now,
      verified: true, // Mark as verified since we confirmed user exists in welcomed_users
    };

    // Start a session for transaction
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // Insert the new user
        const result = await usersCollection.insertOne(newUser, { session });
        
        // Log the initial credit grant as a transaction
        await transactionsCollection.insertOne({
          userId: result.insertedId,
          twitterId: twitterId,
          twitterUsername: twitterUsername,
          type: "CREDIT_GRANT",
          amount: initialCredits,
          description: "Initial signup bonus credits",
          timestamp: now
        }, { session });
      });
      
      return NextResponse.json({
        success: true,
        data: {
          ...newUser,
        },
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      },
      { status: 500 }
    );
  }
}