import { LabelEditorWithAI } from "@/src/components/diagram/LabelEditorWithAI";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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

  const diagramCount = flashcards.filter((c) => c.has_image).length;
  const textCount = flashcards.length - diagramCount;

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Flashcards</Text>
          <View style={styles.headerSpacer} />
        </View>

        {flashcards.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeValue}>{flashcards.length}</Text>
              <Text style={styles.statBadgeLabel}>Total</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeValue}>{textCount}</Text>
              <Text style={styles.statBadgeLabel}>Text</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeValue}>{diagramCount}</Text>
              <Text style={styles.statBadgeLabel}>Diagram</Text>
            </View>
          </View>
        )}

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleStudy}>
            <Text style={styles.actionButtonIcon}>📖</Text>
            <Text style={styles.actionButtonText}>Study</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleQuiz}>
            <Text style={styles.actionButtonIcon}>🎯</Text>
            <Text style={styles.actionButtonText}>Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.actionButtonIcon}>+</Text>
            <Text
              style={[styles.actionButtonText, styles.actionButtonTextPrimary]}
            >
              Add
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAIModal(true)}
          >
            <Text style={styles.actionButtonIcon}>🤖</Text>
            <Text style={styles.actionButtonText}>AI</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && flashcards.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingIcon}>⏳</Text>
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      ) : flashcards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <Text style={styles.emptyIcon}>📇</Text>
          </View>
          <Text style={styles.emptyTitle}>No Flashcards Yet</Text>
          <Text style={styles.emptyText}>
            Create your first flashcard to start learning!
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.primaryCTA}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.primaryCTAText}>+ Create Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryCTA}
              onPress={() => setShowAIModal(true)}
            >
              <Text style={styles.secondaryCTAText}>🤖 Generate with AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={flashcards}
          keyExtractor={(item) => item.card_id}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <View style={styles.cardItemContent}>
                {item.has_image && item.image_url ? (
                  <View style={styles.cardWithImage}>
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.cardThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.cardTextContent}>
                      <View style={styles.cardTypeBadge}>
                        <Text style={styles.cardTypeBadgeText}>🖼️ Diagram</Text>
                      </View>
                      <Text style={styles.cardBack} numberOfLines={2}>
                        {item.back_content}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.cardTextOnly}>
                    <View style={styles.cardTypeBadge}>
                      <Text style={styles.cardTypeBadgeText}>📝 Text</Text>
                    </View>
                    <Text style={styles.cardFront} numberOfLines={1}>
                      {item.front_content}
                    </Text>
                    <Text style={styles.cardBack} numberOfLines={2}>
                      {item.back_content}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteCard(item.card_id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
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
    backgroundColor: "#f9fafb",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 60,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  statBadgeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  statBadgeLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 1,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  actionButtonPrimary: {
    backgroundColor: "#3b82f6",
  },
  actionButtonIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  actionButtonTextPrimary: {
    color: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyActions: {
    gap: 12,
    width: "100%",
    maxWidth: 300,
  },
  primaryCTA: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCTAText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryCTA: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  secondaryCTAText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  cardItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardItemContent: {
    padding: 12,
  },
  cardWithImage: {
    flexDirection: "row",
    gap: 12,
  },
  cardThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  cardTextContent: {
    flex: 1,
    justifyContent: "center",
  },
  cardTextOnly: {
    paddingVertical: 4,
  },
  cardTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  cardTypeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3b82f6",
  },
  cardFront: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  cardBack: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
  },
  deleteIcon: {
    fontSize: 18,
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
    color: "#1f2937",
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
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  cardTypeButtonActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  cardTypeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  cardTypeButtonTextActive: {
    color: "#3b82f6",
  },
  diagramActions: {
    marginVertical: 12,
  },
  changeImageButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ef4444",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  changeImageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
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
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
});
