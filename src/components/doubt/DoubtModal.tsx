/**
 * Doubt Modal Component
 * Modal for submitting and viewing doubt explanations
 */

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DoubtService } from "../../services/doubt.service";
import { getUserId } from "../../utils/user-id";

interface DoubtModalProps {
  visible: boolean;
  onClose: () => void;
  context?: string;
  cardId?: string;
  deckId?: string;
}

export function DoubtModal({
  visible,
  onClose,
  context,
  cardId,
  deckId,
}: DoubtModalProps) {
  const [doubtText, setDoubtText] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<{
    answer: string;
    examples: string[];
    related_concepts: string[];
  } | null>(null);

  const handleSubmit = async () => {
    if (!doubtText.trim()) return;

    setLoading(true);
    try {
      const userId = await getUserId();
      const result = await DoubtService.submitDoubt(userId, {
        doubt_text: doubtText,
        context,
        card_id: cardId,
        deck_id: deckId,
      });

      if (result.success && result.data) {
        setExplanation({
          answer: result.data.answer,
          examples: result.data.examples,
          related_concepts: result.data.related_concepts,
        });
      }
    } catch (error) {
      console.error("Error submitting doubt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDoubtText("");
    setExplanation(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Ask a Doubt</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {!explanation ? (
              <>
                {context && (
                  <View style={styles.contextBox}>
                    <Text style={styles.contextLabel}>Context:</Text>
                    <Text style={styles.contextText}>{context}</Text>
                  </View>
                )}

                <TextInput
                  style={styles.input}
                  value={doubtText}
                  onChangeText={setDoubtText}
                  placeholder="What would you like to understand better?"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!loading}
                />

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!doubtText.trim() || loading) &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!doubtText.trim() || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Get Explanation</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.explanationContainer}>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="bulb" size={20} color="#f59e0b" />
                    <Text style={styles.sectionTitle}>Explanation</Text>
                  </View>
                  <Text style={styles.answerText}>{explanation.answer}</Text>
                </View>

                {explanation.examples.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="list" size={20} color="#3b82f6" />
                      <Text style={styles.sectionTitle}>Examples</Text>
                    </View>
                    {explanation.examples.map((example, index) => (
                      <View key={index} style={styles.exampleItem}>
                        <Text style={styles.exampleNumber}>{index + 1}.</Text>
                        <Text style={styles.exampleText}>{example}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {explanation.related_concepts.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="link" size={20} color="#10b981" />
                      <Text style={styles.sectionTitle}>Related Concepts</Text>
                    </View>
                    <View style={styles.conceptsContainer}>
                      {explanation.related_concepts.map((concept, index) => (
                        <View key={index} style={styles.conceptChip}>
                          <Text style={styles.conceptText}>{concept}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.newDoubtButton}
                  onPress={() => {
                    setExplanation(null);
                    setDoubtText("");
                  }}
                >
                  <Text style={styles.newDoubtButtonText}>
                    Ask Another Doubt
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contextBox: {
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3b82f6",
    marginBottom: 4,
  },
  contextText: {
    fontSize: 14,
    color: "#1f2937",
    lineHeight: 20,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    minHeight: 120,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  explanationContainer: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  answerText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
  },
  exampleItem: {
    flexDirection: "row",
    gap: 8,
    paddingLeft: 8,
  },
  exampleNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3b82f6",
  },
  exampleText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  conceptsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  conceptChip: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  conceptText: {
    fontSize: 13,
    color: "#065f46",
    fontWeight: "600",
  },
  newDoubtButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  newDoubtButtonText: {
    color: "#f59e0b",
    fontSize: 16,
    fontWeight: "600",
  },
});
