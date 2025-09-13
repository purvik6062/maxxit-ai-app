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

interface UserAgentData {
  _id: string;
  twitterUsername: string;
  twitterId: string;
  telegramId: string;
  credits: number;
  subscribedAccounts: Array<{
    twitterHandle: string;
    subscriptionDate: string;
    expiryDate: string;
    costPaid: number;
    influencerInfo?: {
      _id: string;
      twitterHandle: string;
      name: string;
      userProfileUrl: string;
      verified: boolean;
      followersCount: number;
    } | null;
  }>;
  customizationOptions: {
    r_last6h_pct: number;
    d_pct_mktvol_6h: number;
    d_pct_socvol_6h: number;
    d_pct_sent_6h: number;
    d_pct_users_6h: number;
    d_pct_infl_6h: number;
    d_galaxy_6h: number;
    neg_d_altrank_6h: number;
  };
  safeConfigs: SafeConfig[];
}

interface InfluencerData {
  _id: string;
  twitterHandle: string;
  name: string;
  userData: {
    userProfileUrl: string;
    verified: boolean;
    publicMetrics: {
      followers_count: number;
    };
  };
}

export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Use the safe database operation helper
    const userAgentData = await executeDbOperation(async (db, client) => {
      // Get user data
      const user = await db.collection("users").findOne({
        twitterUsername: session.user.username
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Get influencer data for subscribed accounts
      const subscribedHandles = user.subscribedAccounts?.map((sub: any) => sub.twitterHandle) || [];
      const influencers = await db.collection("influencers")
        .find({ twitterHandle: { $in: subscribedHandles } })
        .toArray();

      // Create a map for quick lookup
      const influencerMap = new Map();
      influencers.forEach((influencer: any) => {
        influencerMap.set(influencer.twitterHandle, {
          _id: influencer._id,
          twitterHandle: influencer.twitterHandle,
          name: influencer.name,
          userProfileUrl: influencer.userData?.userProfileUrl,
          verified: influencer.userData?.verified,
          followersCount: influencer.userData?.publicMetrics?.followers_count
        });
      });

      // Transform user data with influencer information
      const result: UserAgentData = {
        _id: user._id.toString(),
        twitterUsername: user.twitterUsername,
        twitterId: user.twitterId,
        telegramId: user.telegramId,
        credits: user.credits,
        subscribedAccounts: user.subscribedAccounts?.map((sub: any) => ({
          twitterHandle: sub.twitterHandle,
          subscriptionDate: sub.subscriptionDate,
          expiryDate: sub.expiryDate,
          costPaid: sub.costPaid,
          influencerInfo: influencerMap.get(sub.twitterHandle) || null
        })) || [],
        customizationOptions: user.customizationOptions || {
          r_last6h_pct: 0,
          d_pct_mktvol_6h: 0,
          d_pct_socvol_6h: 0,
          d_pct_sent_6h: 0,
          d_pct_users_6h: 0,
          d_pct_infl_6h: 0,
          d_galaxy_6h: 0,
          neg_d_altrank_6h: 0,
        },
        safeConfigs: user.safeConfigs || []
      };

      return result;
    });

    return NextResponse.json({
      success: true,
      data: userAgentData
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