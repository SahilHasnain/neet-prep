/**
 * Label Service
 * Handles diagram label operations
 */

import { ID, Query } from "react-native-appwrite";
import { COLLECTIONS } from "../config/appwrite.config";
import type {
  CreateLabelDTO,
  DiagramLabel,
  UpdateLabelDTO,
} from "../types/flashcard.types";
import { DATABASE_ID, databases } from "./appwrite";

export class LabelService {
  /**
   * Create a new label for a flashcard
   */
  static async createLabel(data: CreateLabelDTO): Promise<DiagramLabel> {
    try {
      const labelId = ID.unique();
      const now = new Date().toISOString();

      const label = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FLASHCARD_LABELS,
        labelId,
        {
          label_id: labelId,
          card_id: data.card_id,
          label_text: data.label_text,
          x_position: data.x_position,
          y_position: data.y_position,
          order_index: data.order_index,
          created_at: now,
        },
      );

      return label as unknown as DiagramLabel;
    } catch (error) {
      console.error("Error creating label:", error);
      throw error;
    }
  }

  /**
   * Get all labels for a flashcard
   */
  static async getCardLabels(cardId: string): Promise<DiagramLabel[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FLASHCARD_LABELS,
        [Query.equal("card_id", cardId), Query.orderAsc("order_index")],
      );

      return response.documents as unknown as DiagramLabel[];
    } catch (error) {
      console.error("Error fetching labels:", error);
      throw error;
    }
  }

  /**
   * Update a label
   */
  static async updateLabel(
    labelId: string,
    data: UpdateLabelDTO,
  ): Promise<DiagramLabel> {
    try {
      const label = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FLASHCARD_LABELS,
        labelId,
        data,
      );

      return label as unknown as DiagramLabel;
    } catch (error) {
      console.error("Error updating label:", error);
      throw error;
    }
  }

  /**
   * Delete a label
   */
  static async deleteLabel(labelId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.FLASHCARD_LABELS,
        labelId,
      );
    } catch (error) {
      console.error("Error deleting label:", error);
      throw error;
    }
  }

  /**
   * Delete all labels for a card
   */
  static async deleteCardLabels(cardId: string): Promise<void> {
    try {
      const labels = await this.getCardLabels(cardId);

      // Delete all labels
      await Promise.all(
        labels.map((label) => this.deleteLabel(label.label_id)),
      );
    } catch (error) {
      console.error("Error deleting card labels:", error);
      throw error;
    }
  }

  /**
   * Bulk create labels
   */
  static async createLabelsBulk(
    labels: CreateLabelDTO[],
  ): Promise<DiagramLabel[]> {
    try {
      const createdLabels: DiagramLabel[] = [];

      for (const labelData of labels) {
        const label = await this.createLabel(labelData);
        createdLabels.push(label);
      }

      return createdLabels;
    } catch (error) {
      console.error("Error creating labels in bulk:", error);
      throw error;
    }
  }
}
