/**
 * Spaced Repetition Hook
 * React hook for managing spaced repetition sessions
 */

import { useCallback, useEffect, useState } from "react";
import {
  getDueCards,
  getOrCreateCardReview,
  getReviewStats,
  recordReview,
} from "../services/spaced-repetition.service";
import { QualityRating, ReviewSessionStats } from "../types/flashcard.types";
import { getUserId } from "../utils/user-id";

export const useSpacedRepetition = (deckId?: string) => {
  const [dueCardIds, setDueCardIds] = useState<string[]>([]);
  const [stats, setStats] = useState<ReviewSessionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load due cards
   */
  const loadDueCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await getUserId();
      const cards = await getDueCards(userId, deckId);
      setDueCardIds(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load due cards");
      console.error("Error loading due cards:", err);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  /**
   * Load review statistics
   */
  const loadStats = useCallback(async () => {
    try {
      const userId = await getUserId();
      const reviewStats = await getReviewStats(userId);
      setStats(reviewStats);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  /**
   * Submit a review rating
   */
  const submitReview = useCallback(
    async (cardId: string, quality: QualityRating, timeSpent: number) => {
      try {
        setError(null);
        const userId = await getUserId();
        await recordReview(cardId, userId, quality, timeSpent);

        // Remove card from due list
        setDueCardIds((prev) => prev.filter((id) => id !== cardId));

        // Refresh stats
        await loadStats();

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit review",
        );
        console.error("Error submitting review:", err);
        return false;
      }
    },
    [loadStats],
  );

  /**
   * Get card review data
   */
  const getCardReview = useCallback(async (cardId: string) => {
    try {
      const userId = await getUserId();
      return await getOrCreateCardReview(cardId, userId);
    } catch (err) {
      console.error("Error getting card review:", err);
      return null;
    }
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([loadDueCards(), loadStats()]);
  }, [loadDueCards, loadStats]);

  // Load initial data
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    dueCardIds,
    dueCount: dueCardIds.length,
    stats,
    loading,
    error,
    submitReview,
    getCardReview,
    refresh,
    loadDueCards,
    loadStats,
  };
};
