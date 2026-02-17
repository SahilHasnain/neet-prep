/**
 * LabelEditor Component
 * Interactive editor for adding/editing labels on diagram images
 */

import React, { useState } from "react";
import {
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

interface LabelPosition {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  text: string;
  tempId: string;
}

interface LabelEditorProps {
  imageUrl: string;
  labels: LabelPosition[];
  onLabelsChange: (labels: LabelPosition[]) => void;
  editable?: boolean;
}

export function LabelEditor({
  imageUrl,
  labels,
  onLabelsChange,
  editable = true,
}: LabelEditorProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleImagePress = (event: any) => {
    if (!editable) return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = imageSize;

    if (width === 0 || height === 0) return;

    // Convert to percentage
    const xPercent = (locationX / width) * 100;
    const yPercent = (locationY / height) * 100;

    // Create new label
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
      // Remove empty label
      const updatedLabels = labels.filter((l) => l.tempId !== editingLabel);
      onLabelsChange(updatedLabels);
    }
    setEditingLabel(null);
    setEditText("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.instructions}>
        <View style={styles.instructionsRow}>
          {editable && (
            <Ionicons
              name="location"
              size={14}
              color="#007AFF"
              style={styles.instructionsIcon}
            />
          )}
          <Text style={styles.instructionsText}>
            {editable
              ? "Tap on the diagram to add labels"
              : "View labeled diagram"}
          </Text>
        </View>
      </View>

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

          {/* Render labels */}
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

      {/* Label list */}
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
    color: "#007AFF",
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
