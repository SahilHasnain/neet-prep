/**
 * useFlashcards Hook
 * Manages flashcard state and operations for a specific deck
 */

import { useEffect, useState } from 'react';
import { FlashcardService } from '../services/flashcard.service';
import type { CreateFlashcardDTO, Flashcard, UpdateFlashcardDTO } from '../types/flashcard.types';

export function useFlashcards(deckId: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);
      const cards = await FlashcardService.listDeckCards(deckId);
      setFlashcards(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const createFlashcard = async (data: CreateFlashcardDTO): Promise<Flashcard | null> => {
    try {
      const card = await FlashcardService.createFlashcard({
        ...data,
        deck_id: deckId,
      });
      setFlashcards(prev => [...prev, card]);
      return card;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flashcard');
      return null;
    }
  };

  const updateFlashcard = async (cardId: string, data: UpdateFlashcardDTO): Promise<boolean> => {
    try {
      const updated = await FlashcardService.updateFlashcard(cardId, data);
      setFlashcards(prev => prev.map(c => c.card_id === cardId ? updated : c));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update flashcard');
      return false;
    }
  };

  const deleteFlashcard = async (cardId: string): Promise<boolean> => {
    try {
      await FlashcardService.deleteFlashcard(cardId, deckId);
      setFlashcards(prev => prev.filter(c => c.card_id !== cardId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete flashcard');
      return false;
    }
  };

  const createFlashcardsBulk = async (cards: CreateFlashcardDTO[]): Promise<boolean> => {
    try {
      const created = await FlashcardService.createFlashcardsBulk(deckId, cards);
      setFlashcards(prev => [...prev, ...created]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flashcards');
      return false;
    }
  };

  const refresh = () => {
    loadFlashcards();
  };

  useEffect(() => {
    if (deckId) {
      loadFlashcards();
    }
  }, [deckId]);

  return {
    flashcards,
    loading,
    error,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    createFlashcardsBulk,
    refresh,
  };
}
