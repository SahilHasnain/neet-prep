/**
 * useDecks Hook
 * Manages flashcard deck state and operations
 */

import { useCallback, useEffect, useState } from "react";
import { FlashcardService } from "../services/flashcard.service";
import type {
  CreateDeckDTO,
  FlashcardDeck,
  UpdateDeckDTO,
} from "../types/flashcard.types";

export function useDecks(userId: string) {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadDecks = useCallback(
    async (pageNum: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await FlashcardService.listUserDecks(userId, pageNum);

        if (pageNum === 1) {
          setDecks(response.items);
        } else {
          setDecks((prev) => [...prev, ...response.items]);
        }

        setHasMore(response.hasMore);
        setPage(pageNum);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load decks");
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const createDeck = async (
    data: CreateDeckDTO,
  ): Promise<FlashcardDeck | null> => {
    try {
      const deck = await FlashcardService.createDeck(userId, data);
      setDecks((prev) => [deck, ...prev]);
      return deck;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deck");
      return null;
    }
  };

  const updateDeck = async (
    deckId: string,
    data: UpdateDeckDTO,
  ): Promise<boolean> => {
    try {
      const updated = await FlashcardService.updateDeck(deckId, data);
      setDecks((prev) => prev.map((d) => (d.deck_id === deckId ? updated : d)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update deck");
      return false;
    }
  };

  const deleteDeck = async (deckId: string): Promise<boolean> => {
    try {
      await FlashcardService.deleteDeck(deckId);
      setDecks((prev) => prev.filter((d) => d.deck_id !== deckId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete deck");
      return false;
    }
  };

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadDecks(page + 1);
    }
  }, [hasMore, loading, loadDecks, page]);

  const refresh = useCallback(() => {
    loadDecks(1);
  }, [loadDecks]);

  useEffect(() => {
    if (userId) {
      loadDecks();
    }
  }, [loadDecks, userId]);

  return {
    decks,
    loading,
    error,
    hasMore,
    createDeck,
    updateDeck,
    deleteDeck,
    loadMore,
    refresh,
  };
}
