import { useState, useEffect } from "react";
import { SignalData, SignalResponse } from "../types/signal";
import { fetchSignals } from "../services/signalService";

interface UseSignalsProps {
  influencerId: string | null;
}

interface UseSignalsReturn {
  signals: SignalData[];
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
}

export const useSignals = ({
  influencerId,
}: UseSignalsProps): UseSignalsReturn => {
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchSignals(influencerId, page, limit);
      setSignals(response.signals);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData();
  }, [influencerId, limit]);

  useEffect(() => {
    fetchData();
  }, [page]);

  return {
    signals,
    loading,
    error,
    total,
    page,
    setPage,
    limit,
    setLimit,
    refetch: fetchData,
  };
};
