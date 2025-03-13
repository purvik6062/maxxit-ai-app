// app/api/add-influencer/route.ts
import { NextResponse } from 'next/server';
import dbConnect from "src/utils/dbConnect";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, handle, impactFactor, heartbeat, createdAt } = body;

    // Validate the input
    if (!name || !handle) {
      return NextResponse.json({ 
        success: false, 
        error: { message: 'Name and handle are required' } 
      }, { status: 400 });
    }

    const client = await dbConnect();
    const db = client.db("ctxbt-signal-flow"); 
    const collection = db.collection("influencers_account"); 

    // Check if influencer already exists
    const existingInfluencer = await collection.findOne({ handle });

    if (existingInfluencer) {
      return NextResponse.json({ 
        success: false, 
        error: { message: 'Influencer with this handle already exists' } 
      }, { status: 400 });
    }
    
    // Create new influencer
    const newInfluencer = {
      name,
      handle,
      impactFactor,
      heartbeat,
      createdAt: new Date(createdAt)
    };

    await collection.insertOne(newInfluencer);

    return NextResponse.json({ 
      success: true, 
      data: newInfluencer 
    });
  } catch (error) {
    console.error('Error adding influencer:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: { message: 'Failed to add influencer' } 
    }, { status: 500 });
  }
}