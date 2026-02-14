/**
 * AI Service
 * Handles AI-powered flashcard generation via Appwrite Function
 */

import { FUNCTIONS } from '../config/appwrite.config';
import type { ApiResponse, GenerateFlashcardsDTO } from '../types/flashcard.types';

interface GenerateFlashcardsResponse {
  flashcards: Array<{
    front_content: string;
    back_content: string;
    difficulty: string;
    tags: string[];
    order_index: number;
  }>;
  count: number;
  topic: string;
  difficulty: string;
}

export class AIService {
  static async generateFlashcards(
    userId: string,
    data: GenerateFlashcardsDTO
  ): Promise<ApiResponse<GenerateFlashcardsResponse>> {
    try {
      const response = await fetch(FUNCTIONS.GENERATE_FLASHCARDS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: data.topic,
          count: data.count,
          difficulty: data.difficulty || 'medium',
          language: data.language || 'en',
          userId,
          deckId: data.deck_id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate flashcards');
      }

      return result;
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: 'Failed to generate flashcards',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
