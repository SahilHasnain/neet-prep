/**
 * Doubt Service
 * Handles doubt submission and retrieval
 */

import { Query } from "react-native-appwrite";
import { COLLECTIONS, DATABASE_ID } from "../config/appwrite.config";
import type { ApiResponse } from "../types/flashcard.types";
import { databases } from "./appwrite";

interface DoubtSubmission {
  doubt_text: string;
  context?: string;
  card_id?: string;
  deck_id?: string;
}

interface DoubtResponse {
  doubt_id: string;
  answer: string;
  examples: string[];
  related_concepts: string[];
}

interface Doubt {
  doubt_id: string;
  user_id: string;
  card_id?: string;
  deck_id?: string;
  doubt_text: string;
  context?: string;
  explanation: string;
  examples: string[];
  related_concepts: string[];
  created_at: string;
}

export class DoubtService {
  static async submitDoubt(
    userId: string,
    data: DoubtSubmission,
  ): Promise<ApiResponse<DoubtResponse>> {
    try {
      const functionUrl = process.env.EXPO_PUBLIC_RESOLVE_DOUBT_FUNCTION_URL;

      if (!functionUrl) {
        throw new Error("Doubt resolution function URL not configured");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          doubt_text: data.doubt_text,
          context: data.context,
          card_id: data.card_id,
          deck_id: data.deck_id,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Empty response from server");
      }

      const result = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Failed to resolve doubt",
        );
      }

      return result;
    } catch (error) {
      console.error("Doubt Service Error:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            error: "Request timeout",
            message: "The AI took too long to respond. Please try again.",
          };
        }

        return {
          success: false,
          error: "Failed to resolve doubt",
          message: error.message,
        };
      }

      return {
        success: false,
        error: "Failed to resolve doubt",
        message: "Unknown error occurred",
      };
    }
  }

  static async getUserDoubts(userId: string): Promise<Doubt[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOUBTS,
        [
          Query.equal("user_id", userId),
          Query.orderDesc("created_at"),
          Query.limit(50),
        ],
      );

      return response.documents.map((doc: any) => ({
        doubt_id: doc.doubt_id,
        user_id: doc.user_id,
        card_id: doc.card_id,
        deck_id: doc.deck_id,
        doubt_text: doc.doubt_text,
        context: doc.context,
        explanation: doc.explanation,
        examples: JSON.parse(doc.examples || "[]"),
        related_concepts: JSON.parse(doc.related_concepts || "[]"),
        created_at: doc.created_at,
      }));
    } catch (error) {
      console.error("Error fetching user doubts:", error);
      return [];
    }
  }

  static async getCardDoubts(cardId: string): Promise<Doubt[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOUBTS,
        [
          Query.equal("card_id", cardId),
          Query.orderDesc("created_at"),
          Query.limit(10),
        ],
      );

      return response.documents.map((doc: any) => ({
        doubt_id: doc.doubt_id,
        user_id: doc.user_id,
        card_id: doc.card_id,
        deck_id: doc.deck_id,
        doubt_text: doc.doubt_text,
        context: doc.context,
        explanation: doc.explanation,
        examples: JSON.parse(doc.examples || "[]"),
        related_concepts: JSON.parse(doc.related_concepts || "[]"),
        created_at: doc.created_at,
      }));
    } catch (error) {
      console.error("Error fetching card doubts:", error);
      return [];
    }
  }

  static async getDoubtPatterns(userId: string): Promise<
    Array<{
      card_id: string;
      doubt_count: number;
      latest_doubt: string;
      context: string;
    }>
  > {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOUBTS,
        [Query.equal("user_id", userId), Query.orderDesc("created_at")],
      );

      // Group by card_id and count
      const doubtMap = new Map<
        string,
        { count: number; latest: string; context: string }
      >();

      response.documents.forEach((doc: any) => {
        const cardId = doc.card_id || "general";
        const existing = doubtMap.get(cardId);

        if (existing) {
          existing.count++;
        } else {
          doubtMap.set(cardId, {
            count: 1,
            latest: doc.doubt_text,
            context: doc.context || "",
          });
        }
      });

      // Convert to array and sort by count
      return Array.from(doubtMap.entries())
        .map(([card_id, data]) => ({
          card_id,
          doubt_count: data.count,
          latest_doubt: data.latest,
          context: data.context,
        }))
        .sort((a, b) => b.doubt_count - a.doubt_count)
        .slice(0, 10);
    } catch (error) {
      console.error("Error fetching doubt patterns:", error);
      return [];
    }
  }
}
