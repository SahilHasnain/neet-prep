/**
 * AILabelSuggestions Component
 * Displays AI-suggested labels for diagram flashcards
 */

import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { LabelSuggestion } from "../../types/flashcard.types";

interface AILabelSuggestionsProps {
  suggestions: LabelSuggestion[];
  onApply: (selectedIndices: number[]) => Promise<void>;
  onReject: () => void;
  loading?: boolean;
}

export function AILabelSuggestions({
  suggestions,
  onApply,
  onReject,
  loading = false,
}: AILabelSuggestionsProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    suggestions.map((_, i) => i), // All selected by default
  );
  const [applying, setApplying] = useState(false);

  const toggleSelection = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleApply = async () => {
    if (selectedIndices.length === 0) {
      return;
    }

    try {
      setApplying(true);
      await onApply(selectedIndices);
    } finally {
      setApplying(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "#10b981"; // Green
    if (confidence >= 0.6) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  const getConfidencePercentage = (confidence: number) => {
    return Math.round(confidence * 100);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingAnimation}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
        <Text style={styles.loadingText}>🤖 AI Analyzing Diagram...</Text>
        <Text style={styles.loadingSubtext}>
          Detecting labels and positions
        </Text>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIllustration}>
          <Text style={styles.emptyIcon}>🔍</Text>
        </View>
        <Text style={styles.emptyText}>No Labels Detected</Text>
        <Text style={styles.emptySubtext}>
          Try a clearer image with visible labels or add them manually
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={onReject}>
          <Text style={styles.emptyButtonText}>Add Manually</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          🎯 AI Detected {suggestions.length} Label
          {suggestions.length !== 1 ? "s" : ""}
        </Text>
        <Text style={styles.subtitle}>
          Review and select labels to add • {selectedIndices.length} selected
        </Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {suggestions.map((suggestion, index) => {
          const isSelected = selectedIndices.includes(index);
          const confidenceColor = getConfidenceColor(suggestion.confidence);
          const confidencePercent = getConfidencePercentage(
            suggestion.confidence,
          );

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.suggestionItem,
                isSelected && styles.suggestionItemSelected,
              ]}
              onPress={() => toggleSelection(index)}
              activeOpacity={0.7}
            >
              <View style={styles.suggestionNumber}>
                <Text style={styles.suggestionNumberText}>{index + 1}</Text>
              </View>

              <View style={styles.suggestionContent}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.labelText} numberOfLines={1}>
                    {suggestion.label_text}
                  </Text>
                </View>

                {suggestion.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {suggestion.description}
                  </Text>
                )}

                <View style={styles.metaRow}>
                  <View style={styles.confidenceContainer}>
                    <View style={styles.confidenceBar}>
                      <View
                        style={[
                          styles.confidenceFill,
                          {
                            width: `${confidencePercent}%`,
                            backgroundColor: confidenceColor,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.confidenceLabel,
                        { color: confidenceColor },
                      ]}
                    >
                      {confidencePercent}%{" "}
                      {getConfidenceLabel(suggestion.confidence)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.position}>
                  📍 Position: ({Math.round(suggestion.x_position)}%,{" "}
                  {Math.round(suggestion.y_position)}%)
                </Text>
              </View>

              <View
                style={[styles.checkbox, isSelected && styles.checkboxSelected]}
              >
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={onReject}
          disabled={applying}
        >
          <Text style={styles.rejectButtonText}>Reject All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.applyButton,
            (selectedIndices.length === 0 || applying) &&
              styles.applyButtonDisabled,
          ]}
          onPress={handleApply}
          disabled={selectedIndices.length === 0 || applying}
        >
          {applying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.applyButtonText}>
              Apply Selected ({selectedIndices.length})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  loadingAnimation: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#fff",
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  suggestionItemSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  suggestionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  suggestionNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  suggestionContent: {
    flex: 1,
    marginRight: 12,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 18,
  },
  metaRow: {
    marginBottom: 6,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 3,
  },
  confidenceLabel: {
    fontSize: 11,
    fontWeight: "700",
    minWidth: 70,
  },
  position: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "500",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  checkmark: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
    backgroundColor: "#fff",
    minHeight: 48,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    minHeight: 48,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
