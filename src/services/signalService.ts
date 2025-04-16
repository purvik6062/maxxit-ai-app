import { SignalResponse } from "../types/signal";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const fetchSignals = async (
  influencerId: string | null,
  page: number = 1,
  limit: number = 10
): Promise<SignalResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (influencerId) {
      params.append("influencerId", influencerId);
    }

    const response = await fetch(
      `${API_BASE_URL}/signals?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch signals");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching signals:", error);
    throw error;
  }
};
