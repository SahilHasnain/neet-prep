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
    } catch (err) {
      console.error("Error loading mistake patterns:", err);
      setError("Failed to load mistake patterns");
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
