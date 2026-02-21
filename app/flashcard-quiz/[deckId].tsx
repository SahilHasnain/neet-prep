/**
 * Flashcard Quiz Screen
 * Quiz modes for non-diagram flashcards: MCQ, True/False, Fill-in-the-Blank
 */

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFlashcards } from "../../src/hooks/useFlashcards";
import { FlashcardQuizService } from "../../src/services/flashcard-quiz.service";
import { MistakeTrackingService } from "../../src/services/mistake-tracking.service";
import type {
  FlashcardQuizQuestion,
  WrongAnswer,
} from "../../src/types/flashcard.types";
import { generateConceptId } from "../../src/utils/concept-mapper";

type QuizMode = "mcq" | "true_false" | "fill_blank" | null;

export default function FlashcardQuizScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const { flashcards, loading } = useFlashcards(deckId);

  const [quizMode, setQuizMode] = useState<QuizMode>(null);
  const [questions, setQuestions] = useState<FlashcardQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [doubtModalVisible, setDoubtModalVisible] = useState(false);

  const textCards = flashcards.filter((card) => !card.has_image);
  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const startQuiz = async (mode: QuizMode) => {
    if (!mode) return;

    setGenerating(true);
    setQuizMode(mode);

    try {
      const result = await FlashcardQuizService.generateQuizQuestions({
        cards: textCards.map((c) => ({
          card_id: c.card_id,
          front_content: c.front_content,
          back_content: c.back_content,
        })),
        quiz_type: mode,
        question_count: Math.min(textCards.length, 10),
      });

      if (result.success && result.data) {
        setQuestions(result.data.questions);
      } else {
        // Fallback to mock questions
        const mockQuestions = FlashcardQuizService.generateMockQuestions(
          textCards.slice(0, 10),
          mode,
        );
        setQuestions(mockQuestions);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      Alert.alert("Error", "Failed to generate quiz. Using fallback mode.");
      const mockQuestions = FlashcardQuizService.generateMockQuestions(
        textCards.slice(0, 10),
        mode,
      );
      setQuestions(mockQuestions);
    } finally {
      setGenerating(false);
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;

    let correct = false;

    if (quizMode === "mcq") {
      correct = userAnswer === currentQuestion.correct_answer;
    } else if (quizMode === "true_false") {
      correct =
        userAnswer.toLowerCase() ===
        currentQuestion.correct_answer.toLowerCase();
    } else if (quizMode === "fill_blank") {
      correct =
        userAnswer.trim().toLowerCase() ===
        currentQuestion.correct_answer.trim().toLowerCase();
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    // Update question with result
    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex] = {
      ...currentQuestion,
      user_answer: userAnswer,
      is_correct: correct,
    };
    setQuestions(updatedQuestions);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizComplete(true);

    // Log quiz attempt
    try {
      const wrongAnswers: WrongAnswer[] = questions
        .filter((q) => !q.is_correct)
        .map((q) => {
          const card = textCards.find((c) => c.card_id === q.card_id);
          const conceptId = generateConceptId(
            card?.front_content || q.question,
          );

          console.log("Generated concept ID:", {
            cardId: q.card_id,
            frontContent: card?.front_content,
            question: q.question,
            conceptId,
          });

          return {
            question_id: q.question_id,
            label_id: q.card_id,
            user_answer: q.user_answer || "",
            correct_answer: q.correct_answer,
            concept_id: conceptId,
          };
        });

      const correctCount = questions.filter((q) => q.is_correct).length;
      const score = Math.round((correctCount / questions.length) * 100);

      console.log("Logging quiz attempt:", {
        card_id: textCards[0]?.card_id,
        deck_id: deckId,
        quiz_mode: `flashcard_${quizMode}`,
        score,
        total_questions: questions.length,
        wrong_answers_count: wrongAnswers.length,
      });

      await MistakeTrackingService.logQuizAttempt({
        card_id: textCards[0]?.card_id || "unknown",
        deck_id: deckId,
        quiz_mode: `flashcard_${quizMode}`,
        score,
        total_questions: questions.length,
        wrong_answers: wrongAnswers,
      });

      console.log("Quiz attempt logged successfully");
    } catch (error) {
      console.error("Failed to log quiz attempt:", error);
      // Don't show alert to user, just log the error
    }
  };

  const getScore = () => {
    const correct = questions.filter((q) => q.is_correct).length;
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (textCards.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="albums-outline" size={64} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No Text Cards</Text>
        <Text style={styles.emptyText}>
          Add text flashcards to use this quiz mode!
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Mode selection
  if (!quizMode || generating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Quiz Mode</Text>
        </View>

        {generating ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Generating quiz questions...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              {textCards.length} cards available
            </Text>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => startQuiz("mcq")}
            >
              <Text style={styles.modeIcon}>📝</Text>
              <Text style={styles.modeTitle}>Multiple Choice</Text>
              <Text style={styles.modeDescription}>
                Choose the correct answer from 4 options
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => startQuiz("true_false")}
            >
              <Text style={styles.modeIcon}>✓✗</Text>
              <Text style={styles.modeTitle}>True or False</Text>
              <Text style={styles.modeDescription}>
                Determine if statements are true or false
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeCard}
              onPress={() => startQuiz("fill_blank")}
            >
              <Text style={styles.modeIcon}>___</Text>
              <Text style={styles.modeTitle}>Fill in the Blank</Text>
              <Text style={styles.modeDescription}>
                Type the missing word or phrase
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Quiz complete
  if (quizComplete) {
    const score = getScore();
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultsContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scorePercentage}>{score.percentage}%</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>

          <Text style={styles.resultsTitle}>Quiz Complete!</Text>
          <Text style={styles.resultsText}>
            You got {score.correct} out of {score.total} questions correct
          </Text>

          <View style={styles.resultsButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonTextSecondary}>Back to Deck</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setQuizMode(null);
                setQuestions([]);
                setCurrentIndex(0);
                setQuizComplete(false);
              }}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Quiz in progress
  return (
    <SafeAreaView style={styles.container}>
      <AskDoubtButton onPress={() => setDoubtModalVisible(true)} />
      <DoubtModal
        visible={doubtModalVisible}
        onClose={() => setDoubtModalVisible(false)}
        context={currentQuestion?.question}
        cardId={currentQuestion?.card_id}
        deckId={deckId}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color="#ef4444" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {quizMode === "mcq"
            ? "Multiple Choice"
            : quizMode === "true_false"
              ? "True/False"
              : "Fill in the Blank"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.quizContent}
        contentContainerStyle={styles.quizContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionText}>{currentQuestion?.question}</Text>

        {quizMode === "mcq" && currentQuestion?.options && (
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  userAnswer === option && styles.optionButtonSelected,
                  showFeedback &&
                    option === currentQuestion.correct_answer &&
                    styles.optionButtonCorrect,
                  showFeedback &&
                    userAnswer === option &&
                    !isCorrect &&
                    styles.optionButtonWrong,
                ]}
                onPress={() => !showFeedback && setUserAnswer(option)}
                disabled={showFeedback}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {quizMode === "true_false" && (
          <View style={styles.tfContainer}>
            <TouchableOpacity
              style={[
                styles.tfButton,
                userAnswer === "true" && styles.tfButtonSelected,
                showFeedback &&
                  currentQuestion.correct_answer === "true" &&
                  styles.tfButtonCorrect,
              ]}
              onPress={() => !showFeedback && setUserAnswer("true")}
              disabled={showFeedback}
            >
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              <Text style={styles.tfButtonText}>True</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tfButton,
                userAnswer === "false" && styles.tfButtonSelected,
                showFeedback &&
                  currentQuestion.correct_answer === "false" &&
                  styles.tfButtonCorrect,
              ]}
              onPress={() => !showFeedback && setUserAnswer("false")}
              disabled={showFeedback}
            >
              <Ionicons name="close-circle" size={32} color="#ef4444" />
              <Text style={styles.tfButtonText}>False</Text>
            </TouchableOpacity>
          </View>
        )}

        {quizMode === "fill_blank" && (
          <TextInput
            style={styles.input}
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder="Type your answer..."
            editable={!showFeedback}
            autoFocus
          />
        )}

        {showFeedback && (
          <View
            style={[
              styles.feedback,
              isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
            ]}
          >
            <Ionicons
              name={isCorrect ? "checkmark-circle" : "close-circle"}
              size={24}
              color={isCorrect ? "#10b981" : "#ef4444"}
            />
            <Text style={styles.feedbackText}>
              {isCorrect
                ? "Correct!"
                : `Incorrect. Answer: ${currentQuestion.correct_answer}`}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!showFeedback ? (
          <TouchableOpacity
            style={[styles.button, !userAnswer && styles.buttonDisabled]}
            onPress={checkAnswer}
            disabled={!userAnswer}
          >
            <Text style={styles.buttonText}>Check Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {currentIndex < questions.length - 1
                ? "Next Question"
                : "Finish Quiz"}
            </Text>
          </TouchableOpacity>
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
    padding: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
    textAlign: "center",
  },
  modeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  modeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  quizContent: {
    flex: 1,
  },
  quizContentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  optionButtonSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  optionButtonCorrect: {
    borderColor: "#10b981",
    backgroundColor: "#d1fae5",
  },
  optionButtonWrong: {
    borderColor: "#ef4444",
    backgroundColor: "#fee2e2",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  tfContainer: {
    flexDirection: "row",
    gap: 16,
  },
  tfButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  tfButtonSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  tfButtonCorrect: {
    borderColor: "#10b981",
    backgroundColor: "#d1fae5",
  },
  tfButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 8,
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    fontSize: 16,
  },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderLeftWidth: 4,
  },
  feedbackCorrect: {
    backgroundColor: "#d1fae5",
    borderLeftColor: "#10b981",
  },
  feedbackWrong: {
    backgroundColor: "#fee2e2",
    borderLeftColor: "#ef4444",
  },
  feedbackText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#3b82f6",
    fontSize: 17,
    fontWeight: "600",
  },
  resultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#eff6ff",
    borderWidth: 8,
    borderColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  scoreLabel: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },
  resultsButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
});
