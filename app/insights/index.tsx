/**
 * Insights Screen
 * Shows weak areas and mistake patterns
 */

import { RemediationModal } from "@/src/components/insights/RemediationModal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WeakConceptCard } from "../../src/components/insights/WeakConceptCard";
import { useMistakeTracking } from "../../src/hooks/useMistakeTracking";
import type { MistakePattern } from "../../src/types/flashcard.types";

type SubjectFilter = "all" | "biology" | "physics" | "chemistry";

export default function InsightsScreen() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>("all");
  const [selectedPattern, setSelectedPattern] = useState<MistakePattern | null>(
    null,
  );
  const [showRemediationModal, setShowRemediationModal] = useState(false);

  const { patterns, loading, error, refresh } = useMistakeTracking(
    selectedSubject === "all" ? undefined : selectedSubject,
  );

  const subjects: { key: SubjectFilter; label: string; icon: string }[] = [
    { key: "all", label: "All", icon: "apps" },
    { key: "biology", label: "Biology", icon: "leaf" },
    { key: "physics", label: "Physics", icon: "planet" },
    { key: "chemistry", label: "Chemistry", icon: "flask" },
  ];

  const topWeakConcepts = patterns.slice(0, 5);

  const handleConceptPress = (pattern: MistakePattern) => {
    setSelectedPattern(pattern);
    setShowRemediationModal(true);
  };

  const handleCloseRemediation = () => {
    setShowRemediationModal(false);
    setSelectedPattern(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Learning Insights</Text>
          <TouchableOpacity onPress={refresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Compact Subject Filter */}
        <View style={styles.compactFilterContainer}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject.key}
              style={[
                styles.compactFilterChip,
                selectedSubject === subject.key &&
                  styles.compactFilterChipActive,
              ]}
              onPress={() => setSelectedSubject(subject.key)}
            >
              <Ionicons
                name={subject.icon as any}
                size={16}
                color={selectedSubject === subject.key ? "#fff" : "#6b7280"}
              />
              <Text
                style={[
                  styles.compactFilterText,
                  selectedSubject === subject.key &&
                    styles.compactFilterTextActive,
                ]}
              >
                {subject.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading insights...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : patterns.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            <Text style={styles.emptyTitle}>No Weak Areas Yet!</Text>
            <Text style={styles.emptyText}>
              Complete some quizzes to see your learning insights and areas for
              improvement.
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="analytics" size={20} color="#3b82f6" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{patterns.length}</Text>
                  <Text style={styles.statLabel}>Tracked</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{topWeakConcepts.length}</Text>
                  <Text style={styles.statLabel}>Need Focus</Text>
                </View>
              </View>
            </View>

            {/* Weak Concepts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Areas for Improvement</Text>
              <Text style={styles.sectionSubtitle}>
                Focus on these concepts to boost your performance
              </Text>

              {topWeakConcepts.map((pattern, index) => (
                <WeakConceptCard
                  key={pattern.pattern_id}
                  pattern={pattern}
                  rank={index + 1}
                  onPress={() => handleConceptPress(pattern)}
                />
              ))}
            </View>

            {/* All Patterns */}
            {patterns.length > 5 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Other Concepts</Text>
                {patterns.slice(5).map((pattern) => (
                  <WeakConceptCard
                    key={pattern.pattern_id}
                    pattern={pattern}
                    compact
                    onPress={() => handleConceptPress(pattern)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Remediation Modal */}
      <RemediationModal
        visible={showRemediationModal}
        pattern={selectedPattern}
        onClose={handleCloseRemediation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  refreshButton: {
    padding: 4,
  },
  compactFilterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  compactFilterChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  compactFilterChipActive: {
    backgroundColor: "#3b82f6",
  },
  compactFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  compactFilterTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 12,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
});
