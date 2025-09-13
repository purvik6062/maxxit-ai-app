import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect, { executeDbOperation } from "@/utils/dbConnect";

interface SafeConfig {
  safeAddress: string;
  type: 'perpetuals' | 'spot';
  networkKey: string;
  createdAt: string;
  isFunded: boolean;
  agentId: string;
}

interface UpdateRequest {
  safeAddress: string;
  type: 'perpetuals' | 'spot';
  networkKey: string;
  agentId: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Parse and validate request body
    const body = await request.json();

    // Validate required fields
    const requiredFields: (keyof UpdateRequest)[] = ['safeAddress', 'type', 'networkKey', 'agentId'];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: { message: `Missing required field: ${field}` } },
          { status: 400 }
        );
      }
    }

    // Validate type
    if (body.type !== 'perpetuals' && body.type !== 'spot') {
      return NextResponse.json(
        { success: false, error: { message: "Type must be either 'perpetuals' or 'spot'" } },
        { status: 400 }
      );
    }

    const { safeAddress, type, networkKey, agentId } = body;

    // Get session and authenticate user
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Use the safe database operation helper
    const result = await executeDbOperation(async (db) => {
      // Check if safe config already exists for this user and type
      const existingUser = await db.collection("users").findOne({
        twitterUsername: session.user.username
      });

      const newSafeConfig: SafeConfig = {
        safeAddress,
        type,
        networkKey,
        createdAt: new Date().toISOString(),
        isFunded: false,
        agentId
      };

      let updateResult;

      if (existingUser) {
        // Check if user already has safeConfigs array
        const existingSafeConfigs = existingUser.safeConfigs || [];
        const existingConfigIndex = existingSafeConfigs.findIndex(
          (config: any) => config.type === type && config.agentId === agentId
        );

        let updatedSafeConfigs;
        if (existingConfigIndex >= 0) {
          // Update existing config
          updatedSafeConfigs = [...existingSafeConfigs];
          updatedSafeConfigs[existingConfigIndex] = newSafeConfig;
        } else {
          // Add new config
          updatedSafeConfigs = [...existingSafeConfigs, newSafeConfig];
        }

        updateResult = await db.collection("users").updateOne(
          { twitterUsername: session.user.username },
          {
            $set: {
              safeConfigs: updatedSafeConfigs,
              updatedAt: new Date().toISOString()
            }
          }
        );
      } else {
        // Create new user document with safe config
        updateResult = await db.collection("users").insertOne({
          twitterUsername: session.user.username,
          twitterId: session.user.id,
          safeConfigs: [newSafeConfig],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      return updateResult;
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Safe configuration updated successfully",
        safeAddress,
        type,
        networkKey
      }
    });

  } catch (error) {
    console.error("Server error:", error);

    // Handle specific error types
    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("User not found")) {
        errorMessage = "User not found";
        statusCode = 404;
      } else if (error.message.includes("MongoNotConnectedError") ||
                 error.message.includes("Failed to connect to MongoDB")) {
        errorMessage = "Database connection error. Please try again later.";
        statusCode = 503; // Service Unavailable
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: errorMessage,
          retryable: statusCode === 503
        },
      },
      { status: statusCode }
    );
  }
}