/**
 * QuizResults Component
 * Shows quiz completion stats and weak areas
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

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
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const [showDetails, setShowDetails] = useState(false);

  const correctCount = results.filter((r) => r.is_correct).length;
  const totalCount = results.length;
  const accuracy = Math.round((correctCount / totalCount) * 100);
  const isPerfect = correctCount === totalCount;
  const wrongAnswers = results.filter((r) => !r.is_correct);

  useEffect(() => {
    // Animate score reveal
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    opacity.value = withSpring(1, { damping: 10, stiffness: 100 });

    // Show details after animation
    setTimeout(() => setShowDetails(true), 800);
  }, []);

  const getScoreColor = () => {
    if (accuracy >= 80) return "#10b981";
    if (accuracy >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getPerformanceMessage = () => {
    if (isPerfect) return "Outstanding! Perfect score!";
    if (accuracy >= 80) return "Excellent work! Keep it up!";
    if (accuracy >= 60) return "Good job! Room for improvement";
    return "Keep practicing! You'll get better";
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quiz Complete!</Text>
        {isPerfect && (
          <View style={styles.confettiRow}>
            <Ionicons name="trophy" size={32} color="#f59e0b" />
            <Ionicons name="star" size={28} color="#fbbf24" />
            <Ionicons name="trophy" size={32} color="#f59e0b" />
          </View>
        )}
      </View>

      {/* Score Card with Animation */}
      <View style={styles.scoreCard}>
        <Animated.View style={[styles.scoreCircleContainer, animatedStyle]}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
            <Text style={[styles.scoreText, { color: getScoreColor() }]}>
              {accuracy}%
            </Text>
          </View>
        </Animated.View>

        <Text style={styles.scoreLabel}>
          {correctCount} out of {totalCount} correct
        </Text>
        <Text style={[styles.performanceMessage, { color: getScoreColor() }]}>
          {getPerformanceMessage()}
        </Text>
      </View>

      {/* Performance Stats */}
      {showDetails && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10b981" />
            <Text style={styles.statValue}>{correctCount}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="close-circle" size={32} color="#ef4444" />
            <Text style={styles.statValue}>{wrongAnswers.length}</Text>
            <Text style={styles.statLabel}>Wrong</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="stats-chart" size={32} color="#3b82f6" />
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
      )}

      {/* Weak Areas */}
      {showDetails && wrongAnswers.length > 0 && (
        <View style={styles.weakAreasContainer}>
          <View style={styles.weakAreasTitleRow}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.weakAreasTitle}>
              Areas to Review ({wrongAnswers.length})
            </Text>
          </View>
          <ScrollView style={styles.weakAreasList}>
            {wrongAnswers.map((result, index) => (
              <View key={result.label_id} style={styles.weakAreaItem}>
                <View style={styles.weakAreaHeader}>
                  <Text style={styles.weakAreaNumber}>{index + 1}</Text>
                  <Text style={styles.weakAreaAnswer}>
                    {result.correct_answer}
                  </Text>
                </View>
                <Text style={styles.weakAreaUserAnswer}>
                  Your answer: {result.user_answer}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Detailed Results */}
      {showDetails && (
        <ScrollView style={styles.resultsList}>
          <Text style={styles.sectionTitle}>All Questions</Text>
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
                <Ionicons
                  name={result.is_correct ? "checkmark-circle" : "close-circle"}
                  size={24}
                  color={result.is_correct ? "#10b981" : "#ef4444"}
                />
              </View>
              <Text style={styles.resultAnswer}>{result.correct_answer}</Text>
              {!result.is_correct && (
                <Text style={styles.resultUserAnswer}>
                  Your answer: {result.user_answer}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.retryButton]}
          onPress={onRetry}
        >
          <Ionicons
            name="refresh"
            size={20}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.retryButtonText}>Retry Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.exitButton]}
          onPress={onExit}
        >
          <Ionicons
            name={hasMoreCards ? "arrow-forward" : "checkmark"}
            size={20}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.exitButtonText}>
            {hasMoreCards ? "Next Card" : "Done"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  confettiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  scoreCard: {
    padding: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreCircleContainer: {
    marginBottom: 20,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreText: {
    fontSize: 42,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 12,
    fontWeight: "500",
  },
  performanceMessage: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  weakAreasContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#fecaca",
    maxHeight: 200,
  },
  weakAreasTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  weakAreasTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ef4444",
  },
  weakAreasList: {
    maxHeight: 140,
  },
  weakAreaItem: {
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  weakAreaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  weakAreaNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ef4444",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  weakAreaAnswer: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  weakAreaUserAnswer: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
    marginLeft: 4,
  },
  resultsList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  resultItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  resultCorrect: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  resultWrong: {
    backgroundColor: "#fee2e2",
    borderColor: "#ef4444",
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
    color: "#1f2937",
  },
  resultAnswer: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  resultUserAnswer: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    gap: 8,
  },
  buttonIcon: {
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  exitButton: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
