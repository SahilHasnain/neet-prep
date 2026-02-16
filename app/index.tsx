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

  const subjects = Object.values(NEET_SUBJECTS);
  const topics = selectedSubject
    ? NEET_TOPICS[selectedSubject as keyof typeof NEET_TOPICS] || []
    : [];

  const decksBySubject = decks.reduce(
    (acc, deck) => {
      const subject = deck.category || "Other";
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(deck);
      return acc;
    },
    {} as Record<string, typeof decks>,
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
    <SafeAreaView style={styles.container} edges={["top","bottom"]}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>NeuroPrep</Text>
        <Text style={styles.subtitle}>NEET Flashcards</Text>
        <Button title="+ New Deck" onPress={() => setShowCreateModal(true)} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={refresh} variant="secondary" />
        </View>
      )}

      {decks.length === 0 && !loading ? (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Start Your NEET Preparation</Text>
          <Text style={styles.emptyText}>
            Create flashcard decks for Physics, Chemistry, and Biology
          </Text>

          <View style={styles.quickStartContainer}>
            <Text style={styles.quickStartTitle}>Quick Start:</Text>

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
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {Object.entries(decksBySubject).map(([subject, subjectDecks]) => (
            <View key={subject} style={styles.subjectGroup}>
              <Text style={styles.subjectGroupTitle}>
                {getSubjectIcon(subject)} {subject} ({subjectDecks.length})
              </Text>
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
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 16 },
  loadingText: { fontSize: 16, color: "#666" },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fee",
    borderRadius: 8,
  },
  errorText: { color: "#c00", marginBottom: 12 },
  emptyContainer: { padding: 24 },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  quickStartContainer: { marginTop: 16 },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  subjectSection: { marginBottom: 24 },
  subjectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  topicGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  topicChip: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  topicChipText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  listContent: { padding: 16 },
  subjectGroup: { marginBottom: 24 },
  subjectGroupTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
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
    color: "#333",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  subjectSelector: { marginBottom: 16 },
  subjectButtons: { flexDirection: "row", gap: 8 },
  subjectButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
  },
  subjectButtonActive: { borderColor: "#007AFF", backgroundColor: "#E6F4FE" },
  subjectButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  subjectButtonTextActive: { color: "#007AFF", fontWeight: "600" },
  topicSelector: { marginBottom: 16 },
  topicList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
  },
  topicItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  topicItemActive: { backgroundColor: "#E6F4FE" },
  topicItemText: { fontSize: 14, color: "#333" },
  topicItemTextActive: { color: "#007AFF", fontWeight: "600" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalButton: { flex: 1 },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "#666" },
});
