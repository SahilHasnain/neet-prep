/**
 * useAIDiagram Hook
 * Manages AI-powered diagram analysis
 */

import { useState } from "react";
import { AIDiagramService } from "../services/ai-diagram.service";
import type {
  DiagramLabel,
  DiagramQualityReport,
  LabelSuggestion,
} from "../types/flashcard.types";

export function useAIDiagram(userId: string, cardId: string) {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<LabelSuggestion[]>([]);
  const [qualityReport, setQualityReport] =
    useState<DiagramQualityReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Analyze diagram and get label suggestions
   */
  const analyzeDiagram = async (
    imageId: string,
    imageUrl: string,
    diagramType: string = "general",
  ) => {
    try {
      setAnalyzing(true);
      setError(null);
      setSuggestions([]);

      const response = await AIDiagramService.analyzeDiagram(
        imageId,
        imageUrl,
        userId,
        cardId,
        diagramType,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to analyze diagram");
      }

      const labels = response.data?.labels || [];
      setSuggestions(labels);

      return labels;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to analyze diagram";
      setError(errorMessage);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Apply selected label suggestions to the card
   */
  const applySuggestions = async (
    selectedIndices: number[],
  ): Promise<DiagramLabel[]> => {
    try {
      setError(null);

      const createdLabels = await AIDiagramService.applySuggestedLabels(
        cardId,
        suggestions,
        selectedIndices,
      );

      return createdLabels;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to apply suggestions";
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Assess diagram quality
   */
  const assessQuality = async (imageId: string, imageUrl: string) => {
    try {
      setAnalyzing(true);
      setError(null);
      setQualityReport(null);

      const response = await AIDiagramService.assessDiagramQuality(
        imageId,
        imageUrl,
        userId,
        cardId,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to assess quality");
      }

      const report = response.data!;
      setQualityReport(report);

      return report;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to assess quality";
      setError(errorMessage);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Clear suggestions and reset state
   */
  const clearSuggestions = () => {
    setSuggestions([]);
    setQualityReport(null);
    setError(null);
  };

  return {
    analyzing,
    suggestions,
    qualityReport,
    error,
    analyzeDiagram,
    applySuggestions,
    assessQuality,
    clearSuggestions,
  };
}
