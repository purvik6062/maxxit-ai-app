import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function GET() {
  const client = await dbConnect();
  try {
    // Get top 6 weekly influencers first
    const response = await fetch(`${process.env.NEXTAUTH_URL || ""}/api/top-weekly-influencers`);

    if (!response.ok) {
      throw new Error(`Failed to fetch top weekly influencers: ${response.statusText}`);
    }

    const { influencers } = await response.json();

    // Connect to databases
    const backtestingDb = client.db("backtesting_db");
    const backtestingCollection = backtestingDb.collection("backtesting_results_with_reasoning");

    // Fetch tweet data for each influencer - get the highest P&L result
    const influencerTweets = await Promise.all(
      influencers.map(async (influencer) => {
        try {
          // Find backtesting results matching this influencer's name
          const results = await backtestingCollection
            .find({ "Twitter Account": influencer.name })
            .toArray();

          if (!results.length) return null;

          // Parse the Final P&L values and sort to find highest
          const sortedResults = results
            .map(result => {
              // Handle different formats of P&L values
              let pnlValue;
              try {
                // Remove % if present and convert to number
                const pnlString = String(result["Final P&L"] || "0").replace('%', '');
                pnlValue = parseFloat(pnlString);
              } catch (e) {
                pnlValue = 0;
              }

              return {
                ...result,
                parsedPnl: isNaN(pnlValue) ? 0 : pnlValue
              };
            })
            .sort((a, b) => b.parsedPnl - a.parsedPnl);

          if (!sortedResults.length) return null;

          const result = sortedResults[0];

          // No need to fetch tweet content anymore - just pass the tweet URL
          return {
            id: result._id.toString(),
            influencer: {
              name: influencer.name,
              handle: result["Twitter Account"] || "",
              avatar: influencer.avatar,
            },
            tweetUrl: result["Tweet"] || "",
            coin: result["Token Mentioned"] || "",
            tokenId: result["Token ID"] || "",
            positive: result.parsedPnl > 0,
            pnl: result.parsedPnl,
            timestamp: result["Tweet Date"] || new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Error processing influencer ${influencer.name}:`, error);
          return null;
        }
      })
    );

    // Filter out null values
    const validTweets = influencerTweets.filter(Boolean);

    // Set cache headers for 7 days (604800 seconds)
    const headers = {
      'Cache-Control': 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',
    };

    return NextResponse.json(
      { tweets: validTweets },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error fetching crypto tweets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 