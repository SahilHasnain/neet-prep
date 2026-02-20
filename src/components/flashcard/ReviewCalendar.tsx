/**
 * Review Calendar Component
 * Shows review stats, streak, and forecast
 */

import { StyleSheet, Text, View } from "react-native";
import { ReviewSessionStats } from "../../types/flashcard.types";

interface ReviewCalendarProps {
  stats: ReviewSessionStats | null;
}

export const ReviewCalendar = ({ stats }: ReviewCalendarProps) => {
  if (!stats) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review Statistics</Text>
        {stats.streak_days > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>
              {stats.streak_days} day streak
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.reviewed_today}</Text>
          <Text style={styles.statLabel}>Reviewed Today</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total_due}</Text>
          <Text style={styles.statLabel}>Due Now</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.new_cards}</Text>
          <Text style={styles.statLabel}>New</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.learning_cards}</Text>
          <Text style={styles.statLabel}>Learning</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Card Status</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressSegment,
              styles.newSegment,
              { flex: stats.new_cards || 0.1 },
            ]}
          />
          <View
            style={[
              styles.progressSegment,
              styles.learningSegment,
              { flex: stats.learning_cards || 0.1 },
            ]}
          />
          <View
            style={[
              styles.progressSegment,
              styles.reviewSegment,
              { flex: stats.review_cards || 0.1 },
            ]}
          />
          <View
            style={[
              styles.progressSegment,
              styles.masteredSegment,
              { flex: stats.mastered_cards || 0.1 },
            ]}
          />
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#3b82f6" }]} />
            <Text style={styles.legendText}>New ({stats.new_cards})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
            <Text style={styles.legendText}>
              Learning ({stats.learning_cards})
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#8b5cf6" }]} />
            <Text style={styles.legendText}>Review ({stats.review_cards})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
            <Text style={styles.legendText}>
              Mastered ({stats.mastered_cards})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.forecastSection}>
        <Text style={styles.sectionTitle}>Upcoming Reviews</Text>
        <View style={styles.forecastGrid}>
          <View style={styles.forecastCard}>
            <Text style={styles.forecastValue}>{stats.forecast.tomorrow}</Text>
            <Text style={styles.forecastLabel}>Tomorrow</Text>
          </View>
          <View style={styles.forecastCard}>
            <Text style={styles.forecastValue}>{stats.forecast.next_week}</Text>
            <Text style={styles.forecastLabel}>Next 7 Days</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakIcon: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  progressSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  progressBar: {
    flexDirection: "row",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressSegment: {
    height: "100%",
  },
  newSegment: {
    backgroundColor: "#3b82f6",
  },
  learningSegment: {
    backgroundColor: "#f59e0b",
  },
  reviewSegment: {
    backgroundColor: "#8b5cf6",
  },
  masteredSegment: {
    backgroundColor: "#10b981",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
  },
  forecastSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  forecastGrid: {
    flexDirection: "row",
    gap: 12,
  },
  forecastCard: {
    flex: 1,
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  forecastValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 4,
  },
  forecastLabel: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
  },
});
