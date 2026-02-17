/**
 * AIQuizInterface Component
 * Interactive quiz interface for AI-generated questions
 */

import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { QuizQuestion } from "../../types/flashcard.types";

interface AIQuizInterfaceProps {
  question: QuizQuestion;
  onSubmit: (answer: string) => boolean;
  onNext: () => void;
  showResult: boolean;
  progress: { current: number; total: number; percentage: number };
}

export function AIQuizInterface({
  question,
  onSubmit,
  onNext,
  showResult,
  progress,
}: AIQuizInterfaceProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    const correct = onSubmit(userAnswer);
    setIsCorrect(correct);
    setSubmitted(true);
  };

  const handleNext = () => {
    setUserAnswer("");
    setIsCorrect(null);
    setSubmitted(false);
    onNext();
  };

  const renderQuestionInput = () => {
    if (question.type === "multiple_choice" && question.options) {
      return (
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            const isSelected = userAnswer === option;
            const showCorrect = submitted && option === question.correct_answer;
            const showIncorrect = submitted && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                  showCorrect && styles.optionButtonCorrect,
                  showIncorrect && styles.optionButtonIncorrect,
                ]}
                onPress={() => !submitted && setUserAnswer(option)}
                disabled={submitted}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                    (showCorrect || showIncorrect) && styles.optionTextResult,
                  ]}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </Text>
                {showCorrect && (
                  <Ionicons name="checkmark" size={20} color="#10b981" />
                )}
                {showIncorrect && (
                  <Ionicons name="close" size={20} color="#ef4444" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    return (
      <TextInput
        style={styles.textInput}
        value={userAnswer}
        onChangeText={setUserAnswer}
        placeholder="Type your answer here..."
        placeholderTextColor="#9ca3af"
        editable={!submitted}
        multiline={question.type === "fill_blank"}
        numberOfLines={question.type === "fill_blank" ? 2 : 1}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progress.percentage}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          Question {progress.current} of {progress.total}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>
            {getQuestionTypeLabel(question.type)}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>{question.question}</Text>

        {/* Related Label */}
        {question.related_label && (
          <Text style={styles.relatedLabel}>
            Related to: {question.related_label}
          </Text>
        )}

        {/* Answer Input */}
        {renderQuestionInput()}

        {/* Submit Button */}
        {!submitted && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              !userAnswer.trim() && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!userAnswer.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>
        )}

        {/* Result */}
        {submitted && (
          <View
            style={[
              styles.resultContainer,
              isCorrect ? styles.resultCorrect : styles.resultIncorrect,
            ]}
          >
            <View style={styles.resultTitleRow}>
              <Ionicons
                name={isCorrect ? "checkmark-circle" : "close-circle"}
                size={24}
                color={isCorrect ? "#10b981" : "#ef4444"}
              />
              <Text style={styles.resultTitle}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </Text>
            </View>

            {!isCorrect && (
              <Text style={styles.correctAnswer}>
                Correct answer: {question.correct_answer}
              </Text>
            )}

            <Text style={styles.explanation}>{question.explanation}</Text>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <Text style={styles.nextButtonText}>
                {progress.current === progress.total
                  ? "View Results"
                  : "Next Question"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    identification: "Identification",
    function: "Function",
    location: "Location",
    relationship: "Relationship",
    fill_blank: "Fill in the Blank",
    multiple_choice: "Multiple Choice",
  };
  return labels[type] || type;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  progressContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    marginBottom: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3b82f6",
    textTransform: "uppercase",
  },
  question: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 28,
  },
  relatedLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    marginBottom: 20,
    minHeight: 56,
  },
  optionsContainer: {
    marginBottom: 20,
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  optionButtonSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  optionButtonCorrect: {
    borderColor: "#10b981",
    backgroundColor: "#d1fae5",
  },
  optionButtonIncorrect: {
    borderColor: "#ef4444",
    backgroundColor: "#fee2e2",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  optionTextSelected: {
    color: "#1e40af",
    fontWeight: "600",
  },
  optionTextResult: {
    fontWeight: "600",
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  resultContainer: {
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  resultCorrect: {
    backgroundColor: "#d1fae5",
    borderWidth: 2,
    borderColor: "#10b981",
  },
  resultIncorrect: {
    backgroundColor: "#fee2e2",
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  resultTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  correctAnswer: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  explanation: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 20,
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
