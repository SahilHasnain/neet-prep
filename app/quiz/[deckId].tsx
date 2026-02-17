/**
 * Quiz Mode Screen
 * Interactive quiz for diagram flashcards
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DiagramQuiz } from "../../src/components/diagram/DiagramQuiz";
import { QuizResults } from "../../src/components/diagram/QuizResults";
import { useFlashcards } from "../../src/hooks/useFlashcards";
import { LabelService } from "../../src/services/label.service";
import type { DiagramLabel } from "../../src/types/flashcard.types";

interface QuizResult {
  label_id: string;
  is_correct: boolean;
  user_answer: string;
  correct_answer: string;
}

export default function QuizModeScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const { flashcards, loading } = useFlashcards(deckId);

  const [quizMode, setQuizMode] = useState<
    "label-quiz" | "identification-quiz" | null
  >(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [labels, setLabels] = useState<DiagramLabel[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[] | null>(null);
  const [loadingLabels, setLoadingLabels] = useState(false);

  // Filter only diagram cards
  const diagramCards = flashcards.filter(
    (card) => card.has_image && card.image_url,
  );

  const currentCard = diagramCards[currentCardIndex];

  console.log("Quiz Debug:", {
    totalCards: flashcards.length,
    diagramCards: diagramCards.length,
    currentCardIndex,
    quizMode,
    labelsCount: labels.length,
    loadingLabels,
    currentCard: currentCard?.card_id,
    firstDiagramCard: diagramCards[0]?.card_id,
    firstCardHasImage: diagramCards[0]?.has_image,
    firstCardImageUrl: diagramCards[0]?.image_url,
  });

  useEffect(() => {
    console.log("useEffect triggered:", {
      currentCard: currentCard?.card_id,
      quizMode,
    });
    if (currentCard && quizMode) {
      console.log("Calling loadLabels");
      loadLabels();
    }
  }, [currentCard?.card_id, quizMode]);

  const loadLabels = async () => {
    if (!currentCard) return;

    try {
      setLoadingLabels(true);
      console.log("Loading labels for card:", currentCard.card_id);
      const cardLabels = await LabelService.getCardLabels(currentCard.card_id);
      console.log("Loaded labels:", cardLabels.length);
      setLabels(cardLabels);

      if (cardLabels.length === 0) {
        // Automatically skip to next card if no labels
        if (currentCardIndex < diagramCards.length - 1) {
          console.log("No labels found, skipping to next card");
          setCurrentCardIndex(currentCardIndex + 1);
          setLabels([]);
        } else {
          // No more cards to try
          Alert.alert(
            "No Labeled Diagrams",
            "None of the diagram cards have labels. Please add labels to diagrams before using quiz mode.",
            [{ text: "OK", onPress: handleExit }],
          );
        }
      }
    } catch (error) {
      console.error("Error loading labels:", error);
      Alert.alert("Error", "Failed to load diagram labels");
    } finally {
      setLoadingLabels(false);
    }
  };

  const handleQuizComplete = (results: QuizResult[]) => {
    setQuizResults(results);
  };

  const handleRetry = () => {
    setQuizResults(null);
  };

  const handleExit = () => {
    router.back();
  };

  const handleNextCard = () => {
    if (currentCardIndex < diagramCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setQuizResults(null);
      setLabels([]);
    } else {
      Alert.alert("Complete", "You've completed all diagram quizzes!", [
        { text: "OK", onPress: handleExit },
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (diagramCards.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Diagram Cards</Text>
        <Text style={styles.emptyText}>
          Add diagram flashcards to use quiz mode!
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleExit}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Mode selection screen
  if (!quizMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExit} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Quiz Mode</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            {diagramCards.length} diagram card
            {diagramCards.length !== 1 ? "s" : ""} available
          </Text>
          <Text style={styles.warningText}>
            ⚠️ Note: Only diagrams with labels can be quizzed. If a diagram has
            no labels, you'll be prompted to skip it.
          </Text>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => setQuizMode("label-quiz")}
          >
            <Text style={styles.modeIcon}>🏷️</Text>
            <Text style={styles.modeTitle}>Label Quiz</Text>
            <Text style={styles.modeDescription}>
              See numbered dots on the diagram and type the correct label name
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => setQuizMode("identification-quiz")}
          >
            <Text style={styles.modeIcon}>📍</Text>
            <Text style={styles.modeTitle}>Identification Quiz</Text>
            <Text style={styles.modeDescription}>
              Read the label name and tap the correct position on the diagram
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show results screen
  if (quizResults) {
    return (
      <SafeAreaView style={styles.container}>
        <QuizResults
          results={quizResults}
          onRetry={handleRetry}
          onExit={
            currentCardIndex < diagramCards.length - 1
              ? handleNextCard
              : handleExit
          }
        />
      </SafeAreaView>
    );
  }

  // Show quiz
  if (loadingLabels) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </SafeAreaView>
    );
  }

  if (labels.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Labels Found</Text>
        <Text style={styles.emptyText}>
          This diagram doesn't have any labels yet.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleExit}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DiagramQuiz
        imageUrl={currentCard.image_url!}
        labels={labels}
        mode={quizMode}
        onComplete={handleQuizComplete}
        onExit={handleExit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 32,
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: "#007AFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  warningText: {
    fontSize: 14,
    color: "#FF9500",
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  modeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
