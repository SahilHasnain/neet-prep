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
import { MistakeTrackingService } from "../../src/services/mistake-tracking.service";
import type {
  DiagramLabel,
  WrongAnswer,
} from "../../src/types/flashcard.types";

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

  const handleQuizComplete = async (results: QuizResult[]) => {
    setQuizResults(results);

    // Log quiz attempt with mistake tracking
    try {
      const wrongAnswers: WrongAnswer[] = results
        .filter((r) => !r.is_correct)
        .map((r) => {
          // Find the label to get concept info
          const label = labels.find((l) => l.label_id === r.label_id);
          const conceptId = generateConceptId(
            label?.label_text || r.correct_answer,
          );

          return {
            question_id: r.label_id,
            label_id: r.label_id,
            user_answer: r.user_answer,
            correct_answer: r.correct_answer,
            concept_id: conceptId,
          };
        });

      const correctCount = results.filter((r) => r.is_correct).length;
      const score = Math.round((correctCount / results.length) * 100);

      await MistakeTrackingService.logQuizAttempt({
        card_id: currentCard.card_id,
        deck_id: deckId,
        quiz_mode: quizMode || "label-quiz",
        score,
        total_questions: results.length,
        wrong_answers: wrongAnswers,
      });

      console.log("Quiz attempt logged successfully");
    } catch (error) {
      console.error("Failed to log quiz attempt:", error);
      // Don't block user flow if logging fails
    }
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
          hasMoreCards={currentCardIndex < diagramCards.length - 1}
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
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  warningText: {
    fontSize: 13,
    color: "#f59e0b",
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    lineHeight: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  modeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  modeIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  modeDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 12,
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
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
