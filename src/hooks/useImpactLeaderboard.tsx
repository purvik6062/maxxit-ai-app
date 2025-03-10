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

export const useImpactLeaderboard = () => {
  const [agents, setAgents] = useState<CryptoAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/get-impact-leaderboard");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success && data.error) {
          throw new Error(
            data.error.message || "Failed to fetch leaderboard data"
          );
        }

        setAgents(data.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return { agents, loading, error };
};