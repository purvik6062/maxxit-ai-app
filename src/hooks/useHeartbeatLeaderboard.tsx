"use client";
import { useEffect, useState, useCallback } from "react";

interface CryptoAgent {
  _id: string;
  id: number;
  handle: string;
  name: string;
  impactFactor: number;
  heartbeat: number;
}

export const useHeartbeatLeaderboard = () => {
  const [agents, setAgents] = useState<CryptoAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/get-heartbeat-leaderboard", {
        cache: "no-store",
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("HeartbeatLeaderboard API response:", data);
  
      if (!data.success && data.error) {
        throw new Error(data.error.message || "Failed to fetch leaderboard data");
      }
  
      setAgents(data.data || []);
    } catch (err) {
      console.error("HeartbeatLeaderboard fetch error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      throw err; // Re-throw to catch in handleInfluencerAdded
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return { agents, loading, error, refreshData };
};