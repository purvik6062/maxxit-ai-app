import { fetchPriceData } from "@/lib/coingecko";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { signal_data } = await req.json();
    console.log("signal data: ",  signal_data)
    const processedData = await processTelegramSignal(signal_data);
    return NextResponse.json({ success: true, data: processedData });
  } catch (error) {
    console.error("Error processing telegram signals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process telegram signals" },
      { status: 500 }
    );
  }
}

async function processTelegramSignal(signal: any) {
  const tokenId = signal.tokenId;

  // Fetch current price data for the token
  const priceData = await fetchPriceData(tokenId);
  if (!priceData || priceData.length === 0) {
    console.warn(`No current price data for ${tokenId}`);
    return {
      ...signal,
      exit_price: "N/A",
      p_and_l: "N/A",
    };
  }

  // Extract the most recent price
  const currentPrice = priceData[priceData.length - 1][1];

  const priceAtSignal = currentPrice; // Use current price as the price at signal
  const TP1 = signal.tp1;
  const SL = signal.sl;

  // Skip if price at signal is greater than TP1 or less than SL
  if (priceAtSignal > TP1 || priceAtSignal < SL) {
    return {
      ...signal,
      exit_price: "N/A",
      p_and_l: "N/A",
    };
  }

  let exitPrice: number | null = null;
  let peakPrice = priceAtSignal; // Initialize peak as starting price
  let tp1Hit = false;

  // Check SL first
  if (currentPrice <= SL) {
    exitPrice = SL;
  } else if (currentPrice >= TP1) {
    tp1Hit = true;
  }

  // After TP1 is hit, implement trailing stop
  if (tp1Hit) {
    if (currentPrice > peakPrice) {
      peakPrice = currentPrice; // Update peak if price increases
    } else if (currentPrice <= peakPrice * 0.99) {
      // Exit if price drops 1% from peak
      exitPrice = currentPrice;
    }
  }

  // If no exit condition was met, use the current price
  if (exitPrice === null) {
    exitPrice = currentPrice;
  }

  // Calculate P&L
  const pnl = ((exitPrice - priceAtSignal) / priceAtSignal) * 100;

  return {
    ...signal,
    currentPrice: currentPrice.toFixed(6),
    exit_price: exitPrice.toFixed(6),
    p_and_l: `${pnl.toFixed(2)}%`,
  };
} 