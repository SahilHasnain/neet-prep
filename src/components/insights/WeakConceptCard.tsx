/**
 * Weak Concept Card Component
 * Displays a mistake pattern with visual indicators
 */

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { MistakePattern } from "../../types/flashcard.types";
import { getConceptDisplayName } from "../../utils/concept-mapper";

interface WeakConceptCardProps {
  pattern: MistakePattern;
  rank?: number;
  compact?: boolean;
  onPress?: () => void;
}

export function WeakConceptCard({
  pattern,
  rank,
  compact = false,
  onPress,
}: WeakConceptCardProps) {
  const conceptName = getConceptDisplayName(pattern.concept_id);
  const lastMistake = new Date(pattern.last_occurrence);
  const daysAgo = Math.floor(
    (Date.now() - lastMistake.getTime()) / (1000 * 60 * 60 * 24),
  );

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "biology":
        return "#10b981";
      case "physics":
        return "#3b82f6";
      case "chemistry":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getSeverityLevel = (count: number) => {
    if (count >= 5) return { label: "High", color: "#ef4444" };
    if (count >= 3) return { label: "Medium", color: "#f59e0b" };
    return { label: "Low", color: "#10b981" };
  };

  const severity = getSeverityLevel(pattern.mistake_count);
  const subjectColor = getSubjectColor(pattern.subject);

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactLeft}>
          <View
            style={[styles.subjectDot, { backgroundColor: subjectColor }]}
          />
          <Text style={styles.compactName}>{conceptName}</Text>
        </View>
        <View style={styles.compactRight}>
          <Text style={styles.compactCount}>{pattern.mistake_count}×</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Rank Badge */}
      {rank && (
        <View style={[styles.rankBadge, { backgroundColor: subjectColor }]}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[styles.subjectBadge, { backgroundColor: subjectColor }]}
          >
            <Text style={styles.subjectText}>
              {pattern.subject.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.conceptName}>{conceptName}</Text>
            <Text style={styles.topicText}>
              {pattern.topic.replace(/_/g, " ")}
            </Text>
          </View>
        </View>
        <View
          style={[styles.severityBadge, { backgroundColor: severity.color }]}
        >
          <Text style={styles.severityText}>{severity.label}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="close-circle" size={20} color="#ef4444" />
          <Text style={styles.statValue}>{pattern.mistake_count}</Text>
          <Text style={styles.statLabel}>Mistakes</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="time" size={20} color="#6b7280" />
          <Text style={styles.statValue}>
            {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
          </Text>
          <Text style={styles.statLabel}>Last Error</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="help-circle" size={20} color="#3b82f6" />
          <Text style={styles.statValue}>
            {pattern.related_questions.length}
          </Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>
      </View>

      {/* Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.practiceButton} onPress={onPress}>
          <Ionicons name="school" size={18} color="#fff" />
          <Text style={styles.practiceButtonText}>Practice This</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  rankBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subjectBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  subjectText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerInfo: {
    flex: 1,
  },
  conceptName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  topicText: {
    fontSize: 13,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  stats: {
    flexDirection: "row",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
  },
  footer: {
    marginTop: 12,
  },
  practiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
  },
  practiceButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  compactCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  compactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  compactName: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "500",
  },
  compactRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compactCount: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
});
