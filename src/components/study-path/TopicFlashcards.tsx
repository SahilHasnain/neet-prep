/**
 * Topic Flashcards Component
 * Displays and manages flashcards for a specific study path topic
 */

import { THEME_CLASSES } from '@/src/config/theme.config';
import { useFlashcards } from '@/src/hooks/useFlashcards';
import { FlashcardService } from '@/src/services/flashcard.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { FlashcardDeck } from '../../types/flashcard.types';

interface TopicFlashcardsProps {
  topicId: string;
  topicName: string;
  userId: string;
}

export function TopicFlashcards({ topicId, topicName, userId }: TopicFlashcardsProps) {
  const router = useRouter();
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState(true);

  // Load or create deck for this topic
  useEffect(() => {
    loadTopicDeck();
  }, [topicId]);

  const loadTopicDeck = async () => {
    try {
      setLoading(true);
      
      // Try to find existing deck for this topic
      const decks = await FlashcardService.getDecksByTopic(topicId);
      
      if (decks.length > 0) {
        setDeck(decks[0]);
      } else {
        setDeck(null);
      }
    } catch (error) {
      console.error('Error loading topic deck:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTopicDeck = async () => {
    try {
      const newDeck = await FlashcardService.createTopicDeck(
        userId,
        topicId,
        {
          title: `${topicName} - Flashcards`,
          description: `Flashcards for ${topicName}`,
          category: topicName,
        }
      );
      
      setDeck(newDeck);
      Alert.alert('Success', 'Flashcard deck created!');
    } catch (error) {
      console.error('Error creating deck:', error);
      Alert.alert('Error', 'Failed to create flashcard deck');
    }
  };

  const { flashcards, loading: cardsLoading } = useFlashcards(deck?.deck_id || '');

  if (loading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className={`${THEME_CLASSES.bodySmall} mt-2`}>Loading flashcards...</Text>
      </View>
    );
  }

  if (!deck) {
    return (
      <View className={`${THEME_CLASSES.card} items-center py-8`}>
        <View className="w-20 h-20 rounded-full bg-accent-primary/20 items-center justify-center mb-4">
          <Ionicons name="albums" size={40} color="#8b5cf6" />
        </View>
        <Text className={`${THEME_CLASSES.heading3} mb-2 text-center`}>
          No Flashcards Yet
        </Text>
        <Text className={`${THEME_CLASSES.body} mb-4 text-center`}>
          Create flashcards to practice this topic
        </Text>
        <TouchableOpacity
          onPress={createTopicDeck}
          className={THEME_CLASSES.buttonPrimary}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text className="text-white text-base font-semibold ml-2">
            Create Flashcard Deck
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const diagramCount = flashcards.filter(c => c.has_image).length;
  const textCount = flashcards.length - diagramCount;

  return (
    <View>
      {/* Deck Stats */}
      <View className={`${THEME_CLASSES.card} mb-4`}>
        <View className="flex-row items-center justify-between mb-3">
          <Text className={THEME_CLASSES.heading3}>Flashcard Deck</Text>
          <TouchableOpacity
            onPress={() => router.push(`/deck/${deck.deck_id}` as any)}
            className="flex-row items-center"
          >
            <Text className="text-accent-primary text-sm font-semibold mr-1">
              Manage
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 bg-background-tertiary rounded-lg p-3">
            <Text className="text-2xl font-bold text-accent-primary">
              {flashcards.length}
            </Text>
            <Text className={THEME_CLASSES.caption}>Total Cards</Text>
          </View>
          <View className="flex-1 bg-background-tertiary rounded-lg p-3">
            <Text className="text-2xl font-bold text-accent-secondary">
              {textCount}
            </Text>
            <Text className={THEME_CLASSES.caption}>Text</Text>
          </View>
          <View className="flex-1 bg-background-tertiary rounded-lg p-3">
            <Text className="text-2xl font-bold text-accent-success">
              {diagramCount}
            </Text>
            <Text className={THEME_CLASSES.caption}>Diagram</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      {flashcards.length > 0 ? (
        <View className="space-y-3">
          <TouchableOpacity
            onPress={() => router.push(`/study/${deck.deck_id}` as any)}
            className="bg-accent-primary rounded-xl p-4 flex-row items-center justify-between active:bg-accent-primary/80"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                <Ionicons name="book" size={24} color="#fff" />
              </View>
              <View>
                <Text className="text-white text-base font-semibold">Study Mode</Text>
                <Text className="text-white/70 text-sm">Review all flashcards</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/quiz/${deck.deck_id}` as any)}
            className="bg-accent-secondary rounded-xl p-4 flex-row items-center justify-between active:bg-accent-secondary/80"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                <Ionicons name="trophy" size={24} color="#fff" />
              </View>
              <View>
                <Text className="text-white text-base font-semibold">Quiz Mode</Text>
                <Text className="text-white/70 text-sm">Test your knowledge</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/deck/${deck.deck_id}` as any)}
            className="bg-background-secondary rounded-xl p-4 flex-row items-center justify-between border border-border-subtle active:bg-interactive-hover"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-accent-primary/20 items-center justify-center mr-3">
                <Ionicons name="add-circle" size={24} color="#8b5cf6" />
              </View>
              <View>
                <Text className={`${THEME_CLASSES.heading3}`}>Add More Cards</Text>
                <Text className={THEME_CLASSES.caption}>Create or generate with AI</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#717171" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="bg-accent-warning/10 border border-accent-warning/30 rounded-xl p-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#f59e0b" />
            <Text className="ml-2 text-accent-warning font-semibold">No Cards Yet</Text>
          </View>
          <Text className={THEME_CLASSES.bodySmall}>
            Add flashcards to start practicing this topic
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/deck/${deck.deck_id}` as any)}
            className="mt-3 bg-accent-warning rounded-lg p-3 items-center active:bg-accent-warning/80"
          >
            <Text className="text-white font-semibold">Add Flashcards</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Cards Preview */}
      {flashcards.length > 0 && (
        <View className="mt-4">
          <Text className={`${THEME_CLASSES.heading3} mb-3`}>Recent Cards</Text>
          {flashcards.slice(0, 3).map((card) => (
            <View
              key={card.card_id}
              className="bg-background-secondary rounded-lg p-3 mb-2 border border-border-subtle"
            >
              {card.has_image && card.image_url ? (
                <View className="flex-row gap-3">
                  <Image
                    source={{ uri: card.image_url }}
                    className="w-16 h-16 rounded-lg"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <View className="bg-accent-secondary/20 self-start px-2 py-1 rounded mb-1">
                      <Text className="text-accent-secondary text-xs font-semibold">
                        Diagram
                      </Text>
                    </View>
                    <Text className={THEME_CLASSES.bodySmall} numberOfLines={2}>
                      {card.back_content}
                    </Text>
                  </View>
                </View>
              ) : (
                <View>
                  <View className="bg-accent-primary/20 self-start px-2 py-1 rounded mb-2">
                    <Text className="text-accent-primary text-xs font-semibold">
                      Text
                    </Text>
                  </View>
                  <Text className={`${THEME_CLASSES.body} font-semibold mb-1`} numberOfLines={1}>
                    {card.front_content}
                  </Text>
                  <Text className={THEME_CLASSES.bodySmall} numberOfLines={2}>
                    {card.back_content}
                  </Text>
                </View>
              )}
            </View>
          ))}
          {flashcards.length > 3 && (
            <TouchableOpacity
              onPress={() => router.push(`/deck/${deck.deck_id}` as any)}
              className="mt-2 py-2 items-center"
            >
              <Text className="text-accent-primary font-semibold">
                View All {flashcards.length} Cards →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
