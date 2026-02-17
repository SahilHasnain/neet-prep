/**
 * LabelEditorWithAI Component
 * Enhanced LabelEditor with AI label suggestions
 */

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AI_FEATURES } from "../../config/ai-features.config";
import { useAIDiagram } from "../../hooks/useAIDiagram";
import { AILabelSuggestions } from "./AILabelSuggestions";
import { DiagramQualityIndicator } from "./DiagramQualityIndicator";

interface LabelPosition {
  x: number;
  y: number;
  text: string;
  tempId: string;
}

interface LabelEditorWithAIProps {
  imageUrl: string;
  imageId: string;
  cardId: string;
  userId: string;
  labels: LabelPosition[];
  onLabelsChange: (labels: LabelPosition[]) => void;
  editable?: boolean;
  diagramType?: string;
}

export function LabelEditorWithAI({
  imageUrl,
  imageId,
  cardId,
  userId,
  labels,
  onLabelsChange,
  editable = true,
  diagramType = "general",
}: LabelEditorWithAIProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showQualityCheck, setShowQualityCheck] = useState(false);

  const {
    analyzing,
    suggestions,
    qualityReport,
    error,
    analyzeDiagram,
    applySuggestions,
    assessQuality,
    clearSuggestions,
  } = useAIDiagram(userId, cardId);

  const handleImagePress = (event: any) => {
    if (!editable) return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = imageSize;

    if (width === 0 || height === 0) return;

    const xPercent = (locationX / width) * 100;
    const yPercent = (locationY / height) * 100;

    const newLabel: LabelPosition = {
      x: xPercent,
      y: yPercent,
      text: "",
      tempId: `temp-${Date.now()}`,
    };

    onLabelsChange([...labels, newLabel]);
    setEditingLabel(newLabel.tempId);
    setEditText("");
  };

  const handleLabelTextSave = () => {
    if (!editingLabel) return;

    if (!editText.trim()) {
      Alert.alert("Error", "Label text cannot be empty");
      return;
    }

    const updatedLabels = labels.map((label) =>
      label.tempId === editingLabel
        ? { ...label, text: editText.trim() }
        : label,
    );

    onLabelsChange(updatedLabels);
    setEditingLabel(null);
    setEditText("");
  };

  const handleLabelEdit = (tempId: string) => {
    if (!editable) return;

    const label = labels.find((l) => l.tempId === tempId);
    if (label) {
      setEditingLabel(tempId);
      setEditText(label.text);
    }
  };

  const handleLabelDelete = (tempId: string) => {
    if (!editable) return;

    Alert.alert("Delete Label", "Are you sure you want to delete this label?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedLabels = labels.filter((l) => l.tempId !== tempId);
          onLabelsChange(updatedLabels);
        },
      },
    ]);
  };

  const handleCancelEdit = () => {
    if (!editText.trim() && editingLabel) {
      const updatedLabels = labels.filter((l) => l.tempId !== editingLabel);
      onLabelsChange(updatedLabels);
    }
    setEditingLabel(null);
    setEditText("");
  };

  const handleAnalyzeWithAI = async () => {
    try {
      await analyzeDiagram(imageId, imageUrl, diagramType);
      setShowAISuggestions(true);
    } catch (err) {
      Alert.alert("Error", "Failed to analyze diagram. Please try again.");
    }
  };

  const handleCheckQuality = async () => {
    try {
      await assessQuality(imageId, imageUrl);
      setShowQualityCheck(true);
    } catch (err) {
      Alert.alert("Error", "Failed to check quality. Please try again.");
    }
  };

  const handleApplySuggestions = async (selectedIndices: number[]) => {
    try {
      const appliedLabels = await applySuggestions(selectedIndices);

      // Convert to LabelPosition format
      const newLabels: LabelPosition[] = appliedLabels.map((label) => ({
        x: label.x_position,
        y: label.y_position,
        text: label.label_text,
        tempId: label.label_id,
      }));

      onLabelsChange([...labels, ...newLabels]);
      setShowAISuggestions(false);
      clearSuggestions();

      Alert.alert("Success", `Applied ${selectedIndices.length} labels!`);
    } catch (err) {
      Alert.alert("Error", "Failed to apply labels. Please try again.");
    }
  };

  const handleRejectSuggestions = () => {
    setShowAISuggestions(false);
    clearSuggestions();
  };

  return (
    <View style={styles.container}>
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          {editable
            ? "📍 Tap on the diagram to add labels or use AI"
            : "View labeled diagram"}
        </Text>
      </View>

      {/* AI Actions */}
      {editable && AI_FEATURES.DIAGRAM_ANALYSIS.enabled && (
        <View style={styles.aiActions}>
          <TouchableOpacity
            style={[styles.aiButton, analyzing && styles.aiButtonDisabled]}
            onPress={handleAnalyzeWithAI}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.aiButtonIcon}>🤖</Text>
                <Text style={styles.aiButtonText}>Analyze with AI</Text>
              </>
            )}
          </TouchableOpacity>

          {AI_FEATURES.QUALITY_CHECK.enabled && (
            <TouchableOpacity
              style={[
                styles.aiButton,
                styles.qualityButton,
                analyzing && styles.aiButtonDisabled,
              ]}
              onPress={handleCheckQuality}
              disabled={analyzing}
            >
              <Text style={styles.aiButtonIcon}>✓</Text>
              <Text style={styles.aiButtonText}>Check Quality</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <View style={styles.imageContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleImagePress}
          disabled={!editable}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setImageSize({ width, height });
            }}
          />

          {labels.map((label, index) => (
            <TouchableOpacity
              key={label.tempId}
              style={[
                styles.labelDot,
                {
                  left: `${label.x}%`,
                  top: `${label.y}%`,
                },
              ]}
              onPress={() => handleLabelEdit(label.tempId)}
              onLongPress={() => handleLabelDelete(label.tempId)}
              disabled={!editable}
            >
              <View style={styles.dotCircle}>
                <Text style={styles.dotNumber}>{index + 1}</Text>
              </View>
              {label.text && (
                <View style={styles.labelTextContainer}>
                  <Text style={styles.labelText}>{label.text}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </TouchableOpacity>
      </View>

      {labels.length > 0 && (
        <View style={styles.labelList}>
          <Text style={styles.labelListTitle}>Labels ({labels.length}):</Text>
          <ScrollView style={styles.labelListScroll}>
            {labels.map((label, index) => (
              <View key={label.tempId} style={styles.labelListItem}>
                <Text style={styles.labelListNumber}>{index + 1}.</Text>
                <Text style={styles.labelListText}>
                  {label.text || "(empty)"}
                </Text>
                {editable && (
                  <View style={styles.labelListActions}>
                    <TouchableOpacity
                      onPress={() => handleLabelEdit(label.tempId)}
                      style={styles.labelListButton}
                    >
                      <Text style={styles.labelListButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleLabelDelete(label.tempId)}
                      style={[styles.labelListButton, styles.deleteButton]}
                    >
                      <Text
                        style={[
                          styles.labelListButtonText,
                          styles.deleteButtonText,
                        ]}
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={editingLabel !== null}
        transparent
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Label</Text>

            <TextInput
              style={styles.modalInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="Enter label text"
              autoFocus
              maxLength={100}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleLabelTextSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Suggestions Modal */}
      <Modal
        visible={showAISuggestions}
        animationType="slide"
        onRequestClose={handleRejectSuggestions}
      >
        <AILabelSuggestions
          suggestions={suggestions}
          onApply={handleApplySuggestions}
          onReject={handleRejectSuggestions}
          loading={analyzing}
        />
      </Modal>

      {/* Quality Check Modal */}
      <Modal
        visible={showQualityCheck}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQualityCheck(false)}
      >
        <View style={styles.modalOverlay}>
          {qualityReport && (
            <DiagramQualityIndicator
              report={qualityReport}
              onProceed={() => setShowQualityCheck(false)}
              onRetry={() => {
                setShowQualityCheck(false);
                // User can upload a new image
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instructions: {
    backgroundColor: "#E6F4FE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: "#007AFF",
    textAlign: "center",
  },
  aiActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  aiButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  aiButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  qualityButton: {
    backgroundColor: "#10b981",
  },
  aiButtonIcon: {
    fontSize: 18,
  },
  aiButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    backgroundColor: "#f5f5f5",
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
    backgroundColor: "#007AFF",
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
  dotNumber: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  labelTextContainer: {
    position: "absolute",
    top: 28,
    left: -40,
    backgroundColor: "rgba(0, 122, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 80,
  },
  labelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  labelList: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  labelListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  labelListScroll: {
    maxHeight: 150,
  },
  labelListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  labelListNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    width: 30,
  },
  labelListText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  labelListActions: {
    flexDirection: "row",
    gap: 8,
  },
  labelListButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  labelListButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  deleteButtonText: {
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
