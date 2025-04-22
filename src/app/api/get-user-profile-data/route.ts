import { NextResponse } from "next/server";
import dbConnect from '../../../utils/dbConnect';
import { MongoClient } from "mongodb";

export async function GET(request: Request) {
  let client: MongoClient;
  try {
    client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const collection = db.collection("influencers");

    const users = await collection.find({}).toArray();
    console.log("userssssssss");

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}