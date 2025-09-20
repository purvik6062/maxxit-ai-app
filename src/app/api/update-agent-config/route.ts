import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeDbOperation } from "@/utils/dbConnect";

interface UpdateRequest {
  r_last6h_pct: number;
  d_pct_mktvol_6h: number;
  d_pct_socvol_6h: number;
  d_pct_sent_6h: number;
  d_pct_users_6h: number;
  d_pct_infl_6h: number;
  d_galaxy_6h: number;
  neg_d_altrank_6h: number;
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Parse and validate request body
    const body = await request.json();

    // Extract agentConfig from the request body
    const { twitterId, agentConfig } = body;

    if (!agentConfig || typeof agentConfig !== 'object') {
      return NextResponse.json(
        { success: false, error: { message: "Missing or invalid agentConfig" } },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields: (keyof UpdateRequest)[] = [
      'r_last6h_pct', 'd_pct_mktvol_6h', 'd_pct_socvol_6h',
      'd_pct_sent_6h', 'd_pct_users_6h', 'd_pct_infl_6h',
      'd_galaxy_6h', 'neg_d_altrank_6h'
    ];

    for (const field of requiredFields) {
      if (typeof agentConfig[field] !== 'number') {
        return NextResponse.json(
          { success: false, error: { message: `Invalid value for ${field}` } },
          { status: 400 }
        );
      }
    }

    // Validate ranges (all fields must be between 0 and 100)
    const { r_last6h_pct, d_pct_mktvol_6h, d_pct_socvol_6h, d_pct_sent_6h, d_pct_users_6h, d_pct_infl_6h, d_galaxy_6h, neg_d_altrank_6h } = agentConfig;

     if (r_last6h_pct < 0 || r_last6h_pct > 100) {
       return NextResponse.json(
         { success: false, error: { message: "Price momentum must be between 0 and 100" } },
         { status: 400 }
       );
     }

     if (d_pct_mktvol_6h < 0 || d_pct_mktvol_6h > 100) {
       return NextResponse.json(
         { success: false, error: { message: "Market volume must be between 0 and 100" } },
         { status: 400 }
       );
     }

     if (d_pct_socvol_6h < 0 || d_pct_socvol_6h > 100) {
       return NextResponse.json(
         { success: false, error: { message: "Social volume must be between 0 and 100" } },
         { status: 400 }
       );
     }

     if (d_pct_sent_6h < 0 || d_pct_sent_6h > 100) {
       return NextResponse.json(
         { success: false, error: { message: "Sentiment must be between 0 and 100" } },
         { status: 400 }
       );
     }

     if (d_pct_users_6h < 0 || d_pct_users_6h > 100) {
       return NextResponse.json(
         { success: false, error: { message: "User growth must be between 0 and 100" } },
         { status: 400 }
       );
     }

     if (d_pct_infl_6h < 0 || d_pct_infl_6h > 100) {
       return NextResponse.json(
         { success: false, error: { message: "Influencers must be between 0 and 100" } },
         { status: 400 }
       );
     }

     if (d_galaxy_6h < 0 || d_galaxy_6h > 100) {
       return NextResponse.json(
         { success: false, error: { message: "Heartbeat Score must be between 0 and 100" } },
         { status: 400 }
       );
     }

     if (neg_d_altrank_6h < 0 || neg_d_altrank_6h > 100) {
       return NextResponse.json(
         { success: false, error: { message: "Market Edge must be between 0 and 100" } },
         { status: 400 }
       );
     }

    // Get session and authenticate user
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Verify the twitterId matches the session
    if (session.user.id !== twitterId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized - Twitter ID mismatch" } },
        { status: 403 }
      );
    }

    // Use the safe database operation helper
    const result = await executeDbOperation(async (db) => {
      // Check if user exists
      const existingUser = await db.collection("users").findOne({
        twitterId: twitterId
      });

      if (!existingUser) {
        return NextResponse.json(
          { success: false, error: { message: "User not found" } },
          { status: 404 }
        );
      }

      // Update user with agent configuration
      const updateResult = await db.collection("users").updateOne(
        { twitterId: twitterId },
        {
          $set: {
            customizationOptions: {
              r_last6h_pct,
              d_pct_mktvol_6h,
              d_pct_socvol_6h,
              d_pct_sent_6h,
              d_pct_users_6h,
              d_pct_infl_6h,
              d_galaxy_6h,
              neg_d_altrank_6h
            },
            isAgentCustomized: true,
            updatedAt: new Date().toISOString()
          }
        }
      );

      return updateResult;
    });

    if (result instanceof NextResponse) {
      return result; // Return error response from the database operation
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Agent configuration updated successfully",
        customizationOptions: agentConfig
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