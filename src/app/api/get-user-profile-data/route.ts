import { NextResponse } from "next/server";
import dbConnect from '../../../utils/dbConnect';

export async function GET(request: Request) {
  try {
    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow");
    const collection = db.collection("influencers");

    const users = await collection.find({}).toArray();
    console.log("userssssssss");

    // client.close();

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}