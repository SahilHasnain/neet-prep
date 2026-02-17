import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DeckCard } from "../src/components/flashcard/DeckCard";
import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { NEET_SUBJECTS, NEET_TOPICS } from "../src/config/neet.config";
import { useDecks } from "../src/hooks/useDecks";
import { getSubjectIcon } from "../src/utils/neet-helpers";

const TEMP_USER_ID = "temp-user-123";

export default function Index() {
  const router = useRouter();
  const { decks, loading, error, createDeck, refresh } = useDecks(TEMP_USER_ID);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const subjects = Object.values(NEET_SUBJECTS);
  const topics = selectedSubject
    ? NEET_TOPICS[selectedSubject as keyof typeof NEET_TOPICS] || []
    : [];

  // Filter decks by search query
  const filteredDecks = decks.filter(
    (deck) =>
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const decksBySubject = filteredDecks.reduce(
    (acc, deck) => {
      const subject = deck.category || "Other";
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(deck);
      return acc;
    },
    {} as Record<string, typeof decks>,
  );

  // Calculate total cards across all decks
  const totalCards = decks.reduce((sum, deck) => sum + deck.card_count, 0);

  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim()) {
      Alert.alert("Error", "Please enter a deck title");
      return;
    }

    if (!selectedSubject) {
      Alert.alert("Error", "Please select a subject");
      return;
    }

    setCreating(true);
    const deck = await createDeck({
      title: newDeckTitle.trim(),
      description: newDeckDescription.trim(),
      category: selectedSubject,
    });

    setCreating(false);

    if (deck) {
      setShowCreateModal(false);
      setNewDeckTitle("");
      setNewDeckDescription("");
      setSelectedSubject("");
      setSelectedTopic("");
      Alert.alert("Success", "Deck created successfully!");
    } else {
      Alert.alert("Error", "Failed to create deck");
    }
  };

  const handleQuickCreate = (subject: string, topic: string) => {
    setNewDeckTitle(topic);
    setNewDeckDescription(`NEET ${subject} - ${topic}`);
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    setShowCreateModal(true);
  };

  const handleDeckPress = (deckId: string) => {
    router.push(`/deck/${deckId}`);
  };

  if (loading && decks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading your decks...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.heroHeader}>
        <View style={styles.heroContent}>
          <Text style={styles.appTitle}>NeuroPrep</Text>
          <Text style={styles.heroSubtitle}>
            Master NEET with Smart Flashcards
          </Text>
        </View>

        {decks.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{decks.length}</Text>
              <Text style={styles.statLabel}>Decks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalCards}</Text>
              <Text style={styles.statLabel}>Cards</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{subjects.length}</Text>
              <Text style={styles.statLabel}>Subjects</Text>
            </View>
          </View>
        )}
      </View>

      {decks.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Input
              placeholder="Search decks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {decks.length === 0 && !loading ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <Text style={styles.emptyIcon}>📚</Text>
          </View>
          <Text style={styles.emptyTitle}>Start Your NEET Journey</Text>
          <Text style={styles.emptyText}>
            Create flashcard decks for Physics, Chemistry, and Biology to ace
            your exam
          </Text>

          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.primaryCTAText}>+ Create Your First Deck</Text>
          </TouchableOpacity>

          <View style={styles.quickStartContainer}>
            <Text style={styles.quickStartTitle}>Quick Start Templates:</Text>

            {subjects.map((subject) => (
              <View key={subject} style={styles.subjectSection}>
                <Text style={styles.subjectTitle}>
                  {getSubjectIcon(subject)} {subject}
                </Text>
                <View style={styles.topicGrid}>
                  {NEET_TOPICS[subject as keyof typeof NEET_TOPICS]
                    ?.slice(0, 6)
                    .map((topic) => (
                      <TouchableOpacity
                        key={topic}
                        style={styles.topicChip}
                        onPress={() => handleQuickCreate(subject, topic)}
                      >
                        <Text style={styles.topicChipText}>{topic}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : filteredDecks.length === 0 && searchQuery ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.noResultsText}>
            Try a different search term or create a new deck
          </Text>
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={() => {
              setSearchQuery("");
              setShowCreateModal(true);
            }}
          >
            <Text style={styles.primaryCTAText}>+ Create New Deck</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {Object.entries(decksBySubject).map(([subject, subjectDecks]) => (
            <View key={subject} style={styles.subjectGroup}>
              <View style={styles.subjectGroupHeader}>
                <Text style={styles.subjectGroupTitle}>
                  {getSubjectIcon(subject)} {subject}
                </Text>
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectBadgeText}>
                    {subjectDecks.length}
                  </Text>
                </View>
              </View>
              {subjectDecks.map((deck) => (
                <DeckCard
                  key={deck.deck_id}
                  deck={deck}
                  onPress={() => handleDeckPress(deck.deck_id)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {decks.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create NEET Deck</Text>

              <View style={styles.subjectSelector}>
                <Text style={styles.inputLabel}>Subject *</Text>
                <View style={styles.subjectButtons}>
                  {subjects.map((subject) => (
                    <TouchableOpacity
                      key={subject}
                      style={[
                        styles.subjectButton,
                        selectedSubject === subject &&
                          styles.subjectButtonActive,
                      ]}
                      onPress={() => {
                        setSelectedSubject(subject);
                        setSelectedTopic("");
                      }}
                    >
                      <Text
                        style={[
                          styles.subjectButtonText,
                          selectedSubject === subject &&
                            styles.subjectButtonTextActive,
                        ]}
                      >
                        {getSubjectIcon(subject)} {subject}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {selectedSubject && topics.length > 0 && (
                <View style={styles.topicSelector}>
                  <Text style={styles.inputLabel}>Topic (Optional)</Text>
                  <ScrollView style={styles.topicList} nestedScrollEnabled>
                    {topics.map((topic) => (
                      <TouchableOpacity
                        key={topic}
                        style={[
                          styles.topicItem,
                          selectedTopic === topic && styles.topicItemActive,
                        ]}
                        onPress={() => {
                          setSelectedTopic(topic);
                          setNewDeckTitle(topic);
                        }}
                      >
                        <Text
                          style={[
                            styles.topicItemText,
                            selectedTopic === topic &&
                              styles.topicItemTextActive,
                          ]}
                        >
                          {topic}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Input
                label="Deck Title *"
                placeholder="e.g., Laws of Motion"
                value={newDeckTitle}
                onChangeText={setNewDeckTitle}
                maxLength={100}
              />

              <Input
                label="Description"
                placeholder="What topics will this deck cover?"
                value={newDeckDescription}
                onChangeText={setNewDeckDescription}
                maxLength={500}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <View style={styles.modalButton}>
                  <Button
                    title="Create Deck"
                    onPress={handleCreateDeck}
                    loading={creating}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  heroHeader: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  heroContent: {
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  clearIcon: {
    fontSize: 20,
    color: "#9ca3af",
    paddingHorizontal: 8,
  },
  loadingText: { fontSize: 16, color: "#666" },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  retryButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryCTA: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 32,
    minWidth: 200,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCTAText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  noResultsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  quickStartContainer: {
    marginTop: 16,
    width: "100%",
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  subjectSection: { marginBottom: 24 },
  subjectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  topicGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  topicChip: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  topicChipText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  listContent: { padding: 16, paddingBottom: 80 },
  subjectGroup: { marginBottom: 24 },
  subjectGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectGroupTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  subjectBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectBadgeText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "300",
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalScrollContent: { flexGrow: 1, justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  subjectSelector: { marginBottom: 16 },
  subjectButtons: { flexDirection: "row", gap: 8 },
  subjectButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  subjectButtonActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  subjectButtonText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
  },
  subjectButtonTextActive: { color: "#3b82f6", fontWeight: "600" },
  topicSelector: { marginBottom: 16 },
  topicList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 8,
  },
  topicItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  topicItemActive: { backgroundColor: "#eff6ff" },
  topicItemText: { fontSize: 14, color: "#374151" },
  topicItemTextActive: { color: "#3b82f6", fontWeight: "600" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalButton: { flex: 1 },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "#6b7280" },
});
