/**
 * Flashcard Service
 * Handles all flashcard-related database operations
 */

import { ID, Query } from 'react-native-appwrite';
import { COLLECTIONS } from '../config/appwrite.config';
import type {
    CreateDeckDTO,
    CreateFlashcardDTO,
    Flashcard,
    FlashcardDeck,
    PaginatedResponse,
    UpdateDeckDTO,
    UpdateFlashcardDTO,
} from '../types/flashcard.types';
import { DATABASE_ID, databases } from './appwrite';

export class FlashcardService {
  // Deck Operations
  static async createDeck(userId: string, data: CreateDeckDTO): Promise<FlashcardDeck> {
    const now = new Date().toISOString();
    
    const deck = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      ID.unique(),
      {
        deck_id: ID.unique(),
        user_id: userId,
        title: data.title,
        description: data.description || '',
        category: data.category || '',
        is_public: data.is_public || false,
        card_count: 0,
        created_at: now,
        updated_at: now,
      }
    );

    return deck as unknown as FlashcardDeck;
  }

  static async getDeck(deckId: string): Promise<FlashcardDeck> {
    const deck = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      deckId
    );

    return deck as unknown as FlashcardDeck;
  }

  static async listUserDecks(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<FlashcardDeck>> {
    const offset = (page - 1) * limit;

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      [
        Query.equal('user_id', userId),
        Query.orderDesc('updated_at'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return {
      items: response.documents as unknown as FlashcardDeck[],
      total: response.total,
      page,
      limit,
      hasMore: offset + response.documents.length < response.total,
    };
  }

  static async updateDeck(deckId: string, data: UpdateDeckDTO): Promise<FlashcardDeck> {
    const deck = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      deckId,
      {
        ...data,
        updated_at: new Date().toISOString(),
      }
    );

    return deck as unknown as FlashcardDeck;
  }

  static async deleteDeck(deckId: string): Promise<void> {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      deckId
    );
  }

  // Flashcard Operations
  static async createFlashcard(data: CreateFlashcardDTO): Promise<Flashcard> {
    const now = new Date().toISOString();

    // Get current card count for order_index
    const existingCards = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      [Query.equal('deck_id', data.deck_id)]
    );

    const card = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      ID.unique(),
      {
        card_id: ID.unique(),
        deck_id: data.deck_id,
        front_content: data.front_content,
        back_content: data.back_content,
        difficulty: data.difficulty || 'medium',
        tags: data.tags || [],
        order_index: existingCards.total,
        created_at: now,
        updated_at: now,
      }
    );

    // Update deck card count
    await this.updateDeck(data.deck_id, {
      card_count: existingCards.total + 1,
    });

    return card as unknown as Flashcard;
  }

  static async listDeckCards(deckId: string): Promise<Flashcard[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      [
        Query.equal('deck_id', deckId),
        Query.orderAsc('order_index'),
      ]
    );

    return response.documents as unknown as Flashcard[];
  }

  static async updateFlashcard(cardId: string, data: UpdateFlashcardDTO): Promise<Flashcard> {
    const card = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      cardId,
      {
        ...data,
        updated_at: new Date().toISOString(),
      }
    );

    return card as unknown as Flashcard;
  }

  static async deleteFlashcard(cardId: string, deckId: string): Promise<void> {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      cardId
    );

    // Update deck card count
    const cards = await this.listDeckCards(deckId);
    await this.updateDeck(deckId, {
      card_count: cards.length,
    });
  }

  // Bulk create flashcards (for AI generation)
  static async createFlashcardsBulk(deckId: string, flashcards: CreateFlashcardDTO[]): Promise<Flashcard[]> {
    const createdCards: Flashcard[] = [];

    for (const cardData of flashcards) {
      const card = await this.createFlashcard({
        ...cardData,
        deck_id: deckId,
      });
      createdCards.push(card);
    }

    return createdCards;
  }
}
