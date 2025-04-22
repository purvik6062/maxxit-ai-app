// app/api/check-influencer/route.js
import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  let client: MongoClient;
  try {
    const { username } = await request.json();
    console.log("api check-influencer", username);

    if (!username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    client = await dbConnect();
    const database = client.db("ctxbt-signal-flow");
    const collection = database.collection("influencers"); 

    const user = await collection.findOne({ twitterHandle: username });

    if (user) {
      return NextResponse.json({ exists: true }, { status: 200 });
    } else {
      return NextResponse.json({ exists: false }, { status: 200 });
    }
  } catch (error) {
    console.error("MongoDB error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  } 
}