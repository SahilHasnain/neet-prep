/**
 * useLabels Hook
 * Manages diagram labels state and operations
 */

import { useEffect, useState } from "react";
import { LabelService } from "../services/label.service";
import type {
  CreateLabelDTO,
  DiagramLabel,
  UpdateLabelDTO,
} from "../types/flashcard.types";

export function useLabels(cardId: string) {
  const [labels, setLabels] = useState<DiagramLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLabels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LabelService.getCardLabels(cardId);
      setLabels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load labels");
    } finally {
      setLoading(false);
    }
  };

  const createLabel = async (
    data: CreateLabelDTO,
  ): Promise<DiagramLabel | null> => {
    try {
      const label = await LabelService.createLabel(data);
      setLabels((prev) => [...prev, label]);
      return label;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create label");
      return null;
    }
  };

  const updateLabel = async (
    labelId: string,
    data: UpdateLabelDTO,
  ): Promise<boolean> => {
    try {
      const updated = await LabelService.updateLabel(labelId, data);
      setLabels((prev) =>
        prev.map((l) => (l.label_id === labelId ? updated : l)),
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update label");
      return false;
    }
  };

  const deleteLabel = async (labelId: string): Promise<boolean> => {
    try {
      await LabelService.deleteLabel(labelId);
      setLabels((prev) => prev.filter((l) => l.label_id !== labelId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete label");
      return false;
    }
  };

  const createLabelsBulk = async (
    labelsData: CreateLabelDTO[],
  ): Promise<boolean> => {
    try {
      const created = await LabelService.createLabelsBulk(labelsData);
      setLabels((prev) => [...prev, ...created]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create labels");
      return false;
    }
  };

  useEffect(() => {
    if (cardId) {
      loadLabels();
    }
  }, [cardId]);

  return {
    labels,
    loading,
    error,
    createLabel,
    updateLabel,
    deleteLabel,
    createLabelsBulk,
    refresh: loadLabels,
  };
}
