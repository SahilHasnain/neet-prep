/**
 * QuizResults Component
 * Shows quiz completion stats and weak areas
 */

import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface QuizResult {
  label_id: string;
  is_correct: boolean;
  user_answer: string;
  correct_answer: string;
}

interface QuizResultsProps {
  results: QuizResult[];
  onRetry: () => void;
  onExit: () => void;
  hasMoreCards?: boolean;
}

export function QuizResults({
  results,
  onRetry,
  onExit,
  hasMoreCards = false,
}: QuizResultsProps) {
  const correctCount = results.filter((r) => r.is_correct).length;
  const totalCount = results.length;
  const accuracy = Math.round((correctCount / totalCount) * 100);
  const isPerfect = correctCount === totalCount;

  const getScoreColor = () => {
    if (accuracy >= 80) return "#34C759";
    if (accuracy >= 60) return "#FFD700";
    return "#dc3545";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quiz Complete!</Text>
        {isPerfect && <Text style={styles.confetti}>🎉</Text>}
      </View>

      {/* Score Card */}
      <View style={styles.scoreCard}>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
          <Text style={[styles.scoreText, { color: getScoreColor() }]}>
            {accuracy}%
          </Text>
        </View>
        <Text style={styles.scoreLabel}>
          {correctCount} out of {totalCount} correct
        </Text>
        {isPerfect && <Text style={styles.perfectText}>Perfect Score! 🌟</Text>}
      </View>

      {/* Results List */}
      <ScrollView style={styles.resultsList}>
        <Text style={styles.sectionTitle}>Detailed Results</Text>
        {results.map((result, index) => (
          <View
            key={result.label_id}
            style={[
              styles.resultItem,
              result.is_correct ? styles.resultCorrect : styles.resultWrong,
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultNumber}>Q{index + 1}</Text>
              <Text style={styles.resultIcon}>
                {result.is_correct ? "✅" : "❌"}
              </Text>
            </View>
            <Text style={styles.resultAnswer}>
              Correct: {result.correct_answer}
            </Text>
            {!result.is_correct && (
              <Text style={styles.resultUserAnswer}>
                Your answer: {result.user_answer}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.retryButton]}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>🔄 Retry Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.exitButton]}
          onPress={onExit}
        >
          <Text style={styles.exitButtonText}>
            {hasMoreCards ? "Next Card →" : "Exit"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  confetti: {
    fontSize: 32,
    marginTop: 8,
  },
  scoreCard: {
    padding: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  perfectText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#34C759",
  },
  resultsList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  resultItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  resultCorrect: {
    backgroundColor: "#d4edda",
    borderColor: "#34C759",
  },
  resultWrong: {
    backgroundColor: "#f8d7da",
    borderColor: "#dc3545",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resultNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  resultIcon: {
    fontSize: 20,
  },
  resultAnswer: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  resultUserAnswer: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  exitButton: {
    backgroundColor: "#f0f0f0",
  },
  exitButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});
