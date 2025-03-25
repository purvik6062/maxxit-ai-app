import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(request: Request) {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db("ctxbt-signal-flow");
    const collection = db.collection("influencers_new");

    const users = await collection.find({}).toArray();

    client.close();

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
