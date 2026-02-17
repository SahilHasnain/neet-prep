/**
 * DiagramQuiz Component
 * Interactive quiz mode for diagram flashcards
 */

import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Label {
  label_id: string;
  label_text: string;
  x_position: number;
  y_position: number;
  order_index: number;
}

interface QuizResult {
  label_id: string;
  is_correct: boolean;
  user_answer: string;
  correct_answer: string;
}

interface DiagramQuizProps {
  imageUrl: string;
  labels: Label[];
  mode: "label-quiz" | "identification-quiz";
  onComplete: (results: QuizResult[]) => void;
  onExit: () => void;
}

export function DiagramQuiz({
  imageUrl,
  labels,
  mode,
  onComplete,
  onExit,
}: DiagramQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [results, setResults] = useState<QuizResult[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [imageLayout, setImageLayout] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const currentLabel = labels[currentIndex];
  const progress = ((currentIndex + 1) / labels.length) * 100;

  const checkAnswer = () => {
    if (mode === "label-quiz") {
      const correct =
        userAnswer.trim().toLowerCase() ===
        currentLabel.label_text.trim().toLowerCase();

      const result: QuizResult = {
        label_id: currentLabel.label_id,
        is_correct: correct,
        user_answer: userAnswer.trim(),
        correct_answer: currentLabel.label_text,
      };

      setResults([...results, result]);
      setIsCorrect(correct);
      setShowFeedback(true);
    } else if (mode === "identification-quiz" && selectedPosition) {
      // Check if clicked position is within 10% of correct position
      const xDiff = Math.abs(selectedPosition.x - currentLabel.x_position);
      const yDiff = Math.abs(selectedPosition.y - currentLabel.y_position);
      const correct = xDiff < 10 && yDiff < 10;

      const result: QuizResult = {
        label_id: currentLabel.label_id,
        is_correct: correct,
        user_answer: `(${selectedPosition.x.toFixed(1)}, ${selectedPosition.y.toFixed(1)})`,
        correct_answer: currentLabel.label_text,
      };

      setResults([...results, result]);
      setIsCorrect(correct);
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < labels.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setSelectedPosition(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      onComplete([...results]);
    }
  };

  const handleImagePress = (event: any) => {
    if (mode !== "identification-quiz" || showFeedback) return;

    const { locationX, locationY } = event.nativeEvent;

    // Calculate percentage based on stored layout
    if (imageLayout.width > 0 && imageLayout.height > 0) {
      const xPercent = (locationX / imageLayout.width) * 100;
      const yPercent = (locationY / imageLayout.height) * 100;
      setSelectedPosition({ x: xPercent, y: yPercent });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Text style={styles.exitText}>✕ Exit</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === "label-quiz" ? "Label Quiz" : "Identification Quiz"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {labels.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Quiz Content */}
      <ScrollView style={styles.content}>
        {mode === "label-quiz" ? (
          <>
            {/* Show diagram with numbered dot */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="contain"
              />
              <View
                style={[
                  styles.labelDot,
                  {
                    left: `${currentLabel.x_position}%`,
                    top: `${currentLabel.y_position}%`,
                  },
                ]}
              >
                <View style={styles.dotCircle}>
                  <Text style={styles.dotNumber}>{currentIndex + 1}</Text>
                </View>
              </View>

              {showFeedback && (
                <View
                  style={[
                    styles.labelDot,
                    {
                      left: `${currentLabel.x_position}%`,
                      top: `${currentLabel.y_position}%`,
                    },
                  ]}
                >
                  <View style={styles.answerLabel}>
                    <Text style={styles.answerLabelText}>
                      {currentLabel.label_text}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                What is the label at position {currentIndex + 1}?
              </Text>
              <TextInput
                style={styles.input}
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Type your answer..."
                editable={!showFeedback}
                autoFocus
              />
            </View>
          </>
        ) : (
          <>
            {/* Show diagram for clicking */}
            <View style={styles.imageContainer}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={handleImagePress}
                disabled={showFeedback}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.image}
                  resizeMode="contain"
                  onLayout={(event) => {
                    const { width, height, x, y } = event.nativeEvent.layout;
                    setImageLayout({ width, height, x, y });
                  }}
                />
              </TouchableOpacity>

              {selectedPosition && !showFeedback && (
                <View
                  style={[
                    styles.labelDot,
                    {
                      left: `${selectedPosition.x}%`,
                      top: `${selectedPosition.y}%`,
                    },
                  ]}
                >
                  <View style={[styles.dotCircle, styles.userDot]}>
                    <Text style={styles.dotNumber}>?</Text>
                  </View>
                </View>
              )}

              {showFeedback && (
                <View
                  style={[
                    styles.labelDot,
                    {
                      left: `${currentLabel.x_position}%`,
                      top: `${currentLabel.y_position}%`,
                    },
                  ]}
                >
                  <View style={[styles.dotCircle, styles.correctDot]}>
                    <Text style={styles.dotNumber}>✓</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                Tap on the diagram to identify: {currentLabel.label_text}
              </Text>
            </View>
          </>
        )}

        {/* Feedback */}
        {showFeedback && (
          <View
            style={[
              styles.feedback,
              isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
            ]}
          >
            <Text style={styles.feedbackIcon}>{isCorrect ? "✅" : "❌"}</Text>
            <Text style={styles.feedbackText}>
              {isCorrect
                ? "Correct!"
                : `Incorrect. Answer: ${currentLabel.label_text}`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        {!showFeedback ? (
          <TouchableOpacity
            style={[
              styles.button,
              !userAnswer.trim() && !selectedPosition && styles.buttonDisabled,
            ]}
            onPress={checkAnswer}
            disabled={!userAnswer.trim() && !selectedPosition}
          >
            <Text style={styles.buttonText}>Check Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {currentIndex < labels.length - 1
                ? "Next Question"
                : "Finish Quiz"}
            </Text>
          </TouchableOpacity>
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  exitButton: {
    padding: 8,
  },
  exitText: {
    fontSize: 16,
    color: "#dc3545",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 60,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 300,
  },
  image: {
    width: "100%",
    height: 300,
  },
  labelDot: {
    position: "absolute",
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  dotCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  userDot: {
    backgroundColor: "#007AFF",
  },
  correctDot: {
    backgroundColor: "#34C759",
  },
  dotNumber: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  answerLabel: {
    position: "absolute",
    top: 28,
    left: -40,
    backgroundColor: "rgba(52, 199, 89, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 80,
  },
  answerLabelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  questionContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  feedbackCorrect: {
    backgroundColor: "#d4edda",
  },
  feedbackWrong: {
    backgroundColor: "#f8d7da",
  },
  feedbackIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  feedbackText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
