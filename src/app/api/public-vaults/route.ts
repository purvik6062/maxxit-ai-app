import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';

interface PublicVault {
  _id: string;
  vaultAddress: string;
  vaultName: string;
  vaultSymbol: string;
  creatorUsername: string;
  denominationAsset: string;
  agentName?: string;
  riskLevel?: string;
  isActive: boolean;
  createdAt: string;
  totalValueLocked?: string;
  monthlyReturn?: string;
  totalSupply?: string;
  sharePrice?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, monthlyReturn, totalValueLocked
    const order = searchParams.get('order') || 'desc'; // asc, desc
    const riskLevel = searchParams.get('riskLevel'); // Low, Medium, High

    // Connect to database
    const client = await dbConnect();
    const db = client.db('ctxbt-signal-flow');
    const collection = db.collection('user_vault_mappings');

    // Build query filter
    const filter: any = {
      isActive: true
    };

    // Build sort criteria
    const sortCriteria: any = {};
    sortCriteria[sortBy] = order === 'desc' ? -1 : 1;

    // Query database for public vaults
    const vaults = await collection
      .find(filter)
      .sort(sortCriteria)
      .skip(offset)
      .limit(limit)
      .toArray();

    console.log(vaults);

    console.log(`Fetching public vaults: found ${vaults.length} vaults`);

    // Transform vault data for public consumption
    const publicVaults: PublicVault[] = vaults.map(vault => {
      // Generate a meaningful vault name from the address since it's not stored in DB
      const shortAddress = vault.vaultAddress.slice(0, 6) + '...' + vault.vaultAddress.slice(-4);
      const vaultName = `${vault.username}'s Vault (${shortAddress})`;
      const vaultSymbol = `${vault.username.toUpperCase().slice(0, 3)}VLT`;

      return {
        _id: vault._id.toString(),
        vaultAddress: vault.vaultAddress,
        vaultName: vaultName,
        vaultSymbol: vaultSymbol,
        creatorUsername: vault.username || 'Anonymous',
        denominationAsset: '',
        agentName: '', 
        riskLevel: '', 
        isActive: vault.isActive,
        createdAt: vault.createdAt,
        // Performance metrics will be calculated dynamically by the frontend
        totalValueLocked: '0',
        monthlyReturn: '0',
        totalSupply: '0',
        sharePrice: '1.0'
      };
    });

    // Get total count for pagination
    const totalCount = await collection.countDocuments(filter);

    return NextResponse.json({
      success: true,
      vaults: publicVaults,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      message: `Found ${publicVaults.length} public vaults`,
    });

  } catch (error) {
    console.error('Error fetching public vaults:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 