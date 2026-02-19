/**
 * Mistake Tracking Service
 * Handles quiz attempt logging and mistake pattern aggregation
 */

import { ID, Query } from "react-native-appwrite";
import { DATABASE_ID, databases } from "../config/appwrite.config";
import type {
  CreateQuizAttemptDTO,
  MistakePattern,
  QuizAttempt,
  WrongAnswer,
} from "../types/flashcard.types";
import { getUserId } from "../utils/user-id";

const QUIZ_ATTEMPTS_COLLECTION = "quiz_attempts";
const MISTAKE_PATTERNS_COLLECTION = "mistake_patterns";

export class MistakeTrackingService {
  /**
   * Log a quiz attempt with wrong answers
   */
  static async logQuizAttempt(
    data: CreateQuizAttemptDTO,
  ): Promise<QuizAttempt> {
    try {
      const userId = await getUserId();

      const attempt = await databases.createDocument(
        DATABASE_ID,
        QUIZ_ATTEMPTS_COLLECTION,
        ID.unique(),
        {
          user_id: userId,
          card_id: data.card_id,
          deck_id: data.deck_id,
          quiz_mode: data.quiz_mode,
          score: data.score,
          total_questions: data.total_questions,
          wrong_answers: JSON.stringify(data.wrong_answers),
          completed_at: new Date().toISOString(),
        },
      );

      // Update mistake patterns for wrong answers
      if (data.wrong_answers.length > 0) {
        await this.updateMistakePatterns(data.wrong_answers);
      }

      return {
        attempt_id: attempt.$id,
        user_id: attempt.user_id,
        card_id: attempt.card_id,
        deck_id: attempt.deck_id,
        quiz_mode: attempt.quiz_mode,
        score: attempt.score,
        total_questions: attempt.total_questions,
        wrong_answers: JSON.parse(attempt.wrong_answers || "[]"),
        completed_at: attempt.completed_at,
      };
    } catch (error) {
      console.error("Error logging quiz attempt:", error);
      throw error;
    }
  }

  /**
   * Update mistake patterns based on wrong answers
   */
  private static async updateMistakePatterns(
    wrongAnswers: WrongAnswer[],
  ): Promise<void> {
    try {
      const userId = await getUserId();

      for (const wrong of wrongAnswers) {
        // Extract subject and topic from concept_id
        // Format: subject.topic.concept (e.g., "biology.cell.mitochondria")
        const parts = wrong.concept_id.split(".");
        const subject = parts[0] || "general";
        const topic = parts[1] || "general";

        // Check if pattern exists
        const existing = await databases.listDocuments(
          DATABASE_ID,
          MISTAKE_PATTERNS_COLLECTION,
          [
            Query.equal("user_id", userId),
            Query.equal("concept_id", wrong.concept_id),
          ],
        );

        if (existing.documents.length > 0) {
          // Update existing pattern
          const pattern = existing.documents[0];
          const relatedQuestions = JSON.parse(
            pattern.related_questions || "[]",
          );

          await databases.updateDocument(
            DATABASE_ID,
            MISTAKE_PATTERNS_COLLECTION,
            pattern.$id,
            {
              mistake_count: pattern.mistake_count + 1,
              last_occurrence: new Date().toISOString(),
              related_questions: JSON.stringify([
                ...new Set([...relatedQuestions, wrong.question_id]),
              ]),
            },
          );
        } else {
          // Create new pattern
          await databases.createDocument(
            DATABASE_ID,
            MISTAKE_PATTERNS_COLLECTION,
            ID.unique(),
            {
              user_id: userId,
              subject,
              topic,
              concept_id: wrong.concept_id,
              mistake_count: 1,
              last_occurrence: new Date().toISOString(),
              related_questions: JSON.stringify([wrong.question_id]),
            },
          );
        }
      }
    } catch (error) {
      console.error("Error updating mistake patterns:", error);
      throw error;
    }
  }

  /**
   * Get user's quiz attempts
   */
  static async getUserAttempts(limit = 20): Promise<QuizAttempt[]> {
    try {
      const userId = await getUserId();

      const response = await databases.listDocuments(
        DATABASE_ID,
        QUIZ_ATTEMPTS_COLLECTION,
        [
          Query.equal("user_id", userId),
          Query.orderDesc("completed_at"),
          Query.limit(limit),
        ],
      );

      return response.documents.map((doc) => ({
        attempt_id: doc.$id,
        user_id: doc.user_id,
        card_id: doc.card_id,
        deck_id: doc.deck_id,
        quiz_mode: doc.quiz_mode,
        score: doc.score,
        total_questions: doc.total_questions,
        wrong_answers: JSON.parse(doc.wrong_answers || "[]"),
        completed_at: doc.completed_at,
      }));
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      throw error;
    }
  }

  /**
   * Get user's mistake patterns
   */
  static async getMistakePatterns(subject?: string): Promise<MistakePattern[]> {
    try {
      const userId = await getUserId();

      const queries = [
        Query.equal("user_id", userId),
        Query.orderDesc("mistake_count"),
      ];

      if (subject) {
        queries.push(Query.equal("subject", subject));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        MISTAKE_PATTERNS_COLLECTION,
        queries,
      );

      return response.documents.map((doc) => ({
        pattern_id: doc.$id,
        user_id: doc.user_id,
        subject: doc.subject,
        topic: doc.topic,
        concept_id: doc.concept_id,
        mistake_count: doc.mistake_count,
        last_occurrence: doc.last_occurrence,
        related_questions: JSON.parse(doc.related_questions || "[]"),
      }));
    } catch (error) {
      console.error("Error fetching mistake patterns:", error);
      throw error;
    }
  }
}
