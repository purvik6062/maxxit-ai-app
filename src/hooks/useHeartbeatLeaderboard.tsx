"use client";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/get-heartbeat-leaderboard");

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const data = await response.json();

        // Check if the response has the expected structure
        if (!data.success && data.error) {
          throw new Error(
            data.error.message || "Failed to fetch leaderboard data"
          );
        }

        setAgents(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return { agents, loading, error };
};
