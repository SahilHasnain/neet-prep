import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useAI } from "../../src/hooks/useAI";
import { useFlashcards } from "../../src/hooks/useFlashcards";
import type { DifficultyLevel } from "../../src/types/flashcard.types";

const TEMP_USER_ID = "temp-user-123";

export default function DeckDetailScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const {
    flashcards,
    loading,
    createFlashcard,
    createFlashcardsBulk,
    deleteFlashcard,
    refresh,
  } = useFlashcards(deckId);
  const { generateFlashcards, generating } = useAI(TEMP_USER_ID);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [frontContent, setFrontContent] = useState("");
  const [backContent, setBackContent] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState("10");
  const [creating, setCreating] = useState(false);

  const handleCreateCard = async () => {
    if (!frontContent.trim() || !backContent.trim()) {
      Alert.alert("Error", "Please fill in both front and back content");
      return;
    }

    try {
      setCreating(true);
      const card = await createFlashcard({
        deck_id: deckId,
        front_content: frontContent.trim(),
        back_content: backContent.trim(),
        difficulty: "medium" as DifficultyLevel,
      });

      if (card) {
        setShowCreateModal(false);
        setFrontContent("");
        setBackContent("");
        Alert.alert("Success", "Flashcard created!");
      } else {
        Alert.alert("Error", "Failed to create flashcard. Please try again.");
      }
    } catch (error) {
      console.error("Create card error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create flashcard",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) {
      Alert.alert("Error", "Please enter a topic");
      return;
    }

    const count = parseInt(aiCount);
    if (isNaN(count) || count < 5 || count > 50) {
      Alert.alert("Error", "Count must be between 5 and 50");
      return;
    }

    try {
      const generatedCards = await generateFlashcards({
        topic: aiTopic.trim(),
        count,
        difficulty: "medium" as DifficultyLevel,
        deck_id: deckId,
      });

      // Map AI response to CreateFlashcardDTO format
      const cardsToCreate = generatedCards.map((card) => ({
        deck_id: deckId,
        front_content: card.front_content,
        back_content: card.back_content,
        difficulty: card.difficulty as any,
        tags: card.tags || [],
      }));

      const success = await createFlashcardsBulk(cardsToCreate);

      if (success) {
        setShowAIModal(false);
        setAiTopic("");
        setAiCount("10");
        Alert.alert(
          "Success",
          `Generated ${generatedCards.length} flashcards!`,
        );
      } else {
        Alert.alert("Error", "Failed to save generated flashcards");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to generate flashcards",
      );
    }
  };

  const handleStudy = () => {
    if (flashcards.length === 0) {
      Alert.alert("No Cards", "Add some flashcards first!");
      return;
    }
    router.push(`/study/${deckId}`);
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert(
      "Delete Card",
      "Are you sure you want to delete this flashcard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteFlashcard(cardId);
            if (!success) {
              Alert.alert("Error", "Failed to delete flashcard");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom","top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Flashcards ({flashcards.length})</Text>

        <View style={styles.headerButtons}>
          <View style={styles.buttonWrapper}>
            <Button title="Study" onPress={handleStudy} />
          </View>
          <View style={styles.buttonWrapper}>
            <Button title="+ Add" onPress={() => setShowCreateModal(true)} />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title="🤖 AI"
              onPress={() => setShowAIModal(true)}
              variant="secondary"
            />
          </View>
        </View>
      </View>

      {loading && flashcards.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      ) : flashcards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Flashcards Yet</Text>
          <Text style={styles.emptyText}>
            Add flashcards manually or generate them with AI!
          </Text>
        </View>
      ) : (
        <FlatList
          data={flashcards}
          keyExtractor={(item) => item.card_id}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <View style={styles.cardContent}>
                <Text style={styles.cardFront}>{item.front_content}</Text>
                <Text style={styles.cardBack}>{item.back_content}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteCard(item.card_id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={refresh}
        />
      )}

      {/* Create Card Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Flashcard</Text>

            <Input
              label="Front (Question)"
              placeholder="Enter the question or term"
              value={frontContent}
              onChangeText={setFrontContent}
              multiline
              numberOfLines={3}
            />

            <Input
              label="Back (Answer)"
              placeholder="Enter the answer or definition"
              value={backContent}
              onChangeText={setBackContent}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.modalButton}>
                <Button
                  title="Create"
                  onPress={handleCreateCard}
                  loading={creating}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Generate Modal */}
      <Modal visible={showAIModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🤖 AI Generate Flashcards</Text>

            <Input
              label="Topic"
              placeholder="e.g., JavaScript Promises"
              value={aiTopic}
              onChangeText={setAiTopic}
            />

            <Input
              label="Number of Cards (5-50)"
              placeholder="10"
              value={aiCount}
              onChangeText={setAiCount}
              keyboardType="number-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAIModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.modalButton}>
                <Button
                  title="Generate"
                  onPress={handleGenerateAI}
                  loading={generating}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  buttonWrapper: {
    flex: 1,
    minWidth: 80,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
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
  },
  listContent: {
    padding: 16,
  },
  cardItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardFront: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  cardBack: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    alignSelf: "flex-end",
  },
  deleteText: {
    color: "#dc3545",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
});
