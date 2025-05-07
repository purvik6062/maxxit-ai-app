import { NextResponse } from "next/server";
import dbConnect from '../../../utils/dbConnect';
import { MongoClient } from "mongodb";

export async function GET(request: Request) {
  let client: MongoClient;
  try {
    // Connect to the database
    client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    
    // Get references to both collections
    const heartbeatCollection = db.collection("heartbeat");
    const influencersCollection = db.collection("influencers");

    // Fetch all heartbeat data
    const heartbeatData = await heartbeatCollection.find({}).toArray();
    
    // Create a map of twitterHandle to scaled score
    const heartbeatScores = heartbeatData.reduce((acc, doc) => {
      const scaledScore = Math.min(Math.max((doc.score / 1000) * 100, 0), 100);
      acc[doc.twitterHandle] = parseFloat(scaledScore.toFixed(1));
      return acc;
    }, {} as Record<string, number>);

    // Get all influencers
    const influencers = await influencersCollection.find({}).toArray();
    
    // Update each influencer with their heartbeat score
    const updatePromises = influencers.map(async (influencer) => {
      const score = heartbeatScores[influencer.twitterHandle] || 0;
      
      // Update the influencer document with the heartbeat score
      return influencersCollection.updateOne(
        { _id: influencer._id },
        { $set: { heartbeatScore: score } }
      );
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Get count of updated documents
    const updatedCount = await influencersCollection.countDocuments({ heartbeatScore: { $exists: true } });

    return NextResponse.json({
      success: true,
      message: `Successfully updated heartbeat scores for ${updatedCount} influencers`,
      updatedCount
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating heartbeat scores:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
} 