/**
 * Remediation Service
 * Generates AI-powered remediation content for weak concepts
 */

import { FUNCTIONS } from "../config/appwrite.config";
import type {
  ApiResponse,
  GenerateRemediationDTO,
  RemediationContent,
} from "../types/flashcard.types";
import { getConceptDisplayName } from "../utils/concept-mapper";

// In-memory cache for remediation content (7 days)
const remediationCache = new Map<
  string,
  { content: RemediationContent; expiresAt: number }
>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export class RemediationService {
  /**
   * Generate remediation content for a weak concept
   */
  static async generateRemediation(
    data: GenerateRemediationDTO,
  ): Promise<ApiResponse<RemediationContent>> {
    try {
      // Check cache first
      const cached = remediationCache.get(data.concept_id);
      if (cached && cached.expiresAt > Date.now()) {
        console.log("Using cached remediation for", data.concept_id);
        return {
          success: true,
          data: cached.content,
        };
      }

      const conceptName = getConceptDisplayName(data.concept_id);

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(FUNCTIONS.GENERATE_FLASHCARDS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "remediation",
          concept_id: data.concept_id,
          concept_name: conceptName,
          subject: data.subject,
          topic: data.topic,
          mistake_count: data.mistake_count,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();

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
          result.message || result.error || "Failed to generate remediation",
        );
      }

      // Cache the result
      if (result.success && result.data) {
        remediationCache.set(data.concept_id, {
          content: result.data,
          expiresAt: Date.now() + CACHE_DURATION,
        });
      }

      return result;
    } catch (error) {
      console.error("Remediation Service Error:", error);

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
          error: "Failed to generate remediation",
          message: error.message,
        };
      }

      return {
        success: false,
        error: "Failed to generate remediation",
        message: "Unknown error occurred",
      };
    }
  }

  /**
   * Generate mock remediation content (fallback when AI is unavailable)
   */
  static generateMockRemediation(
    data: GenerateRemediationDTO,
  ): RemediationContent {
    const conceptName = getConceptDisplayName(data.concept_id);

    return {
      concept_id: data.concept_id,
      explanation: `${conceptName} is an important concept in ${data.subject}. Understanding this topic requires careful attention to the fundamental principles and their applications in NEET exam contexts.`,
      practice_questions: [
        {
          question: `Which of the following best describes ${conceptName}?`,
          options: [
            "Option A - Review your notes",
            "Option B - Study the diagram",
            "Option C - Practice more questions",
            "Option D - Consult your textbook",
          ],
          correct_answer: "Option C - Practice more questions",
          explanation:
            "Regular practice helps reinforce understanding of this concept.",
        },
        {
          question: `What is the primary function of ${conceptName}?`,
          options: ["Function A", "Function B", "Function C", "Function D"],
          correct_answer: "Function B",
          explanation:
            "This is a key aspect you should focus on during revision.",
        },
        {
          question: `In NEET exams, ${conceptName} is most commonly tested through:`,
          options: [
            "Diagram-based questions",
            "Numerical problems",
            "Conceptual questions",
            "All of the above",
          ],
          correct_answer: "All of the above",
          explanation:
            "NEET tests this concept in multiple formats, so comprehensive preparation is essential.",
        },
      ],
      misconception: `A common mistake is confusing ${conceptName} with related concepts. Make sure to understand the distinct characteristics and applications.`,
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Clear cache for a specific concept
   */
  static clearCache(conceptId: string): void {
    remediationCache.delete(conceptId);
  }

  /**
   * Clear all cached remediation content
   */
  static clearAllCache(): void {
    remediationCache.clear();
  }
}
