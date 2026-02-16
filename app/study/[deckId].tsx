import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlashCard } from '../../src/components/flashcard/FlashCard';
import { ProgressBar } from '../../src/components/flashcard/ProgressBar';
import { Button } from '../../src/components/ui/Button';
import { useFlashcards } from '../../src/hooks/useFlashcards';
import { useProgress } from '../../src/hooks/useProgress';

const TEMP_USER_ID = 'temp-user-123';

export default function StudyScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const { flashcards, loading } = useFlashcards(deckId);
  const { updateProgress, getMasteryStats, refresh: refreshProgress } = useProgress(TEMP_USER_ID, deckId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const currentCard = flashcards[currentIndex];
  const stats = getMasteryStats();
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  useEffect(() => {
    refreshProgress();
  }, []);

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentCard) return;

    await updateProgress({
      card_id: currentCard.card_id,
      deck_id: deckId,
      is_correct: isCorrect,
    });

    setShowResult(false);
    setIsFlipped(false);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Study session complete
      router.back();
    }
  };

  const handleFlip = (flipped: boolean) => {
    setIsFlipped(flipped);
    if (flipped) {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Flashcards</Text>
        <Text style={styles.emptyText}>Add some flashcards to start studying!</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Exit Study</Text>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Card {currentIndex + 1} of {flashcards.length}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <ProgressBar
          mastered={stats.mastered}
          learning={stats.learning}
          newCards={stats.new}
          total={flashcards.length}
        />

        <View style={styles.cardContainer}>
          {currentCard && (
            <FlashCard
              front={currentCard.front_content}
              back={currentCard.back_content}
              onFlip={handleFlip}
            />
          )}
        </View>

        {showResult && isFlipped && (
          <View style={styles.answerButtons}>
            <TouchableOpacity
              style={[styles.answerButton, styles.wrongButton]}
              onPress={() => handleAnswer(false)}
            >
              <Text style={styles.answerButtonText}>❌ Wrong</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.answerButton, styles.correctButton]}
              onPress={() => handleAnswer(true)}
            >
              <Text style={styles.answerButtonText}>✅ Correct</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isFlipped && (
          <Text style={styles.hint}>Tap the card to see the answer</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrongButton: {
    backgroundColor: '#dc3545',
  },
  correctButton: {
    backgroundColor: '#34C759',
  },
  answerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginTop: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
});
