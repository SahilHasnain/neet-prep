/**
 * Hook for fetching doubt patterns
 */

import { useEffect, useState } from "react";
import { DoubtService } from "../services/doubt.service";
import { getUserId } from "../utils/user-id";

interface DoubtPattern {
  card_id: string;
  doubt_count: number;
  latest_doubt: string;
  context: string;
}

export function useDoubtPatterns() {
  const [patterns, setPatterns] = useState<DoubtPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await getUserId();
      const data = await DoubtService.getDoubtPatterns(userId);
      setPatterns(data);
    } catch (err) {
      console.error("Error fetching doubt patterns:", err);
      setError(err instanceof Error ? err.message : "Failed to load doubts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, []);

  return {
    patterns,
    loading,
    error,
    refresh: fetchPatterns,
  };
}
