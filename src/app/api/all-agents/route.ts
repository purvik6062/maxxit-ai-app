import { NextResponse } from "next/server";
import { executeDbOperation } from "@/utils/dbConnect";

interface AgentData {
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
  createdAt: string;
  updatedAt: string;
}

interface MetricExplanation {
  label: string;
  description: string;
  category: 'technical' | 'social' | 'fundamental';
  range: string;
  impact: 'high' | 'medium' | 'low';
}

export async function GET(): Promise<Response> {
  try {
    const handlerStartMs = Date.now();
    // Use the safe database operation helper
    const result = await executeDbOperation(async (db) => {
      const aggStart = Date.now();
      const pipeline = [
        { $match: { customizationOptions: { $exists: true, $ne: null } } },
        {
          $project: {
            twitterUsername: 1,
            twitterId: 1,
            telegramId: 1,
            credits: 1,
            subscribedAccounts: 1,
            customizationOptions: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { updatedAt: -1 } },
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

      const agents = (await db.collection("users").aggregate(pipeline).toArray()) as any[];
      const aggMs = Date.now() - aggStart;
      console.log("[all-agents] aggregation completed", { count: agents.length, aggMs });
      const transformed: AgentData[] = agents.map((user: any) => ({
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
        customizationOptions: user.customizationOptions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
      return transformed;
    });

    // Metric explanations for the UI
    const metricExplanations: Record<string, MetricExplanation> = {
      r_last6h_pct: {
        label: "Price Momentum",
        description: "6-hour price return threshold. Triggers signals when price moves by this percentage.",
        category: "technical",
        range: "-100% to +100%",
        impact: "high"
      },
      d_pct_mktvol_6h: {
        label: "Market Volume",
        description: "Trading volume change over 6 hours. Higher values emphasize volume-based signals.",
        category: "technical",
        range: "-100% to +100%",
        impact: "high"
      },
      d_pct_socvol_6h: {
        label: "Social Volume",
        description: "Social media mentions weight. Focuses on community buzz and discussion volume.",
        category: "social",
        range: "-100% to +100%",
        impact: "medium"
      },
      d_pct_sent_6h: {
        label: "Sentiment",
        description: "Market sentiment analysis weight. Considers bullish/bearish sentiment in discussions.",
        category: "social",
        range: "-100% to +100%",
        impact: "medium"
      },
      d_pct_users_6h: {
        label: "User Growth",
        description: "Community growth rate weight. Measures new user adoption and engagement.",
        category: "social",
        range: "-100% to +100%",
        impact: "low"
      },
      d_pct_infl_6h: {
        label: "Influencers",
        description: "Influencer mentions weight. Tracks when key opinion leaders discuss the asset.",
        category: "social",
        range: "-100% to +100%",
        impact: "medium"
      },
      d_galaxy_6h: {
        label: "Heartbeat Score",
        description: "Composite health metric combining multiple factors. Overall project health indicator.",
        category: "fundamental",
        range: "-10 to +10 points",
        impact: "high"
      },
      neg_d_altrank_6h: {
        label: "Market Edge",
        description: "Relative ranking among all assets. Lower rank means higher market position.",
        category: "fundamental",
        range: "-100% to +100%",
        impact: "high"
      }
    };

    const totalMs = Date.now() - handlerStartMs;
    console.log("[all-agents] request completed", {
      agents: result.length,
      totalMs,
    });

    return NextResponse.json({
      success: true,
      data: {
        agents: result,
        totalAgents: result.length,
        metricExplanations
      }
    });

  } catch (error) {
    console.error("Server error:", error);

    // Handle specific error types
    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("MongoNotConnectedError") ||
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