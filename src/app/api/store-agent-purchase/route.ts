import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, agentId, transactionHash, chainId, purchaseDate } = await request.json();

    // Validate required fields
    if (!walletAddress || !agentId || !transactionHash) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, agentId, transactionHash' },
        { status: 400 }
      );
    }

    // Validate that it's Arbitrum network
    if (chainId !== 42161) {
      return NextResponse.json(
        { error: 'Only Arbitrum One network (chainId: 42161) is supported' },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await dbConnect();
    const db = client.db('ctxbt-signal-flow');
    const collection = db.collection('agent-purchases');

    // Check if this purchase already exists
    const existingPurchase = await collection.findOne({
      walletAddress: walletAddress.toLowerCase(),
      agentId,
      transactionHash,
    });

    if (existingPurchase) {
      return NextResponse.json({
        success: true,
        message: 'Purchase already recorded',
        data: existingPurchase,
      });
    }

    // Store the purchase in database
    const purchaseData = {
      walletAddress: walletAddress.toLowerCase(),
      agentId,
      transactionHash,
      chainId,
      purchaseDate: new Date(purchaseDate),
      createdAt: new Date(),
    };

    const result = await collection.insertOne(purchaseData);

    console.log('Agent purchase stored:', {
      ...purchaseData,
      _id: result.insertedId,
    });

    return NextResponse.json({
      success: true,
      message: 'Agent purchase stored successfully',
      data: {
        ...purchaseData,
        _id: result.insertedId,
      },
    });

  } catch (error) {
    console.error('Error storing agent purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 