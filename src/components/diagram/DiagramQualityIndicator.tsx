/**
 * DiagramQualityIndicator Component
 * Displays diagram quality assessment results
 */

import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  scoreMax: {
    fontSize: 14,
    color: "#6b7280",
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bullet: {
    fontSize: 16,
    color: "#6b7280",
    marginRight: 8,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  metadata: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 20,
  },
  metadataText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
  actions: {
    gap: 12,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  proceedButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#10b981",
    alignItems: "center",
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  proceedAnywayButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  proceedAnywayButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
});
