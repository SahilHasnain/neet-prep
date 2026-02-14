/**
 * Progress Service
 * Handles user progress tracking and spaced repetition
 */

import { ID, Query } from 'react-native-appwrite';
import { COLLECTIONS } from '../config/appwrite.config';
import type { UpdateProgressDTO, UserProgress } from '../types/flashcard.types';
import { DATABASE_ID, databases } from './appwrite';

export class ProgressService {
  static async getCardProgress(userId: string, cardId: string): Promise<UserProgress | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_PROGRESS,
        [
          Query.equal('user_id', userId),
          Query.equal('card_id', cardId),
          Query.limit(1),
        ]
      );

      if (response.documents.length === 0) {
        return null;
      }

      return response.documents[0] as unknown as UserProgress;
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  }

  static async updateProgress(userId: string, data: UpdateProgressDTO): Promise<UserProgress> {
    const existing = await this.getCardProgress(userId, data.card_id);
    const now = new Date().toISOString();

    if (existing) {
      // Update existing progress
      const newMasteryLevel = data.is_correct
        ? Math.min(existing.mastery_level + 1, 5)
        : Math.max(existing.mastery_level - 1, 0);

      const nextReview = this.calculateNextReview(newMasteryLevel);

      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROGRESS,
        existing.progress_id,
        {
          mastery_level: newMasteryLevel,
          last_reviewed: now,
          next_review: nextReview,
          review_count: existing.review_count + 1,
          correct_count: data.is_correct ? existing.correct_count + 1 : existing.correct_count,
          incorrect_count: data.is_correct ? existing.incorrect_count : existing.incorrect_count + 1,
        }
      );

      return updated as unknown as UserProgress;
    } else {
      // Create new progress
      const masteryLevel = data.is_correct ? 1 : 0;
      const nextReview = this.calculateNextReview(masteryLevel);

      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROGRESS,
        ID.unique(),
        {
          progress_id: ID.unique(),
          user_id: userId,
          card_id: data.card_id,
          deck_id: data.deck_id,
          mastery_level: masteryLevel,
          last_reviewed: now,
          next_review: nextReview,
          review_count: 1,
          correct_count: data.is_correct ? 1 : 0,
          incorrect_count: data.is_correct ? 0 : 1,
        }
      );

      return created as unknown as UserProgress;
    }
  }

  static async getDeckProgress(userId: string, deckId: string): Promise<UserProgress[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      [
        Query.equal('user_id', userId),
        Query.equal('deck_id', deckId),
      ]
    );

    return response.documents as unknown as UserProgress[];
  }

  // Spaced repetition algorithm (simplified)
  private static calculateNextReview(masteryLevel: number): string {
    const intervals = [1, 3, 7, 14, 30, 60]; // days
    const days = intervals[masteryLevel] || 60;
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    
    return nextReview.toISOString();
  }

  static async getCardsForReview(userId: string, deckId: string): Promise<string[]> {
    const now = new Date().toISOString();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      [
        Query.equal('user_id', userId),
        Query.equal('deck_id', deckId),
        Query.lessThanEqual('next_review', now),
      ]
    );

    return response.documents.map((doc: any) => doc.card_id);
  }
}
