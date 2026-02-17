/**
 * LabelEditorWithAI Component
 * Enhanced LabelEditor with AI label suggestions
 */

import { Ionicons } from "@expo/vector-icons";
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
    } catch (error) {
      Alert.alert("Error", "Failed to analyze diagram. Please try again.");
    }
  };

  const handleCheckQuality = async () => {
    try {
      await assessQuality(imageId, imageUrl);
      setShowQualityCheck(true);
    } catch (error) {
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
    } catch (error) {
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
        <View style={styles.instructionsRow}>
          {editable && (
            <Ionicons
              name="location"
              size={16}
              color="#1e40af"
              style={styles.instructionsIcon}
            />
          )}
          <Text style={styles.instructionsText}>
            {editable
              ? "Tap on the diagram to add labels or use AI"
              : "View labeled diagram"}
          </Text>
        </View>
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
                <Ionicons name="sparkles" size={20} color="#fff" />
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
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.aiButtonText}>Check Quality</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <View style={styles.errorRow}>
            <Ionicons name="warning" size={16} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
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
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  instructionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  instructionsIcon: {
    marginTop: 1,
  },
  instructionsText: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "500",
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    minHeight: 48,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  aiButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
  },
  qualityButton: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
  },
  aiButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
  },
  imageContainer: {
    position: "relative",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 300,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  image: {
    width: "100%",
    height: 300,
  },
  labelDot: {
    position: "absolute",
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  dotCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  dotNumber: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  labelTextContainer: {
    position: "absolute",
    top: 40,
    left: -50,
    backgroundColor: "rgba(59, 130, 246, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  labelText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  labelList: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  labelListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  labelListScroll: {
    maxHeight: 150,
  },
  labelListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  labelListNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b82f6",
    width: 35,
  },
  labelListText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  labelListActions: {
    flexDirection: "row",
    gap: 8,
  },
  labelListButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    minHeight: 32,
    justifyContent: "center",
  },
  labelListButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  deleteButtonText: {
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f9fafb",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
