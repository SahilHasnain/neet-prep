/**
 * AI Diagram Service
 * Handles AI-powered diagram analysis via Appwrite Function
 */

import type {
  ApiResponse,
  CreateLabelDTO,
  DiagramLabel,
  LabelSuggestion,
} from "../types/flashcard.types";
import { LabelService } from "./label.service";

const ANALYZE_DIAGRAM_URL =
  process.env.EXPO_PUBLIC_ANALYZE_DIAGRAM_FUNCTION_URL!;

interface AnalyzeDiagramResponse {
  labels: LabelSuggestion[];
  count: number;
}

interface QualityCheckResponse {
  score: number;
  issues: string[];
  suggestions: string[];
  is_acceptable: boolean;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export class AIDiagramService {
  /**
   * Analyze diagram and get label suggestions
   */
  static async analyzeDiagram(
    imageId: string,
    imageUrl: string,
    userId: string,
    cardId: string,
    diagramType: string = "general",
  ): Promise<ApiResponse<AnalyzeDiagramResponse>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch(ANALYZE_DIAGRAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId,
          imageUrl,
          userId,
          cardId,
          diagramType,
          mode: "label_detection",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();

      if (!responseText) {
        throw new Error(
          "Empty response from server. Please check if the function is deployed.",
        );
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", responseText);
        throw new Error(
          `Invalid JSON response: ${responseText.substring(0, 100)}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Failed to analyze diagram",
        );
      }

      return result;
    } catch (error) {
      console.error("AI Diagram Service Error:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            error: "Request timeout",
            message: "The AI analysis took too long. Please try again.",
          };
        }

        return {
          success: false,
          error: "Failed to analyze diagram",
          message: error.message,
        };
      }

      return {
        success: false,
        error: "Failed to analyze diagram",
        message: "Unknown error occurred",
      };
    }
  }

  /**
   * Apply suggested labels to card
   */
  static async applySuggestedLabels(
    cardId: string,
    suggestions: LabelSuggestion[],
    selectedIndices: number[],
  ): Promise<DiagramLabel[]> {
    try {
      const selectedSuggestions = selectedIndices.map((i) => suggestions[i]);

      const labelDTOs: CreateLabelDTO[] = selectedSuggestions.map(
        (suggestion, index) => ({
          card_id: cardId,
          label_text: suggestion.label_text,
          x_position: suggestion.x_position,
          y_position: suggestion.y_position,
          order_index: index,
        }),
      );

      const createdLabels = await LabelService.createLabelsBulk(labelDTOs);
      return createdLabels;
    } catch (error) {
      console.error("Error applying suggested labels:", error);
      throw error;
    }
  }

  /**
   * Get diagram quality assessment
   */
  static async assessDiagramQuality(
    imageId: string,
    imageUrl: string,
    userId: string,
    cardId: string,
  ): Promise<ApiResponse<QualityCheckResponse>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(ANALYZE_DIAGRAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId,
          imageUrl,
          userId,
          cardId,
          mode: "quality_check",
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
          result.message || result.error || "Failed to check quality",
        );
      }

      return result;
    } catch (error) {
      console.error("Quality Check Error:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            error: "Request timeout",
            message: "Quality check took too long. Please try again.",
          };
        }

        return {
          success: false,
          error: "Failed to check quality",
          message: error.message,
        };
      }

      return {
        success: false,
        error: "Failed to check quality",
        message: "Unknown error occurred",
      };
    }
  }
}
