import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type QuizMode = "diagram" | "mcq" | "true_false" | "fill_blank";

interface QuizModeModalProps {
  visible: boolean;
  onClose: () => void;
  diagramCount: number;
  textCount: number;
  onSelectMode: (mode: QuizMode) => void;
}

export function QuizModeModal({
  visible,
  onClose,
  diagramCount,
  textCount,
  onSelectMode,
}: QuizModeModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Quiz Mode</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Choose the type of quiz you want to take
              </Text>

              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.optionsContainer}>
                  {/* Diagram Quiz Option */}
                  {diagramCount > 0 && (
                    <TouchableOpacity
                      style={styles.modeCard}
                      onPress={() => onSelectMode("diagram")}
                    >
                      <View style={styles.modeIconContainer}>
                        <Ionicons
                          name="image-outline"
                          size={32}
                          color="#3b82f6"
                        />
                      </View>
                      <View style={styles.modeContent}>
                        <Text style={styles.modeTitle}>Diagram Quiz</Text>
                        <Text style={styles.modeDescription}>
                          Label parts of diagrams and test your visual memory
                        </Text>
                        <View style={styles.modeBadge}>
                          <Text style={styles.modeBadgeText}>
                            {diagramCount}{" "}
                            {diagramCount === 1 ? "card" : "cards"}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  )}

                  {/* Text Quiz Modes */}
                  {textCount > 0 && (
                    <>
                      {diagramCount > 0 && (
                        <View style={styles.divider}>
                          <View style={styles.dividerLine} />
                          <Text style={styles.dividerText}>
                            Flashcard Quiz Modes
                          </Text>
                          <View style={styles.dividerLine} />
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.modeCard}
                        onPress={() => onSelectMode("mcq")}
                      >
                        <View style={styles.modeIconContainer}>
                          <Text style={styles.modeEmoji}>📝</Text>
                        </View>
                        <View style={styles.modeContent}>
                          <Text style={styles.modeTitle}>Multiple Choice</Text>
                          <Text style={styles.modeDescription}>
                            Choose the correct answer from 4 options
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#9ca3af"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modeCard}
                        onPress={() => onSelectMode("true_false")}
                      >
                        <View style={styles.modeIconContainer}>
                          <Text style={styles.modeEmoji}>✓✗</Text>
                        </View>
                        <View style={styles.modeContent}>
                          <Text style={styles.modeTitle}>True or False</Text>
                          <Text style={styles.modeDescription}>
                            Determine if statements are true or false
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#9ca3af"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modeCard}
                        onPress={() => onSelectMode("fill_blank")}
                      >
                        <View style={styles.modeIconContainer}>
                          <Text style={styles.modeEmoji}>___</Text>
                        </View>
                        <View style={styles.modeContent}>
                          <Text style={styles.modeTitle}>
                            Fill in the Blank
                          </Text>
                          <Text style={styles.modeDescription}>
                            Type the missing word or phrase
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#9ca3af"
                        />
                      </TouchableOpacity>

                      {textCount > 0 && (
                        <View style={styles.cardCountBadge}>
                          <Text style={styles.cardCountText}>
                            {textCount} text{" "}
                            {textCount === 1 ? "card" : "cards"} available
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  scrollView: {
    maxHeight: 500,
  },
  optionsContainer: {
    gap: 12,
  },
  modeCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  modeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  modeEmoji: {
    fontSize: 28,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  modeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3b82f6",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    marginHorizontal: 12,
  },
  cardCountBadge: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  cardCountText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
});
