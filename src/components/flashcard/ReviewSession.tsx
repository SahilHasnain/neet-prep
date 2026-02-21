/**
 * Review Session Component
 * Displays due cards count and review progress
 */

import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ReviewSessionProps {
  dueCount: number;
  deckId?: string;
  deckTitle?: string;
}

export const ReviewSession = ({
  dueCount,
  deckId,
  deckTitle,
}: ReviewSessionProps) => {
  const router = useRouter();

  if (dueCount === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✨</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>No cards due for review</Text>
        </View>
      </View>
    );
  }

  const handleStartReview = () => {
    if (deckId) {
      router.push(`/study/${deckId}?reviewMode=true`);
    } else {
      // If no specific deck, this means we couldn't find which deck has the due cards
      // This is an edge case that shouldn't normally happen
      console.warn(
        "No deckId provided for review session - unable to start review",
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{dueCount}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Cards Due for Review</Text>
            {deckTitle && <Text style={styles.subtitle}>{deckTitle}</Text>}
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleStartReview}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Start Review</Text>
          <Text style={styles.buttonIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  badge: {
    backgroundColor: "#10b981",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  badgeText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  button: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
