import { NextRequest, NextResponse } from "next/server";

// Input validation schema
interface TradingSettings {
  agentAddress: string;
  agentName: string;
  riskLevel: string;
  vaultName: string;
  vaultSymbol: string;
  denominationAsset: string;
}

interface RegistrationData {
  username: string;
  vaultAddress: string;
  tradingSettings: TradingSettings;
}

function validateRegistrationData(data: any): data is RegistrationData {
  return (
    data &&
    typeof data.username === "string" &&
    typeof data.vaultAddress === "string" &&
    data.tradingSettings &&
    typeof data.tradingSettings.agentAddress === "string" &&
    typeof data.tradingSettings.agentName === "string" &&
    typeof data.tradingSettings.riskLevel === "string" &&
    typeof data.tradingSettings.vaultName === "string" &&
    typeof data.tradingSettings.vaultSymbol === "string" &&
    typeof data.tradingSettings.denominationAsset === "string"
  );
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();

    if (!validateRegistrationData(body)) {
      return NextResponse.json(
        {
          error: "Invalid registration data",
          details: "Missing required fields or invalid data types",
        },
        { status: 400 }
      );
    }

    const registrationData = body as RegistrationData;

    // Validate required environment variable
    if (!process.env.VAULT_ENDPOINT) {
      console.error("VAULT_ENDPOINT environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Make external API call
    const registrationResponse = await fetch(
      `${process.env.VAULT_ENDPOINT}/users/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(30000), // 30 seconds
      }
    );

    if (!registrationResponse.ok) {
      const errorText = await registrationResponse.text();
      console.error(
        `External API registration failed: ${registrationResponse.status} - ${errorText}`
      );

      return NextResponse.json(
        {
          error: "Registration failed",
          details: `External service returned ${registrationResponse.status}`,
          externalError: errorText,
        },
        { status: registrationResponse.status >= 500 ? 502 : 400 }
      );
    }

    // Parse response from external API
    let externalResponse;
    try {
      externalResponse = await registrationResponse.json();
    } catch (parseError) {
      console.warn(
        "External API returned non-JSON response, but request was successful"
      );
      externalResponse = { success: true };
    }

    return NextResponse.json({
      success: true,
      message: "User vault registered successfully",
      data: {
        username: registrationData.username,
        vaultAddress: registrationData.vaultAddress,
        agentName: registrationData.tradingSettings.agentName,
      },
      externalResponse,
    });
  } catch (error) {
    console.error("Error in user vault registration:", error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout - external service did not respond" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
