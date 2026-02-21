/**
 * Spaced Repetition Service
 * Implements SM-2 algorithm for intelligent flashcard scheduling
 */

import { ID, Query } from "react-native-appwrite";
import { COLLECTIONS, DATABASE_ID } from "../config/appwrite.config";
import {
  CardReview,
  QualityRating,
  ReviewCalculationResult,
  ReviewSessionStats,
  ReviewStatus,
} from "../types/flashcard.types";
import { databases } from "./appwrite";

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;
const MAX_INTERVAL = 365; // Maximum interval in days

/**
 * Calculate next review using SM-2 algorithm
 */
export const calculateNextReview = (
  currentReview: CardReview,
  quality: QualityRating,
): ReviewCalculationResult => {
  let { ease_factor, interval, repetitions } = currentReview;

  // Update ease factor
  ease_factor =
    ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  ease_factor = Math.max(ease_factor, MIN_EASE_FACTOR);

  // Calculate interval based on quality
  if (quality < 3) {
    // Failed: Reset
    repetitions = 0;
    interval = 1;
  } else {
    // Passed: Increase interval
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }
    repetitions += 1;
  }

  // Cap interval at maximum allowed value
  interval = Math.min(interval, MAX_INTERVAL);

  // Calculate next review date
  const next_review_date = new Date();
  next_review_date.setDate(next_review_date.getDate() + interval);

  // Determine review status
  let review_status: ReviewStatus;
  if (repetitions === 0) {
    review_status = ReviewStatus.NEW;
  } else if (repetitions < 3) {
    review_status = ReviewStatus.LEARNING;
  } else if (ease_factor >= 2.5 && interval >= 21) {
    review_status = ReviewStatus.MASTERED;
  } else {
    review_status = ReviewStatus.REVIEW;
  }

  return {
    ease_factor,
    interval,
    repetitions,
    next_review_date: next_review_date.toISOString(),
    review_status,
  };
};

/**
 * Get or create card review record
 */
export const getOrCreateCardReview = async (
  cardId: string,
  userId: string,
): Promise<CardReview> => {
  try {
    // Try to find existing review
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CARD_REVIEWS,
      [Query.equal("card_id", cardId), Query.equal("user_id", userId)],
    );

    if (response.documents.length > 0) {
      return response.documents[0] as unknown as CardReview;
    }

    // Create new review record
    const now = new Date().toISOString();
    const docId = ID.unique();
    const newReview = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CARD_REVIEWS,
      docId,
      {
        card_id: cardId,
        user_id: userId,
        ease_factor: DEFAULT_EASE_FACTOR,
        interval: 0,
        repetitions: 0,
        next_review_date: now,
        created_at: now,
        updated_at: now,
      },
    );

    return newReview as unknown as CardReview;
  } catch (error) {
    console.error("Error getting/creating card review:", error);
    throw error;
  }
};

/**
 * Record a review and update scheduling
 */
export const recordReview = async (
  cardId: string,
  userId: string,
  quality: QualityRating,
  timeSpent: number,
): Promise<CardReview> => {
  try {
    const currentReview = await getOrCreateCardReview(cardId, userId);
    const calculation = calculateNextReview(currentReview, quality);

    // Use $id from Appwrite document
    const documentId = (currentReview as any).$id || currentReview.review_id;

    const updatedReview = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.CARD_REVIEWS,
      documentId,
      {
        ease_factor: calculation.ease_factor,
        interval: calculation.interval,
        repetitions: calculation.repetitions,
        next_review_date: calculation.next_review_date,
        last_review_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    );

    return updatedReview as unknown as CardReview;
  } catch (error) {
    console.error("Error recording review:", error);
    throw error;
  }
};

/**
 * Get cards due for review
 */
export const getDueCards = async (
  userId: string,
  deckId?: string,
): Promise<string[]> => {
  try {
    const now = new Date().toISOString();
    const queries = [
      Query.equal("user_id", userId),
      Query.lessThanEqual("next_review_date", now),
      Query.orderAsc("next_review_date"),
    ];

    const reviews = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CARD_REVIEWS,
      queries,
    );

    let cardIds = reviews.documents.map((doc) => doc.card_id);

    // Filter by deck if specified
    if (deckId && cardIds.length > 0) {
      const cards = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FLASHCARDS,
        [Query.equal("deck_id", deckId), Query.equal("card_id", cardIds)],
      );
      cardIds = cards.documents.map((doc) => doc.card_id);
    }

    return cardIds;
  } catch (error) {
    console.error("Error getting due cards:", error);
    throw error;
  }
};

/**
 * Get review statistics
 */
export const getReviewStats = async (
  userId: string,
): Promise<ReviewSessionStats> => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Get all reviews for user
    const allReviews = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CARD_REVIEWS,
      [Query.equal("user_id", userId), Query.limit(10000)],
    );

    const reviews = allReviews.documents as unknown as CardReview[];

    // Calculate stats
    const total_due = reviews.filter(
      (r) => r.next_review_date <= todayEnd,
    ).length;

    const reviewed_today = reviews.filter(
      (r) =>
        r.last_review_date &&
        r.last_review_date >= todayStart &&
        r.last_review_date <= todayEnd,
    ).length;

    const new_cards = reviews.filter((r) => r.repetitions === 0).length;
    const learning_cards = reviews.filter(
      (r) => r.repetitions > 0 && r.repetitions < 3,
    ).length;
    const review_cards = reviews.filter(
      (r) => r.repetitions >= 3 && r.ease_factor < 2.5,
    ).length;
    const mastered_cards = reviews.filter(
      (r) => r.repetitions >= 3 && r.ease_factor >= 2.5 && r.interval >= 21,
    ).length;

    const due_tomorrow = reviews.filter(
      (r) =>
        r.next_review_date >= tomorrow.toISOString() &&
        r.next_review_date <
          new Date(tomorrow.getTime() + 86400000).toISOString(),
    ).length;

    const due_next_week = reviews.filter(
      (r) =>
        r.next_review_date >= tomorrow.toISOString() &&
        r.next_review_date <= nextWeek.toISOString(),
    ).length;

    // Calculate streak (simplified - just check if reviewed today)
    const streak_days = reviewed_today > 0 ? 1 : 0;

    return {
      total_due,
      reviewed_today,
      new_cards,
      learning_cards,
      review_cards,
      mastered_cards,
      streak_days,
      forecast: {
        tomorrow: due_tomorrow,
        next_week: due_next_week,
      },
    };
  } catch (error) {
    console.error("Error getting review stats:", error);
    throw error;
  }
};
