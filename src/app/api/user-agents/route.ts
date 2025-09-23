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
    const handlerStartMs = Date.now();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Use the safe database operation helper
    const userAgentData = await executeDbOperation(async (db, client) => {
      const aggStart = Date.now();
      const pipeline = [
        { $match: { twitterUsername: session.user.username } },
        {
          $project: {
            twitterUsername: 1,
            twitterId: 1,
            telegramId: 1,
            credits: 1,
            subscribedAccounts: 1,
            customizationOptions: 1,
            safeConfigs: 1,
          },
        },
        {
          $addFields: {
            subscribedHandles: {
              $map: { input: "$subscribedAccounts", as: "s", in: "$$s.twitterHandle" },
            },
          },
        },
        {
          $lookup: {
            from: "influencers",
            let: { handles: "$subscribedHandles" },
            pipeline: [
              { $match: { $expr: { $in: ["$twitterHandle", "$$handles"] } } },
              {
                $project: {
                  _id: 1,
                  twitterHandle: 1,
                  name: 1,
                  "userData.userProfileUrl": 1,
                  "userData.verified": 1,
                  "userData.publicMetrics.followers_count": 1,
                },
              },
            ],
            as: "influencers",
          },
        },
        {
          $addFields: {
            subscribedAccounts: {
              $map: {
                input: "$subscribedAccounts",
                as: "sub",
                in: {
                  $mergeObjects: [
                    "$$sub",
                    {
                      influencerInfo: {
                        $let: {
                          vars: {
                            match: {
                              $first: {
                                $filter: {
                                  input: "$influencers",
                                  as: "inf",
                                  cond: { $eq: ["$$inf.twitterHandle", "$$sub.twitterHandle"] },
                                },
                              },
                            },
                          },
                          in: {
                            $cond: [
                              { $ifNull: ["$$match", false] },
                              {
                                _id: "$$match._id",
                                twitterHandle: "$$match.twitterHandle",
                                name: "$$match.name",
                                userProfileUrl: "$$match.userData.userProfileUrl",
                                verified: "$$match.userData.verified",
                                followersCount: "$$match.userData.publicMetrics.followers_count",
                              },
                              null,
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        { $project: { influencers: 0, subscribedHandles: 0 } },
      ];

      const users = await db.collection("users").aggregate(pipeline).toArray();
      if (users.length === 0) {
        throw new Error("User not found");
      }
      const user = users[0] as any;
      const aggMs = Date.now() - aggStart;
      console.log("[user-agents] aggregation completed", { aggMs, hasSubs: (user.subscribedAccounts || []).length });

      const result: UserAgentData = {
        _id: user._id.toString(),
        twitterUsername: user.twitterUsername,
        twitterId: user.twitterId,
        telegramId: user.telegramId,
        credits: user.credits,
        subscribedAccounts: (user.subscribedAccounts || []).map((sub: any) => ({
          twitterHandle: sub.twitterHandle,
          subscriptionDate: sub.subscriptionDate,
          expiryDate: sub.expiryDate,
          costPaid: sub.costPaid,
          influencerInfo: sub.influencerInfo || null,
        })),
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
        safeConfigs: user.safeConfigs || [],
      };

      return result;
    });

    const totalMs = Date.now() - handlerStartMs;
    console.log("[user-agents] request completed", {
      totalMs,
      hasData: !!userAgentData,
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