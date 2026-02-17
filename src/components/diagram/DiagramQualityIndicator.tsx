/**
 * DiagramQualityIndicator Component
 * Displays diagram quality assessment results
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { DiagramQualityReport } from "../../types/flashcard.types";

interface DiagramQualityIndicatorProps {
  report: DiagramQualityReport;
  onProceed: () => void;
  onRetry: () => void;
}

export function DiagramQualityIndicator({
  report,
  onProceed,
  onRetry,
}: DiagramQualityIndicatorProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "#10b981"; // Green
    if (score >= 6) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    return "Poor";
  };

  const scoreColor = getScoreColor(report.score);
  const scoreLabel = getScoreLabel(report.score);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quality Assessment</Text>
      </View>

      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {report.score.toFixed(1)}
          </Text>
          <Text style={styles.scoreMax}>/10</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>
            {scoreLabel}
          </Text>
          <Text style={styles.scoreDescription}>
            {report.is_acceptable
              ? "This image is suitable for learning"
              : "Consider uploading a better quality image"}
          </Text>
        </View>
      </View>

      {report.issues.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issues Found:</Text>
          {report.issues.map((issue, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{issue}</Text>
            </View>
          ))}
        </View>
      )}

      {report.suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions:</Text>
          {report.suggestions.map((suggestion, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{suggestion}</Text>
            </View>
          ))}
        </View>
      )}

      {report.metadata && (
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            {report.metadata.width}x{report.metadata.height} •{" "}
            {(report.metadata.size / 1024).toFixed(0)}KB •{" "}
            {report.metadata.format.toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {!report.is_acceptable && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Upload Better Image</Text>
          </TouchableOpacity>
        )}

        {report.is_acceptable && (
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={onProceed}
            activeOpacity={0.7}
          >
            <Text style={styles.proceedButtonText}>Proceed</Text>
          </TouchableOpacity>
        )}

        {!report.is_acceptable && (
          <TouchableOpacity
            style={styles.proceedAnywayButton}
            onPress={onProceed}
            activeOpacity={0.7}
          >
            <Text style={styles.proceedAnywayButtonText}>Proceed Anyway</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    maxWidth: 500,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "700",
  },
  scoreMax: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },
  scoreDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 18,
    color: "#d97706",
    marginRight: 10,
    fontWeight: "bold",
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: "#78350f",
    lineHeight: 20,
    fontWeight: "500",
  },
  metadata: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#e5e7eb",
    marginBottom: 24,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  metadataText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "600",
  },
  actions: {
    gap: 12,
  },
  retryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    minHeight: 52,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  proceedButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#10b981",
    alignItems: "center",
    minHeight: 52,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  proceedAnywayButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    backgroundColor: "#fff",
    minHeight: 52,
  },
  proceedAnywayButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
});
