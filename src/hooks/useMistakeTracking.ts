/**
 * Mistake Tracking Hook
 * React hook for accessing quiz attempts and mistake patterns
 */

import { useEffect, useState } from "react";
import { MistakeTrackingService } from "../services/mistake-tracking.service";
import type { MistakePattern, QuizAttempt } from "../types/flashcard.types";

export function useMistakeTracking(subject?: string) {
  const [patterns, setPatterns] = useState<MistakePattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatterns();
  }, [subject]);

  const loadPatterns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MistakeTrackingService.getMistakePatterns(subject);
      setPatterns(data);
    } catch (err: any) {
      console.error("Error loading mistake patterns:", err);

      // Check if it's a collection not found error
      if (err?.code === 404 || err?.message?.includes("not found")) {
        setError("Mistake tracking not set up. Please run the setup script.");
      } else if (err?.code === 401) {
        setError("Permission denied. Please check your authentication.");
      } else {
        setError(err?.message || "Failed to load mistake patterns");
      }

      // Set empty patterns on error so UI shows empty state
      setPatterns([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadPatterns();
  };

  return {
    patterns,
    loading,
    error,
    refresh,
  };
}

export function useQuizAttempts(limit = 20) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAttempts();
  }, [limit]);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MistakeTrackingService.getUserAttempts(limit);
      setAttempts(data);
    } catch (err) {
      console.error("Error loading quiz attempts:", err);
      setError("Failed to load quiz attempts");
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadAttempts();
  };

  return {
    attempts,
    loading,
    error,
    refresh,
  };
}
