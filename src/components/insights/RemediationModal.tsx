/**
 * Remediation Modal Component
 * Shows AI-generated remediation content for weak concepts
 */

import { MistakeTrackingService } from "@/src/services/mistake-tracking.service";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RemediationService } from "../../services/remediation.service";
import type {
  MistakePattern,
  PracticeQuestion,
  RemediationContent,
} from "../../types/flashcard.types";
import { getConceptDisplayName } from "../../utils/concept-mapper";

interface RemediationModalProps {
  visible: boolean;
  pattern: MistakePattern | null;
  onClose: () => void;
  onReviewed?: () => void; // Callback to refresh the patterns list
}

export function RemediationModal({
  visible,
  pattern,
  onClose,
  onReviewed,
}: RemediationModalProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<RemediationContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (visible && pattern) {
      loadRemediation();
      // Reset state when opening modal with new pattern
      setUserAnswers({});
      setSelectedQuestion(null);
    } else if (!visible) {
      // Reset state when closing modal
      setUserAnswers({});
      setSelectedQuestion(null);
      setContent(null);
      setError(null);
    }
  }, [visible, pattern]);

  const loadRemediation = async () => {
    if (!pattern) return;

    setLoading(true);
    setError(null);
    setContent(null);

    try {
      // Try to generate AI remediation
      const result = await RemediationService.generateRemediation({
        concept_id: pattern.concept_id,
        subject: pattern.subject,
        topic: pattern.topic,
        mistake_count: pattern.mistake_count,
      });

      if (result.success && result.data) {
        setContent(result.data);
      } else {
        // Fallback to mock content
        console.log("Using mock remediation");
        const mockContent = RemediationService.generateMockRemediation({
          concept_id: pattern.concept_id,
          subject: pattern.subject,
          topic: pattern.topic,
          mistake_count: pattern.mistake_count,
        });
        setContent(mockContent);
      }
    } catch (err) {
      console.error("Error loading remediation:", err);
      setError("Failed to load remediation content");

      // Fallback to mock content on error
      if (pattern) {
        const mockContent = RemediationService.generateMockRemediation({
          concept_id: pattern.concept_id,
          subject: pattern.subject,
          topic: pattern.topic,
          mistake_count: pattern.mistake_count,
        });
        setContent(mockContent);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReviewed = async () => {
    if (!pattern) return;

    setMarking(true);
    try {
      // Mark the pattern as reviewed (reduces mistake count by 1)
      await MistakeTrackingService.markPatternAsReviewed(pattern.pattern_id);

      // Call the callback to refresh the patterns list
      if (onReviewed) {
        onReviewed();
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error marking as reviewed:", error);
      // Still close the modal even if there's an error
      onClose();
    } finally {
      setMarking(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: answer });
  };

  const checkAnswer = (question: PracticeQuestion, questionIndex: number) => {
    const userAnswer = userAnswers[questionIndex];
    return userAnswer === question.correct_answer;
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "biology":
        return "#10b981";
      case "physics":
        return "#3b82f6";
      case "chemistry":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  if (!pattern) return null;

  const conceptName = getConceptDisplayName(pattern.concept_id);
  const subjectColor = getSubjectColor(pattern.subject);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.overlay} edges={["bottom"]}>
        <View style={styles.container}>
          {/* Compact Header */}
          <View style={[styles.header, { backgroundColor: subjectColor }]}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {conceptName}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {pattern.subject.charAt(0).toUpperCase() +
                  pattern.subject.slice(1)}{" "}
                • {pattern.topic.replace(/_/g, " ")}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={subjectColor} />
                <Text style={styles.loadingText}>
                  Generating personalized remediation...
                </Text>
              </View>
            ) : error && !content ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={loadRemediation}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : content ? (
              <>
                {/* Explanation Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="bulb" size={24} color="#f59e0b" />
                    <Text style={styles.sectionTitle}>Understanding</Text>
                  </View>
                  <Text style={styles.explanationText}>
                    {content.explanation}
                  </Text>
                </View>

                {/* Misconception Section */}
                <View style={[styles.section, styles.warningSection]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="warning" size={24} color="#ef4444" />
                    <Text style={styles.sectionTitle}>Common Mistake</Text>
                  </View>
                  <Text style={styles.misconceptionText}>
                    {content.misconception}
                  </Text>
                </View>

                {/* Practice Questions */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="school" size={24} color={subjectColor} />
                    <Text style={styles.sectionTitle}>Practice Questions</Text>
                  </View>

                  {content.practice_questions.map((question, index) => {
                    const isAnswered = userAnswers[index] !== undefined;
                    const isCorrect =
                      isAnswered && checkAnswer(question, index);

                    return (
                      <View key={index} style={styles.questionCard}>
                        <Text style={styles.questionNumber}>
                          Question {index + 1}
                        </Text>
                        <Text style={styles.questionText}>
                          {question.question}
                        </Text>

                        {question.options.map((option, optIndex) => {
                          const isSelected = userAnswers[index] === option;
                          const isCorrectOption =
                            option === question.correct_answer;
                          const showCorrect = isAnswered && isCorrectOption;
                          const showWrong =
                            isAnswered && isSelected && !isCorrect;

                          return (
                            <TouchableOpacity
                              key={optIndex}
                              style={[
                                styles.optionButton,
                                isSelected && styles.optionButtonSelected,
                                showCorrect && styles.optionButtonCorrect,
                                showWrong && styles.optionButtonWrong,
                              ]}
                              onPress={() =>
                                !isAnswered && handleAnswerSelect(index, option)
                              }
                              disabled={isAnswered}
                            >
                              <Text
                                style={[
                                  styles.optionText,
                                  (isSelected || showCorrect) &&
                                    styles.optionTextSelected,
                                ]}
                              >
                                {option}
                              </Text>
                              {showCorrect && (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={20}
                                  color="#10b981"
                                />
                              )}
                              {showWrong && (
                                <Ionicons
                                  name="close-circle"
                                  size={20}
                                  color="#ef4444"
                                />
                              )}
                            </TouchableOpacity>
                          );
                        })}

                        {isAnswered && (
                          <View
                            style={[
                              styles.feedback,
                              isCorrect
                                ? styles.feedbackCorrect
                                : styles.feedbackWrong,
                            ]}
                          >
                            <Ionicons
                              name={
                                isCorrect ? "checkmark-circle" : "close-circle"
                              }
                              size={20}
                              color={isCorrect ? "#10b981" : "#ef4444"}
                            />
                            <Text style={styles.feedbackText}>
                              {question.explanation}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </>
            ) : null}
          </ScrollView>

          {/* Footer */}
          {content && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: subjectColor },
                  marking && styles.actionButtonDisabled,
                ]}
                onPress={handleMarkAsReviewed}
                disabled={marking}
              >
                {marking ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      Mark as Reviewed
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flex: 1,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    textTransform: "capitalize",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  warningSection: {
    backgroundColor: "#fef2f2",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1f2937",
  },
  explanationText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  misconceptionText: {
    fontSize: 16,
    color: "#dc2626",
    lineHeight: 24,
  },
  questionCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 10,
    lineHeight: 22,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
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
    fontSize: 15,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: "#1f2937",
  },
  feedback: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
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
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
});
