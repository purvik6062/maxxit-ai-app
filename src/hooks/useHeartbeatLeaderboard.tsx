"use client";
import { useEffect, useState } from "react";

interface CryptoAgent {
  _id: {
    $oid: string;
  };
  id: number;
  handle: string;
  name: string;
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
        if (data.success && Array.isArray(data.data?.leaderboard)) {
          // Transform the data to match the CryptoAgent interface
          const transformedAgents = data.data.leaderboard.map((entry: any) => ({
            _id: entry._id,
            id: entry.id,
            handle: entry.handle,
            name: entry.name,
            heartbeat: entry.score, // Note: changed from heartbeat to score to match API
          }));
          setAgents(transformedAgents);
        } else {
          throw new Error("Invalid data structure received from API");
        }
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
