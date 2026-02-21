/**
 * Doubt Pattern Card Component
 * Shows concepts students frequently ask about
 */

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DoubtPatternCardProps {
  pattern: {
    card_id: string;
    doubt_count: number;
    latest_doubt: string;
    context: string;
  };
  rank?: number;
  onPress?: () => void;
}

export function DoubtPatternCard({
  pattern,
  rank,
  onPress,
}: DoubtPatternCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        {rank && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{rank}</Text>
          </View>
        )}
        <View style={styles.iconContainer}>
          <Ionicons name="help-circle" size={20} color="#f59e0b" />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.conceptText} numberOfLines={2}>
            {pattern.context || pattern.latest_doubt}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="chatbubbles" size={14} color="#6b7280" />
          <Text style={styles.statText}>{pattern.doubt_count} doubts</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.latestDoubt} numberOfLines={2}>
          Latest: {pattern.latest_doubt}
        </Text>
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
    borderColor: "#fef3c7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  rankBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f59e0b",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  conceptText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    lineHeight: 20,
  },
  stats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: "#6b7280",
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  latestDoubt: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
    lineHeight: 18,
  },
});
