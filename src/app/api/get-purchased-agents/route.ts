import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: walletAddress' },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await dbConnect();
    const db = client.db('ctxbt-signal-flow');
    const collection = db.collection('agent-purchases');

    // Query database for purchased agents
    const purchases = await collection.find({
      walletAddress: walletAddress.toLowerCase(),
    }).toArray();

    // Extract agent IDs from purchases
    const purchasedAgents = purchases.map(purchase => purchase.agentId);

    // Remove duplicates in case there are any
    const uniquePurchasedAgents = [...new Set(purchasedAgents)];

    console.log('Fetching purchased agents for wallet:', walletAddress.toLowerCase());
    console.log('Found purchases:', purchases.length);
    console.log('Unique agents:', uniquePurchasedAgents);

    return NextResponse.json({
      success: true,
      walletAddress: walletAddress.toLowerCase(),
      purchasedAgents: uniquePurchasedAgents,
      purchases: purchases.map(purchase => ({
        agentId: purchase.agentId,
        transactionHash: purchase.transactionHash,
        purchaseDate: purchase.purchaseDate,
        chainId: purchase.chainId,
      })),
      message: `Found ${uniquePurchasedAgents.length} purchased agents`,
    });

  } catch (error) {
    console.error('Error fetching purchased agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 