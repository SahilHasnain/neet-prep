import { getOrCreateUserId } from "@/src/utils/user-id";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DeckCard } from "../src/components/flashcard/DeckCard";
import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { NEET_SUBJECTS, NEET_TOPICS } from "../src/config/neet.config";
import { useDecks } from "../src/hooks/useDecks";
import {
  getSubjectIconFamily,
  getSubjectIconName,
} from "../src/utils/neet-helpers";

// Dev flag to test empty state - set to true to force empty state
const FORCE_EMPTY_STATE = false;

export default function Index() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const { decks, loading, error, createDeck, refresh } = useDecks(userId || "");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize user ID on mount
  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  // Refresh decks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refresh();
      }
    }, [userId, refresh]),
  );

  const subjects = Object.values(NEET_SUBJECTS);
  const topics = selectedSubject
    ? NEET_TOPICS[selectedSubject as keyof typeof NEET_TOPICS] || []
    : [];

  // Apply dev flag to force empty state for testing
  const displayDecks = FORCE_EMPTY_STATE ? [] : decks;

  // Filter decks by search query
  const filteredDecks = displayDecks.filter(
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
  const totalCards = displayDecks.reduce(
    (sum, deck) => sum + deck.card_count,
    0,
  );

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

  const handleDeckPress = (deckId: string) => {
    router.push(`/deck/${deckId}`);
  };

  const getSubjectIconComponent = (subject: string) => {
    const iconName = getSubjectIconName(subject);
    const iconFamily = getSubjectIconFamily(subject);
    return iconFamily === "material-community"
      ? { Component: MaterialCommunityIcons, name: iconName }
      : { Component: Ionicons, name: iconName };
  };

  if (loading && displayDecks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading your decks...</Text>
      </View>
    );
  }

  // Don't render until userId is loaded
  if (!userId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Initializing...</Text>
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

        {displayDecks.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{displayDecks.length}</Text>
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

        <TouchableOpacity
          style={styles.templatesButton}
          onPress={() => router.push("/templates/" as any)}
        >
          <Ionicons name="albums" size={20} color="#3b82f6" />
          <Text style={styles.templatesButtonText}>Browse Templates</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.insightsButton}
          onPress={() => router.push("/insights/" as any)}
        >
          <Ionicons name="analytics" size={20} color="#10b981" />
          <Text style={styles.insightsButtonText}>Learning Insights</Text>
        </TouchableOpacity>
      </View>

      {displayDecks.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#6b7280"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search decks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#9ca3af"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close"
                  size={20}
                  color="#9ca3af"
                  style={styles.clearIcon}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Ionicons name="warning" size={20} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {displayDecks.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <Ionicons name="library" size={64} color="#3b82f6" />
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
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.primaryCTAText}>Create Deck</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryCTA}
            onPress={() => router.push("/templates/" as any)}
          >
            <Ionicons name="albums" size={20} color="#3b82f6" />
            <Text style={styles.secondaryCTAText}>Browse Templates</Text>
          </TouchableOpacity>
        </View>
      ) : filteredDecks.length === 0 && searchQuery ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search" size={64} color="#9ca3af" />
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
          {Object.entries(decksBySubject).map(([subject, subjectDecks]) => {
            const { Component: IconComponent, name: iconName } =
              getSubjectIconComponent(subject);
            return (
              <View key={subject} style={styles.subjectGroup}>
                <View style={styles.subjectGroupHeader}>
                  <View style={styles.subjectGroupTitleContainer}>
                    <IconComponent
                      name={iconName as any}
                      size={20}
                      color="#1f2937"
                    />
                    <Text style={styles.subjectGroupTitle}>{subject}</Text>
                  </View>
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
            );
          })}
        </ScrollView>
      )}

      {displayDecks.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalWrapper}>
                  <ScrollView
                    contentContainerStyle={styles.modalScrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Create NEET Deck</Text>

                      <View style={styles.subjectSelector}>
                        <Text style={styles.inputLabel}>Subject *</Text>
                        <View style={styles.subjectButtons}>
                          {subjects.map((subject) => {
                            const { Component: IconComponent, name: iconName } =
                              getSubjectIconComponent(subject);
                            const isActive = selectedSubject === subject;
                            return (
                              <TouchableOpacity
                                key={subject}
                                style={[
                                  styles.subjectButton,
                                  isActive && styles.subjectButtonActive,
                                ]}
                                onPress={() => {
                                  setSelectedSubject(subject);
                                  setSelectedTopic("");
                                }}
                              >
                                <View style={styles.subjectButtonContent}>
                                  <IconComponent
                                    name={iconName as any}
                                    size={16}
                                    color={isActive ? "#3b82f6" : "#6b7280"}
                                  />
                                  <Text
                                    style={[
                                      styles.subjectButtonText,
                                      isActive &&
                                        styles.subjectButtonTextActive,
                                    ]}
                                  >
                                    {subject}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      {selectedSubject && topics.length > 0 && (
                        <View style={styles.topicSelector}>
                          <Text style={styles.inputLabel}>
                            Topic (Optional)
                          </Text>
                          <ScrollView
                            style={styles.topicList}
                            nestedScrollEnabled
                          >
                            {topics.map((topic) => (
                              <TouchableOpacity
                                key={topic}
                                style={[
                                  styles.topicItem,
                                  selectedTopic === topic &&
                                    styles.topicItemActive,
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
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  heroContent: {
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  templatesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  templatesButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  insightsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  insightsButtonText: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    paddingVertical: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 1,
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
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    padding: 0,
  },
  clearIcon: {
    padding: 4,
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
  errorContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    marginLeft: 8,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
    maxWidth: 300,
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
  secondaryCTA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    maxWidth: 300,
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  secondaryCTAText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
  subjectTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
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
  subjectGroupTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    bottom: 50,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
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
  subjectButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
