import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageUploader } from "../../src/components/diagram/ImageUploader";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { useAI } from "../../src/hooks/useAI";
import { useFlashcards } from "../../src/hooks/useFlashcards";
import { useImageUpload } from "../../src/hooks/useImageUpload";
import { LabelService } from "../../src/services/label.service";
import type { DifficultyLevel } from "../../src/types/flashcard.types";
import { LabelEditorWithAI } from "@/src/components/diagram/LabelEditorWithAI";

const TEMP_USER_ID = "temp-user-123";

interface LabelPosition {
  x: number;
  y: number;
  text: string;
  tempId: string;
}

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
  const { uploadImage, deleteImage, uploadedImage, uploading } =
    useImageUpload();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [cardType, setCardType] = useState<"text" | "diagram">("text");
  const [frontContent, setFrontContent] = useState("");
  const [backContent, setBackContent] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState("5");
  const [creating, setCreating] = useState(false);
  const [labels, setLabels] = useState<LabelPosition[]>([]);

  const handleImageSelected = async (asset: {
    uri: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  }) => {
    try {
      // Use provided filename or generate one
      const filename = asset.fileName || `diagram-${Date.now()}.jpg`;

      const result = await uploadImage(
        asset.uri,
        filename,
        asset.fileSize,
        asset.mimeType,
      );
      if (!result) {
        Alert.alert("Error", "Failed to upload image");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const handleImageRemoved = async () => {
    if (uploadedImage) {
      await deleteImage(uploadedImage.fileId);
      setLabels([]);
    }
  };

  const handleCreateCard = async () => {
    if (cardType === "diagram") {
      // Validate diagram card
      if (!uploadedImage) {
        Alert.alert("Error", "Please upload a diagram image");
        return;
      }
      if (labels.length === 0) {
        Alert.alert("Error", "Please add at least one label to the diagram");
        return;
      }
      if (!backContent.trim()) {
        Alert.alert("Error", "Please add explanation/notes");
        return;
      }
    } else {
      // Validate text card
      if (!frontContent.trim() || !backContent.trim()) {
        Alert.alert("Error", "Please fill in both front and back content");
        return;
      }
    }

    try {
      setCreating(true);

      // Create the flashcard
      const card = await createFlashcard({
        deck_id: deckId,
        front_content: cardType === "diagram" ? "Diagram" : frontContent.trim(),
        back_content: backContent.trim(),
        difficulty: "medium" as DifficultyLevel,
        has_image: cardType === "diagram",
        image_url: uploadedImage?.fileUrl,
        image_id: uploadedImage?.fileId,
      });

      if (card) {
        // If diagram card, save labels
        if (cardType === "diagram" && labels.length > 0) {
          const labelData = labels.map((label, index) => ({
            card_id: card.card_id,
            label_text: label.text,
            x_position: label.x,
            y_position: label.y,
            order_index: index,
          }));

          await LabelService.createLabelsBulk(labelData);
        }

        // Reset form
        setShowCreateModal(false);
        setFrontContent("");
        setBackContent("");
        setLabels([]);
        setCardType("text");
        if (uploadedImage) {
          await deleteImage(uploadedImage.fileId);
        }
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
    if (isNaN(count) || count < 1 || count > 5) {
      Alert.alert("Error", "Count must be between 1 and 5");
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
        setAiCount("5");
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

  const handleQuiz = () => {
    const diagramCards = flashcards.filter(
      (card) => card.has_image && card.image_url,
    );
    if (diagramCards.length === 0) {
      Alert.alert(
        "No Diagram Cards",
        "Add diagram flashcards to use quiz mode!",
      );
      return;
    }
    router.push(`/quiz/${deckId}` as any);
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
    <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
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
            <Button title="🎯 Quiz" onPress={handleQuiz} variant="secondary" />
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

            {/* Card Type Selector */}
            <View style={styles.cardTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.cardTypeButton,
                  cardType === "text" && styles.cardTypeButtonActive,
                ]}
                onPress={() => setCardType("text")}
              >
                <Text
                  style={[
                    styles.cardTypeButtonText,
                    cardType === "text" && styles.cardTypeButtonTextActive,
                  ]}
                >
                  📝 Text Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cardTypeButton,
                  cardType === "diagram" && styles.cardTypeButtonActive,
                ]}
                onPress={() => setCardType("diagram")}
              >
                <Text
                  style={[
                    styles.cardTypeButtonText,
                    cardType === "diagram" && styles.cardTypeButtonTextActive,
                  ]}
                >
                  🖼️ Diagram Card
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {cardType === "text" ? (
                <>
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
                </>
              ) : (
                <>
                  {!uploadedImage ? (
                    <ImageUploader
                      onImageSelected={handleImageSelected}
                      onImageRemoved={handleImageRemoved}
                      disabled={uploading}
                    />
                  ) : (
                    <>
                      <LabelEditorWithAI
                        imageUrl={uploadedImage.fileUrl}
                        imageId={uploadedImage.fileId}
                        cardId="new-card" // Temporary ID for new cards
                        userId={TEMP_USER_ID}
                        labels={labels}
                        onLabelsChange={setLabels}
                        editable={true}
                        diagramType="general"
                      />

                      <View style={styles.diagramActions}>
                        <TouchableOpacity
                          style={styles.changeImageButton}
                          onPress={handleImageRemoved}
                        >
                          <Text style={styles.changeImageButtonText}>
                            Change Image
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  <Input
                    label="Explanation / Notes"
                    placeholder="Add explanation or additional notes"
                    value={backContent}
                    onChangeText={setBackContent}
                    multiline
                    numberOfLines={3}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setCardType("text");
                  setFrontContent("");
                  setBackContent("");
                  setLabels([]);
                  if (uploadedImage) {
                    deleteImage(uploadedImage.fileId);
                  }
                }}
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
              placeholder="e.g., Cell Division"
              value={aiTopic}
              onChangeText={setAiTopic}
            />

            <Input
              label="Number of Cards (1-5)"
              placeholder="5"
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
    maxHeight: "90%",
  },
  modalScroll: {
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  cardTypeSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  cardTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  cardTypeButtonActive: {
    borderColor: "#007AFF",
    backgroundColor: "#E6F4FE",
  },
  cardTypeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  cardTypeButtonTextActive: {
    color: "#007AFF",
  },
  diagramActions: {
    marginVertical: 12,
  },
  changeImageButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dc3545",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  changeImageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc3545",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
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
