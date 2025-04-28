import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const { id } = await params;
  console.log("get-influencer-metrics called with ID:", id);

  try {
    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");

    // Try to determine if the id is an ObjectId or a Twitter handle
    let query = {};
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    console.log("ID validation:", { id, isValidObjectId });
    
    if (isValidObjectId) {
      // It appears to be a valid ObjectId
      try {
        query = { _id: new ObjectId(id) };
        console.log("Using ObjectId query:", query);
      } catch (error) {
        // If ObjectId creation fails, fall back to twitterHandle
        console.error("ObjectId creation failed, falling back to twitterHandle:", error);
        query = { twitterHandle: id };
      }
    } else {
      // Use it as a Twitter handle
      console.log("Using twitterHandle query:", { twitterHandle: id });
      query = { twitterHandle: id };
    }

    const influencer = await db
      .collection("influencers")
      .findOne(query);

    if (!influencer) {
      console.log("No influencer found for query:", query);
      return NextResponse.json(
        { error: "Influencer not found" },
        { status: 404 }
      );
    }

    console.log("Influencer found:", { 
      id: influencer._id.toString(),
      twitterHandle: influencer.twitterHandle,
      hasUserData: !!influencer.userData
    });
    
    return NextResponse.json(influencer);
  } catch (error) {
    console.error("Error in get-influencer-metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch influencer" },
      { status: 500 }
    );
  }
}