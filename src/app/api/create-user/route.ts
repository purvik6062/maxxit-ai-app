import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function POST(request: Request): Promise<Response> {
  try {
    const { walletAddress, telegramId, credits, retweetVerified } = await request.json();

    // Validate required fields
    if (!walletAddress || !telegramId) {
      return NextResponse.json(
        { success: false, error: { message: "Missing required fields" } },
        { status: 400 }
      );
    }

    // Check if retweet is verified
    if (!retweetVerified) {
      return NextResponse.json(
        { success: false, error: { message: "Twitter retweet verification is required" } },
        { status: 400 }
      );
    }

    // Verify Telegram chat with the bot
    let chatId: number | null = null;
    try {
      const cleanUsername = telegramId.replace("@", "").toLowerCase();
      const updatesResponse = await fetch(`${TELEGRAM_API}/getUpdates`);
      const updatesData = await updatesResponse.json();

      if (!updatesData.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                "Failed to verify Telegram connection. Please try again later.",
            },
          },
          { status: 500 }
        );
      }

      // Find the user's chat with the bot
      const userChat = updatesData.result.find(
        (update: any) =>
          update.message?.from?.username?.toLowerCase() === cleanUsername ||
          update.message?.chat?.username?.toLowerCase() === cleanUsername
      );

      if (!userChat) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                "Please start a chat with our bot first and send a message. Check step 1 & 2 in the instructions.",
            },
          },
          { status: 404 }
        );
      }

      chatId = userChat.message.chat.id;
    } catch (error) {
      console.error("Telegram verification error:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Failed to verify Telegram connection. Please try again.",
          },
        },
        { status: 500 }
      );
    }

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const usersCollection = db.collection("users");

    // Check existing users
    const existingUser = await usersCollection.findOne({
      $or: [{ walletAddress }, { telegramId }, { chatId }],
    });

    if (existingUser) {
      let errorMessage = "User already exists";
      if (existingUser.telegramId === telegramId)
        errorMessage = "Telegram username already registered";
      if (existingUser.walletAddress === walletAddress)
        errorMessage = "Wallet address already registered";
      if (existingUser.chatId === chatId)
        errorMessage = "Telegram account already linked to another user";

      return NextResponse.json(
        { success: false, error: { message: errorMessage } },
        { status: 409 }
      );
    }

    // Create new user
    const now = new Date();
    const newUser = {
      walletAddress,
      telegramId,
      chatId,
      credits: credits || 100,
      subscribedAccounts: [],
      createdAt: now,
      updatedAt: now,
      verified: true, // Mark as verified since we confirmed chat exists
      twitterVerified: true, // Mark Twitter verification as complete
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
