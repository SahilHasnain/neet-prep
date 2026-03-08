/**
 * useLabels Hook
 * Manages diagram labels state and operations
 */

import { useEffect, useState } from "react";

// Placeholder types until label service is implemented
export interface DiagramLabel {
  label_id: string;
  card_id: string;
  x: number;
  y: number;
  text: string;
  created_at: string;
}

export interface CreateLabelDTO {
  card_id: string;
  x: number;
  y: number;
  text: string;
}

export interface UpdateLabelDTO {
  x?: number;
  y?: number;
  text?: string;
}

// Placeholder service until implemented
const LabelService = {
  async getCardLabels(cardId: string): Promise<DiagramLabel[]> {
    console.warn('LabelService not implemented yet');
    return [];
  },
  async createLabel(data: CreateLabelDTO): Promise<DiagramLabel> {
    console.warn('LabelService not implemented yet');
    throw new Error('Not implemented');
  },
  async updateLabel(labelId: string, data: UpdateLabelDTO): Promise<DiagramLabel> {
    console.warn('LabelService not implemented yet');
    throw new Error('Not implemented');
  },
  async deleteLabel(labelId: string): Promise<void> {
    console.warn('LabelService not implemented yet');
  },
  async createLabelsBulk(labelsData: CreateLabelDTO[]): Promise<DiagramLabel[]> {
    console.warn('LabelService not implemented yet');
    return [];
  }
};

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
    data: CreateLabelDTO
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
