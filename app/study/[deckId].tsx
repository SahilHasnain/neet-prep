import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashCard } from "../../src/components/flashcard/FlashCard";
import { ProgressBar } from "../../src/components/flashcard/ProgressBar";
import { Button } from "../../src/components/ui/Button";
import { useFlashcards } from "../../src/hooks/useFlashcards";
import { useProgress } from "../../src/hooks/useProgress";

export default function StudyScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const { flashcards, loading } = useFlashcards(deckId);
  const {
    updateProgress,
    getMasteryStats,
    refresh: refreshProgress,
  } = useProgress(userId || "", deckId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [shuffledCards, setShuffledCards] = useState(flashcards);
  const [isShuffled, setIsShuffled] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    wrong: 0,
    startTime: Date.now(),
  });

  const currentCard = shuffledCards[currentIndex];
  const stats = getMasteryStats(shuffledCards.length);
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  // Initialize user ID on mount
  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  useEffect(() => {
    if (userId) {
      refreshProgress();
    }
  }, [userId]);

  useEffect(() => {
    setShuffledCards(flashcards);
  }, [flashcards]);

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowResult(false);
    setIsShuffled(true);
  };

  const resetOrder = () => {
    setShuffledCards(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowResult(false);
    setIsShuffled(false);
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentCard) return;

    // Update session stats
    setSessionStats((prev) => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
    }));

    await updateProgress({
      card_id: currentCard.card_id,
      deck_id: deckId,
      is_correct: isCorrect,
    });

    setShowResult(false);
    setIsFlipped(false);

    if (currentIndex < shuffledCards.length - 1) {
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

  if (loading || !userId) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (flashcards.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Flashcards</Text>
        <Text style={styles.emptyText}>
          Add some flashcards to start studying!
        </Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Exit</Text>
          </TouchableOpacity>

          <View style={styles.sessionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>✅ {sessionStats.correct}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>❌ {sessionStats.wrong}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={isShuffled ? resetOrder : shuffleCards}
            style={styles.shuffleButton}
          >
            <Text style={styles.shuffleButtonText}>
              {isShuffled ? "🔄" : "🔀"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Card {currentIndex + 1} of {shuffledCards.length}
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
          total={shuffledCards.length}
        />

        <View style={styles.cardContainer}>
          {currentCard && (
            <FlashCard
              key={currentCard.card_id}
              front={currentCard.front_content}
              back={currentCard.back_content}
              imageUrl={currentCard.image_url}
              hasImage={currentCard.has_image}
              cardId={currentCard.card_id}
              onFlip={handleFlip}
            />
          )}
        </View>

        {!isFlipped && (
          <View style={styles.hintContainer}>
            <Text style={styles.hint}>👆 Tap the card to see the answer</Text>
          </View>
        )}

        {showResult && isFlipped && (
          <View style={styles.answerButtons}>
            <TouchableOpacity
              style={[styles.answerButton, styles.wrongButton]}
              onPress={() => handleAnswer(false)}
            >
              <Text style={styles.answerButtonIcon}>❌</Text>
              <Text style={styles.answerButtonText}>Hard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.answerButton, styles.correctButton]}
              onPress={() => handleAnswer(true)}
            >
              <Text style={styles.answerButtonIcon}>✅</Text>
              <Text style={styles.answerButtonText}>Easy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 32,
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  sessionStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#d1d5db",
  },
  shuffleButton: {
    backgroundColor: "#3b82f6",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  shuffleButtonText: {
    fontSize: 20,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
  },
  hintContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
  },
  hint: {
    textAlign: "center",
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  answerButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  wrongButton: {
    backgroundColor: "#ef4444",
  },
  correctButton: {
    backgroundColor: "#10b981",
  },
  answerButtonIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  answerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
});
