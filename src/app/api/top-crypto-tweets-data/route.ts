import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";

export async function GET() {
  console.time('top-crypto-tweets-data');
  const client = await dbConnect();
  try {
    // Get top 6 weekly influencers first
    console.time('fetch-top-influencers');
    const response = await fetch(`${process.env.NEXTAUTH_URL || ""}/api/top-weekly-influencers-data`);

    if (!response.ok) {
      throw new Error(`Failed to fetch top weekly influencers: ${response.statusText}`);
    }

    const { influencers } = await response.json();
    console.timeEnd('fetch-top-influencers');

    // Connect to databases
    const backtestingDb = client.db("backtesting_db");
    const backtestingCollection = backtestingDb.collection("backtesting_results_with_reasoning");

    // Get all influencer Twitter handles
    const twitterHandles = influencers.map(influencer => influencer.name);

    // Create a map for influencer data for quick access
    const influencerMap = influencers.reduce((acc, influencer) => {
      acc[influencer.name] = influencer;
      return acc;
    }, {});

    // Fetch all backtesting results for these influencers in a single query with projection
    console.time('fetch-backtesting-results');
    const allResults = await backtestingCollection.find(
      { "Twitter Account": { $in: twitterHandles } },
      { 
        projection: { 
          "Twitter Account": 1, 
          "Final P&L": 1, 
          "Token Mentioned": 1, 
          "Token ID": 1,
          "Tweet Date": 1 
        } 
      }
    ).toArray();
    console.timeEnd('fetch-backtesting-results');

    // Group results by Twitter Account
    const resultsByInfluencer = {};
    allResults.forEach(result => {
      const account = result["Twitter Account"];
      if (!resultsByInfluencer[account]) {
        resultsByInfluencer[account] = [];
      }
      resultsByInfluencer[account].push(result);
    });

    // Process results for each influencer
    const tweets = twitterHandles.map(handle => {
      const influencer = influencerMap[handle];
      const results = resultsByInfluencer[handle] || [];
      
      if (!results.length) return null;

      // Parse and sort results by PnL
      const sortedResults = results
        .map(result => {
          let pnlValue;
          try {
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

      return {
        id: result._id.toString(),
        influencer: {
          name: handle,
          handle: handle,
          avatar: influencer.avatar,
        },
        coin: result["Token Mentioned"] || "",
        tokenId: result["Token ID"] || "",
        positive: result.parsedPnl > 0,
        pnl: result.parsedPnl,
        timestamp: result["Tweet Date"] || new Date().toISOString(),
      };
    }).filter(Boolean);

    console.timeEnd('top-crypto-tweets-data');
    return NextResponse.json(
      { tweets },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching crypto tweets:", error);
    console.timeEnd('top-crypto-tweets-data');
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 