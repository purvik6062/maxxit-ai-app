import { NextRequest, NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress");
    // console.log("wa", walletAddress);

    if (!walletAddress || walletAddress === "undefined") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Please connect with your wallet first!",
          },
        },
        { status: 400 }
      );
    }

    const normalizedWalletAddress = walletAddress.toLowerCase();
    // console.log("Searching for wallet:", normalizedWalletAddress);

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const usersCollection = db.collection("users");
    const syncedCollection = db.collection("influencers");

    const db2 = client.db("test_analysis");
    // const syncedCollection = db2.collection("influencers_testing");

    // Find the user by walletAddress - check both lowercase and original case
    const user = await usersCollection.findOne({
      $or: [
        { walletAddress: normalizedWalletAddress },
        { walletAddress: walletAddress },
      ],
    });
    // console.log("User found:", user);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Please register yourself first to receive 100 free credits!",
          },
        },
        { status: 404 }
      );
    }

    const subscribedAccounts = user.subscribedAccounts || [];

    // Map through subscribedAccounts to fetch userProfileUrl
    const enrichedSubscribedAccounts = await Promise.all(
      subscribedAccounts.map(async (account: { twitterHandle: any }) => {
        const twitterHandle = account.twitterHandle;

        // Query the synced collection for a matching twitterHandle
        const syncedDoc = await syncedCollection.findOne({
          twitterHandle: twitterHandle,
        });

        // If a match is found, include the userProfileUrl; otherwise, set a default
        if (
          syncedDoc &&
          syncedDoc.userData &&
          syncedDoc.userData.userProfileUrl
        ) {
          return {
            ...account,
            userProfileUrl: syncedDoc.userData.userProfileUrl,
          };
        } else {
          return {
            ...account,
            userProfileUrl: "N/A", // Default value if no match or no userProfileUrl
          };
        }
      })
    );

    return NextResponse.json(
      { success: true, data: enrichedSubscribedAccounts },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
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
