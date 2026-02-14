/**
 * useAI Hook
 * Manages AI flashcard generation
 */

import { useState } from 'react';
import { AIService } from '../services/ai.service';
import type { GenerateFlashcardsDTO } from '../types/flashcard.types';

export function useAI(userId: string) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFlashcards = async (data: GenerateFlashcardsDTO) => {
    try {
      setGenerating(true);
      setError(null);

      const response = await AIService.generateFlashcards(userId, data);

      if (!response.success) {
        throw new Error(response.message || 'Failed to generate flashcards');
      }

      return response.data?.flashcards || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate flashcards';
      setError(errorMessage);
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  return {
    generating,
    error,
    generateFlashcards,
  };
}
