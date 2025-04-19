import { NextResponse } from 'next/server';
import dbConnect from "src/utils/dbConnect";
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const client = await dbConnect();
    const db = client.db('test_analysis'); 
    const collection = db.collection('shares');

    const id = randomUUID();
    const content = 'Hello, this is a shared content';
    const link = 'https://myapp.com';
    const image = 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D'; // Random image from Picsum

    await collection.insertOne({ id, content, link, image });
    
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating share:', error);
    return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
  }
}