/**
 * useProgress Hook
 * Manages user progress tracking and spaced repetition
 */

import { useEffect, useState } from 'react';
import { ProgressService } from '../services/progress.service';
import type { UpdateProgressDTO, UserProgress } from '../types/flashcard.types';

export function useProgress(userId: string, deckId: string) {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardsForReview, setCardsForReview] = useState<string[]>([]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProgressService.getDeckProgress(userId, deckId);
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (data: UpdateProgressDTO): Promise<boolean> => {
    try {
      const updated = await ProgressService.updateProgress(userId, data);
      setProgress(prev => {
        const existing = prev.find(p => p.card_id === data.card_id);
        if (existing) {
          return prev.map(p => p.card_id === data.card_id ? updated : p);
        }
        return [...prev, updated];
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
      return false;
    }
  };

  const loadCardsForReview = async () => {
    try {
      const cards = await ProgressService.getCardsForReview(userId, deckId);
      setCardsForReview(cards);
    } catch (err) {
      console.error('Failed to load cards for review:', err);
    }
  };

  const getCardProgress = (cardId: string): UserProgress | undefined => {
    return progress.find(p => p.card_id === cardId);
  };

  const getMasteryStats = () => {
    const total = progress.length;
    if (total === 0) return { mastered: 0, learning: 0, new: 0 };

    const mastered = progress.filter(p => p.mastery_level >= 4).length;
    const learning = progress.filter(p => p.mastery_level > 0 && p.mastery_level < 4).length;
    const newCards = total - mastered - learning;

    return { mastered, learning, new: newCards };
  };

  const refresh = () => {
    loadProgress();
    loadCardsForReview();
  };

  useEffect(() => {
    if (userId && deckId) {
      loadProgress();
      loadCardsForReview();
    }
  }, [userId, deckId]);

  return {
    progress,
    loading,
    error,
    cardsForReview,
    updateProgress,
    getCardProgress,
    getMasteryStats,
    refresh,
  };
}
