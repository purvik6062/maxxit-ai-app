import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Missing required parameter: username' },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await dbConnect();
    const db = client.db('ctxbt-signal-flow');
    const collection = db.collection('user_vault_mappings');

    // Query database for user's vaults
    const vaults = await collection.find({
      username: username,
      isActive: true, // Only fetch active vaults
    }).sort({ createdAt: -1 }).toArray(); // Sort by newest first

    console.log('Fetching vaults for user:', username);
    console.log('Found vaults:', vaults.length);

    return NextResponse.json({
      success: true,
      username,
      vaults: vaults.map(vault => ({
        vaultAddress: vault.vaultAddress,
        isActive: vault.isActive,
        createdAt: vault.createdAt,
        updatedAt: vault.updatedAt,
        _id: vault._id,
      })),
      message: `Found ${vaults.length} active vaults`,
    });

  } catch (error) {
    console.error('Error fetching user vaults:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 