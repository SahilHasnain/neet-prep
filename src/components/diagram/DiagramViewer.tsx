/**
 * DiagramViewer Component
 * Display diagram with labels (read-only mode for studying)
 */

import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DiagramLabel } from "../../types/flashcard.types";

interface DiagramViewerProps {
  imageUrl: string;
  labels: DiagramLabel[];
  showLabels?: boolean;
}

export function DiagramViewer({
  imageUrl,
  labels,
  showLabels = true,
}: DiagramViewerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Render label dots */}
        {labels.map((label, index) => (
          <View
            key={label.label_id}
            style={[
              styles.labelDot,
              {
                left: `${label.x_position}%`,
                top: `${label.y_position}%`,
              },
            ]}
          >
            <View style={styles.dotCircle}>
              <Text style={styles.dotNumber}>{index + 1}</Text>
            </View>
            {showLabels && (
              <View style={styles.labelTextContainer}>
                <Text style={styles.labelText}>{label.label_text}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Label list */}
      {showLabels && labels.length > 0 && (
        <View style={styles.labelList}>
          <Text style={styles.labelListTitle}>Labels:</Text>
          <ScrollView style={styles.labelListScroll}>
            {labels.map((label, index) => (
              <View key={label.label_id} style={styles.labelListItem}>
                <Text style={styles.labelListNumber}>{index + 1}.</Text>
                <Text style={styles.labelListText}>{label.label_text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
