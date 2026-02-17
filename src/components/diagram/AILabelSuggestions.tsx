/**
 * AILabelSuggestions Component
 * Displays AI-suggested labels for diagram flashcards
 */

import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Analyzing diagram...</Text>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No labels detected</Text>
        <Text style={styles.emptySubtext}>
          Try a clearer image or add labels manually
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          AI Detected {suggestions.length} Labels
        </Text>
        <Text style={styles.subtitle}>
          Select labels to add ({selectedIndices.length} selected)
        </Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {suggestions.map((suggestion, index) => {
          const isSelected = selectedIndices.includes(index);
          const confidenceColor = getConfidenceColor(suggestion.confidence);

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
              <View style={styles.suggestionContent}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.labelText}>{suggestion.label_text}</Text>
                  <View
                    style={[
                      styles.confidenceBadge,
                      { backgroundColor: confidenceColor },
                    ]}
                  >
                    <Text style={styles.confidenceText}>
                      {getConfidenceLabel(suggestion.confidence)}
                    </Text>
                  </View>
                </View>

                {suggestion.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {suggestion.description}
                  </Text>
                )}

                <Text style={styles.position}>
                  Position: ({Math.round(suggestion.x_position)}%,{" "}
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
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  list: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  suggestionItemSelected: {
    backgroundColor: "#eff6ff",
  },
  suggestionContent: {
    flex: 1,
    marginRight: 12,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  position: {
    fontSize: 12,
    color: "#9ca3af",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  applyButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
