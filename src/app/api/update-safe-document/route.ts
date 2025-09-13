import { NextResponse } from "next/server";
import dbConnect from "src/utils/dbConnect";
import { MongoClient } from "mongodb";

export async function POST(request: Request): Promise<Response> {
  let client: MongoClient | null = null;
  try {
    const body = await request.json();
    const {
      safeId,
      agentId,
      agentType,
      walletAddress
    } = body || {};

    // Validate required fields
    if (!safeId || !agentId || !agentType || !walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "safeId, agentId, agentType, and walletAddress are required",
          },
        },
        { status: 400 }
      );
    }

    // Validate agent type
    if (agentType !== 'perpetuals' && agentType !== 'spot') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "agentType must be either 'perpetuals' or 'spot'",
          },
        },
        { status: 400 }
      );
    }

    client = await dbConnect();
    const db = client.db("safe-deployment-service");
    const safes = db.collection("safes");

    // Find the Safe document by safeId
    const safeDoc = await safes.findOne({ safeId });

    if (!safeDoc) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Safe document not found",
          },
        },
        { status: 404 }
      );
    }

    // Check if this specific agent configuration already exists
    const existingAgentIndex = safeDoc.userInfo?.agents?.findIndex(
      (agent: any) => agent.agentId === agentId && agent.agentType === agentType
    );

    // Prepare update data
    const updateData: any = {
      $set: {
        updatedAt: new Date(),
      }
    };

    // Only update the single agent fields if this is the first agent for this Safe
    if (!safeDoc.userInfo?.agentId && !safeDoc.userInfo?.agentType) {
      updateData.$set["userInfo.agentId"] = agentId;
      updateData.$set["userInfo.agentType"] = agentType;
      updateData.$set["userInfo.walletAddress"] = walletAddress;
    }

    if (safeDoc.userInfo?.agents && existingAgentIndex !== undefined && existingAgentIndex >= 0) {
      // Update existing agent in the array
      updateData.$set[`userInfo.agents.${existingAgentIndex}.walletAddress`] = walletAddress;
      updateData.$set[`userInfo.agents.${existingAgentIndex}.assignedAt`] = new Date();
    } else {
      // Add new agent to the array
      updateData.$push = {
        "userInfo.agents": {
          agentId,
          agentType,
          walletAddress,
          assignedAt: new Date(),
        }
      };
    }

    const result = await safes.updateOne(
      { safeId },
      updateData,
      { upsert: false }
    );

    console.log('Safe document update result:', {
      safeId,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      updateData
    });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Safe document not found or no changes made",
            details: {
              safeId,
              matchedCount: result.matchedCount,
              modifiedCount: result.modifiedCount
            }
          },
        },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "No changes made to Safe document - agent configuration may already exist",
            details: {
              safeId,
              matchedCount: result.matchedCount,
              modifiedCount: result.modifiedCount
            }
          },
        },
        { status: 200 } // Return 200 since this isn't really an error
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Safe document updated successfully with agent information",
        safeId,
        agentId,
        agentType,
        walletAddress,
        modifiedCount: result.modifiedCount,
      },
    });

  } catch (error: any) {
    console.error("Error updating Safe document:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error?.message || "Failed to update Safe document" },
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve Safe document by agent ID and type
export async function GET(request: Request): Promise<Response> {
  let client: MongoClient | null = null;
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const agentType = searchParams.get("agentType");
    const walletAddress = searchParams.get("walletAddress");

    if (!agentId || !agentType || !walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "agentId, agentType, and walletAddress are required",
          },
        },
        { status: 400 }
      );
    }

    if (agentType !== 'perpetuals' && agentType !== 'spot') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "agentType must be either 'perpetuals' or 'spot'",
          },
        },
        { status: 400 }
      );
    }

    client = await dbConnect();
    const db = client.db("safe-deployment-service");
    const safes = db.collection("safes");

    // Find Safe document that contains this agent configuration
    console.log('Searching for Safe document with:', {
      agentId,
      agentType,
      walletAddress
    });

    // First, let's see all Safes for this user to understand the data structure
    // Note: agentId here is actually the agent identifier, not the user ID
    const allUserSafes = await safes.find({
      $or: [
        { "userInfo.agentId": agentId },
        { "userInfo.agents.agentId": agentId }
      ]
    }).toArray();
    console.log('All Safes for user:', allUserSafes.map(safe => ({
      safeId: safe.safeId,
      agentId: safe.userInfo?.agentId,
      agentType: safe.userInfo?.agentType,
      walletAddress: safe.userInfo?.walletAddress,
      hasAgentsArray: Array.isArray(safe.userInfo?.agents),
      agentsCount: safe.userInfo?.agents?.length || 0
    })));

    const safeDoc = await safes.findOne({
      $or: [
        {
          "userInfo.agents": {
            $elemMatch: {
              agentId: agentId,
              agentType: agentType,
              walletAddress: walletAddress
            }
          }
        },
        {
          "userInfo.agentId": agentId,
          "userInfo.agentType": agentType,
          "userInfo.walletAddress": walletAddress
        }
      ]
    });

    console.log('Agent-specific Safe search result:', {
      agentId,
      agentType,
      walletAddress,
      found: !!safeDoc,
      safeId: safeDoc?.safeId,
      foundAgentType: safeDoc?.userInfo?.agentType
    });

    if (!safeDoc) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "No Safe document found for this agent configuration",
          },
        },
        { status: 404 }
      );
    }

    // Extract the relevant Safe address for the current network
    const deployments = safeDoc.deployments || {};
    const networkKeys = Object.keys(deployments);

    // Get the most recent deployment or first available
    let safeAddress: string | null = null;
    let networkKey: string | null = null;

    if (networkKeys.length > 0) {
      // Prefer arbitrum_sepolia if available, otherwise use first available
      networkKey = networkKeys.includes('arbitrum_sepolia') ? 'arbitrum_sepolia' : networkKeys[0];
      safeAddress = networkKey ? deployments[networkKey]?.address : null;
    }

    return NextResponse.json({
      success: true,
      data: {
        safeId: safeDoc.safeId,
        safeAddress,
        networkKey,
        deployments: safeDoc.deployments,
        agentInfo: safeDoc.userInfo?.agents?.find(
          (agent: any) => agent.agentId === agentId && agent.agentType === agentType
        ) || {
          agentId,
          agentType,
          walletAddress,
          assignedAt: safeDoc.userInfo?.updatedAt || new Date()
        }
      },
    });

  } catch (error: any) {
    console.error("Error retrieving Safe document:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error?.message || "Failed to retrieve Safe document" },
      },
      { status: 500 }
    );
  }
}