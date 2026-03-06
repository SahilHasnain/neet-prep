import { ReviewCalendar } from "@/src/components/flashcard/ReviewCalendar";
import { ReviewSession } from "@/src/components/flashcard/ReviewSession";
import { useSpacedRepetition } from "@/src/hooks/useSpacedRepetition";
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
import { THEME_CLASSES } from "../src/config/theme.config";
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
  const {
    dueCount,
    dueCardIds,
    stats,
    loading: reviewLoading,
    refresh: refreshReviews,
  } = useSpacedRepetition();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [firstDeckWithDueCards, setFirstDeckWithDueCards] = useState<
    string | undefined
  >();

  // Initialize user ID on mount
  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  // Refresh decks and reviews when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refresh();
        refreshReviews();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Find first deck with due cards - memoize to prevent infinite loops
  useEffect(() => {
    const findDeckWithDueCards = async () => {
      if (dueCardIds.length > 0 && decks.length > 0) {
        try {
          // Try to find which deck the first due card belongs to
          const { FlashcardService } =
            await import("../src/services/flashcard.service");

          // Check each deck to find one with due cards
          for (const deck of decks) {
            const cards = await FlashcardService.listDeckCards(deck.deck_id);
            const hasDueCard = cards.some((card) =>
              dueCardIds.includes(card.card_id),
            );

            if (hasDueCard) {
              setFirstDeckWithDueCards((prev) => {
                // Only update if changed to prevent infinite loops
                return prev !== deck.deck_id ? deck.deck_id : prev;
              });
              return;
            }
          }

          // Fallback: use first deck with cards
          const deckWithCards = decks.find((deck) => deck.card_count > 0);
          setFirstDeckWithDueCards((prev) => {
            const newValue = deckWithCards?.deck_id;
            return prev !== newValue ? newValue : prev;
          });
        } catch (error) {
          console.error("Error finding deck with due cards:", error);
          // Fallback: use first deck with cards
          const deckWithCards = decks.find((deck) => deck.card_count > 0);
          setFirstDeckWithDueCards((prev) => {
            const newValue = deckWithCards?.deck_id;
            return prev !== newValue ? newValue : prev;
          });
        }
      } else if (dueCardIds.length === 0) {
        // Clear when no due cards
        setFirstDeckWithDueCards(undefined);
      }
    };
    findDeckWithDueCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueCardIds.length, decks.length]);

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
      <View className="flex-1 bg-background-primary items-center justify-center">
        <Text className="text-base text-text-secondary">Loading your decks...</Text>
      </View>
    );
  }

  // Don't render until userId is loaded
  if (!userId) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <Text className="text-base text-text-secondary">Initializing...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className={THEME_CLASSES.screen} edges={["top", "bottom"]}>
      {/* Hero Header */}
      <View className="bg-gradient-to-br from-accent-primary to-accent-secondary px-4 pt-2 pb-2">
        <View className="mb-1.5">
          <Text className="text-[22px] font-bold text-white mb-0.5">NeuroPrep</Text>
          <Text className="text-xs text-white/90 font-medium">
            Master NEET with Smart Flashcards
          </Text>
        </View>

        {displayDecks.length > 0 && (
          <View className="flex-row justify-around items-center bg-white/15 rounded-lg py-1.5 mt-1.5">
            <View className="items-center flex-1">
              <Text className="text-lg font-bold text-white">{displayDecks.length}</Text>
              <Text className="text-[10px] text-white/85 mt-0.5">Decks</Text>
            </View>
            <View className="w-px h-6 bg-white/30" />
            <View className="items-center flex-1">
              <Text className="text-lg font-bold text-white">{totalCards}</Text>
              <Text className="text-[10px] text-white/85 mt-0.5">Cards</Text>
            </View>
            <View className="w-px h-6 bg-white/30" />
            <View className="items-center flex-1">
              <Text className="text-lg font-bold text-white">{subjects.length}</Text>
              <Text className="text-[10px] text-white/85 mt-0.5">Subjects</Text>
            </View>
          </View>
        )}

        <View className="flex-row gap-2 mt-2">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-accent-primary/20 py-2 px-3 rounded-lg active:bg-accent-primary/30 border border-accent-primary/30"
            onPress={() => router.push("/study-path/" as any)}
          >
            <Ionicons name="map" size={16} color="#8b5cf6" />
            <Text className="text-accent-primary text-[13px] font-semibold">Study Path</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-accent-secondary/20 py-2 px-3 rounded-lg active:bg-accent-secondary/30 border border-accent-secondary/30"
            onPress={() => router.push("/templates/" as any)}
          >
            <Ionicons name="albums" size={16} color="#3b82f6" />
            <Text className="text-accent-secondary text-[13px] font-semibold">Templates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-accent-success/20 py-2 px-3 rounded-lg active:bg-accent-success/30 border border-accent-success/30"
            onPress={() => router.push("/insights/" as any)}
          >
            <Ionicons name="analytics" size={16} color="#10b981" />
            <Text className="text-accent-success text-[13px] font-semibold">Insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {displayDecks.length > 0 && (
        <View className="px-4 py-2 bg-background-secondary">
          <View className="flex-row items-center bg-background-tertiary rounded-lg px-2.5 h-[38px]">
            <Ionicons name="search" size={18} color="#717171" />
            <TextInput
              placeholder="Search decks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-sm text-text-primary ml-1.5"
              placeholderTextColor="#717171"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close" size={18} color="#717171" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View className="m-4 p-4 bg-accent-error/10 rounded-xl border-l-4 border-accent-error flex-row justify-between items-center">
          <View className="flex-row items-center flex-1 mr-3">
            <Ionicons name="warning" size={20} color="#ef4444" />
            <Text className="text-accent-error text-sm ml-2">{error}</Text>
          </View>
          <TouchableOpacity
            className="bg-accent-error px-4 py-2 rounded-lg active:bg-accent-error/80"
            onPress={refresh}
          >
            <Text className="text-white font-semibold text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {displayDecks.length === 0 && !loading ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-[120px] h-[120px] rounded-full bg-accent-primary/20 justify-center items-center mb-6 border-2 border-accent-primary/30">
            <Ionicons name="library" size={64} color="#8b5cf6" />
          </View>
          <Text className={`${THEME_CLASSES.heading1} mb-2 text-center`}>
            Start Your NEET Journey
          </Text>
          <Text className="text-base text-text-secondary text-center mb-6 leading-6">
            Not sure where to start? Take our diagnostic quiz to get a personalized study path
          </Text>

          <TouchableOpacity
            className={`${THEME_CLASSES.buttonPrimary} flex-row gap-2 w-full max-w-[300px] mb-3`}
            onPress={() => router.push("/diagnostic/" as any)}
          >
            <Ionicons name="map" size={20} color="#fff" />
            <Text className="text-white text-base font-semibold">Take Diagnostic Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`${THEME_CLASSES.buttonOutline} flex-row gap-2 w-full max-w-[300px] mb-3`}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-circle" size={20} color="#8b5cf6" />
            <Text className="text-accent-primary text-base font-semibold">Create Deck Manually</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`${THEME_CLASSES.buttonOutline} flex-row gap-2 w-full max-w-[300px]`}
            onPress={() => router.push("/templates/" as any)}
          >
            <Ionicons name="albums" size={20} color="#8b5cf6" />
            <Text className="text-accent-primary text-base font-semibold">Browse Templates</Text>
          </TouchableOpacity>
        </View>
      ) : filteredDecks.length === 0 && searchQuery ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="search" size={64} color="#717171" />
          <Text className={`${THEME_CLASSES.heading1} mb-2 text-center`}>
            No Results Found
          </Text>
          <Text className="text-base text-text-secondary text-center mb-6">
            Try a different search term or create a new deck
          </Text>
          <TouchableOpacity
            className={`${THEME_CLASSES.buttonPrimary} w-full max-w-[300px]`}
            onPress={() => {
              setSearchQuery("");
              setShowCreateModal(true);
            }}
          >
            <Text className="text-white text-base font-semibold">+ Create New Deck</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pb-20">
          {dueCount > 0 && (
            <ReviewSession dueCount={dueCount} deckId={firstDeckWithDueCards} />
          )}

          {stats && <ReviewCalendar stats={stats} />}

          {Object.entries(decksBySubject).map(([subject, subjectDecks]) => {
            const { Component: IconComponent, name: iconName } =
              getSubjectIconComponent(subject);
            return (
              <View key={subject} className="mb-6">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center gap-2">
                    <IconComponent
                      name={iconName as any}
                      size={20}
                      color="#ffffff"
                    />
                    <Text className={THEME_CLASSES.heading3}>{subject}</Text>
                  </View>
                  <View className="bg-accent-primary/20 px-2.5 py-1 rounded-full border border-accent-primary/30">
                    <Text className="text-accent-primary text-sm font-semibold">
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

      {/* FAB */}
      {displayDecks.length > 0 && (
        <TouchableOpacity
          className="absolute right-5 bottom-[50px] w-14 h-14 rounded-full bg-accent-primary justify-center items-center active:bg-accent-primary/80"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Create Deck Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1">
              <TouchableWithoutFeedback>
                <View className="flex-1 justify-end">
                  <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <View className="bg-background-secondary rounded-t-[20px] p-6 max-h-[90%]">
                      <Text className={`${THEME_CLASSES.heading1} mb-6`}>
                        Create NEET Deck
                      </Text>

                      {/* Subject Selector */}
                      <View className="mb-4">
                        <Text className="text-sm font-semibold mb-2 text-text-secondary">
                          Subject *
                        </Text>
                        <View className="flex-row gap-2">
                          {subjects.map((subject) => {
                            const { Component: IconComponent, name: iconName } =
                              getSubjectIconComponent(subject);
                            const isActive = selectedSubject === subject;
                            return (
                              <TouchableOpacity
                                key={subject}
                                className={`flex-1 py-3 px-2 rounded-lg border-2 items-center ${
                                  isActive
                                    ? "border-accent-primary bg-accent-primary/10"
                                    : "border-border-primary"
                                }`}
                                onPress={() => {
                                  setSelectedSubject(subject);
                                  setSelectedTopic("");
                                }}
                              >
                                <View className="flex-row items-center gap-1">
                                  <IconComponent
                                    name={iconName as any}
                                    size={16}
                                    color={isActive ? "#8b5cf6" : "#717171"}
                                  />
                                  <Text
                                    className={`text-xs font-medium text-center ${
                                      isActive ? "text-accent-primary font-semibold" : "text-text-tertiary"
                                    }`}
                                  >
                                    {subject}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      {/* Topic Selector */}
                      {selectedSubject && topics.length > 0 && (
                        <View className="mb-4">
                          <Text className="text-sm font-semibold mb-2 text-text-secondary">
                            Topic (Optional)
                          </Text>
                          <ScrollView
                            className="max-h-[150px] border border-border-primary rounded-lg p-2"
                            nestedScrollEnabled
                          >
                            {topics.map((topic) => (
                              <TouchableOpacity
                                key={topic}
                                className={`py-2 px-3 rounded-md mb-1 ${
                                  selectedTopic === topic ? "bg-accent-primary/10" : ""
                                }`}
                                onPress={() => {
                                  setSelectedTopic(topic);
                                  setNewDeckTitle(topic);
                                }}
                              >
                                <Text
                                  className={`text-sm ${
                                    selectedTopic === topic
                                      ? "text-accent-primary font-semibold"
                                      : "text-text-secondary"
                                  }`}
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

                      <View className="flex-row gap-3 mt-2">
                        <TouchableOpacity
                          className="flex-1 bg-background-tertiary rounded-lg py-3 items-center justify-center active:bg-interactive-hover"
                          onPress={() => setShowCreateModal(false)}
                          disabled={creating}
                        >
                          <Text className="text-base font-semibold text-text-secondary">Cancel</Text>
                        </TouchableOpacity>

                        <View className="flex-1">
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
