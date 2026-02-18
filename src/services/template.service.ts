/**
 * Template Service
 * Handles template-based deck creation
 */

import type { FlashcardTemplate } from "../config/templates.config";
import { getTemplateById } from "../config/templates.config";
import type {
  CreateFlashcardDTO,
  FlashcardDeck,
} from "../types/flashcard.types";
import { FlashcardService } from "./flashcard.service";

export class TemplateService {
  /**
   * Create a deck from a template
   */
  static async createDeckFromTemplate(
    userId: string,
    templateId: string,
  ): Promise<FlashcardDeck | null> {
    try {
      const template = getTemplateById(templateId);
      if (!template) {
        console.error("Template not found:", templateId);
        return null;
      }

      // Create the deck
      const deck = await FlashcardService.createDeck(userId, {
        title: template.title,
        description: template.description,
        category: template.category,
        is_public: false,
      });

      // Create all flashcards from template
      const cardPromises = template.cards.map((card, index) => {
        const cardData: CreateFlashcardDTO = {
          deck_id: deck.deck_id,
          front_content: card.front_content,
          back_content: card.back_content,
          difficulty: card.difficulty,
          tags: card.tags,
        };
        return FlashcardService.createFlashcard(cardData);
      });

      await Promise.all(cardPromises);

      // Refresh deck to get updated card count
      const updatedDeck = await FlashcardService.getDeck(deck.deck_id);
      return updatedDeck;
    } catch (error) {
      console.error("Error creating deck from template:", error);
      return null;
    }
  }

  /**
   * Get template preview (without creating deck)
   */
  static getTemplatePreview(templateId: string): FlashcardTemplate | null {
    return getTemplateById(templateId) || null;
  }
}
