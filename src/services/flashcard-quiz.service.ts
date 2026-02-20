/**
 * Flashcard Quiz Service
 * Generates quiz questions for non-diagram flashcards
 */

import { FUNCTIONS } from "../config/appwrite.config";
import type {
  ApiResponse,
  Flashcard,
  FlashcardQuizQuestion,
  GenerateQuizQuestionsDTO,
} from "../types/flashcard.types";

export class FlashcardQuizService {
  /**
   * Generate quiz questions from flashcards
   */
  static async generateQuizQuestions(
    data: GenerateQuizQuestionsDTO,
  ): Promise<ApiResponse<{ questions: FlashcardQuizQuestion[] }>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const requestBody = {
        type: "quiz_questions",
        cards: data.cards,
        quiz_type: data.quiz_type,
        question_count: data.question_count,
      };

      console.log("Sending quiz generation request:", requestBody);

      const response = await fetch(FUNCTIONS.GENERATE_FLASHCARDS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      console.log("Quiz generation response:", responseText);

      if (!responseText) {
        throw new Error("Empty response from AI service");
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", responseText);
        throw new Error("Invalid JSON response from AI service");
      }

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Failed to generate quiz questions",
        );
      }

      return result;
    } catch (error) {
      console.error("Quiz Generation Error:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            error: "Request timeout",
            message:
              "The AI service took too long to respond. Please try again.",
          };
        }

        return {
          success: false,
          error: "Failed to generate quiz questions",
          message: error.message,
        };
      }

      return {
        success: false,
        error: "Failed to generate quiz questions",
        message: "Unknown error occurred",
      };
    }
  }

  /**
   * Generate mock quiz questions (fallback)
   */
  static generateMockQuestions(
    cards: Flashcard[],
    quizType: "mcq" | "true_false" | "fill_blank",
  ): FlashcardQuizQuestion[] {
    return cards.map((card, index) => {
      const questionId = `q_${card.card_id}_${index}`;

      if (quizType === "mcq") {
        return {
          question_id: questionId,
          card_id: card.card_id,
          type: "mcq",
          question: card.front_content,
          options: [
            card.back_content,
            "Option B (placeholder)",
            "Option C (placeholder)",
            "Option D (placeholder)",
          ],
          correct_answer: card.back_content,
        };
      } else if (quizType === "true_false") {
        return {
          question_id: questionId,
          card_id: card.card_id,
          type: "true_false",
          question: `${card.front_content}: ${card.back_content}`,
          correct_answer: "true",
        };
      } else {
        // fill_blank
        const words = card.back_content.split(" ");
        const keyWord = words[Math.floor(words.length / 2)] || "term";
        return {
          question_id: questionId,
          card_id: card.card_id,
          type: "fill_blank",
          question: `${card.front_content}: ${card.back_content.replace(keyWord, "_____")}`,
          correct_answer: keyWord,
        };
      }
    });
  }
}
