import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FLASHCARD_TEMPLATES,
  getAllCategories,
  type FlashcardTemplate,
} from "../../src/config/templates.config";
import { TemplateService } from "../../src/services/template.service";
import {
  getSubjectIconFamily,
  getSubjectIconName,
} from "../../src/utils/neet-helpers";
import { getOrCreateUserId } from "../../src/utils/user-id";

export default function TemplatesScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(
    null,
  );

  // Initialize user ID on mount
  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  const categories = ["All", ...getAllCategories()];

  const filteredTemplates = FLASHCARD_TEMPLATES.filter((template) => {
    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = async (template: FlashcardTemplate) => {
    if (!userId) return;

    setCreatingTemplateId(template.id);

    const deck = await TemplateService.createDeckFromTemplate(
      userId,
      template.id,
    );

    setCreatingTemplateId(null);

    if (deck) {
      Alert.alert(
        "Success!",
        `Created "${template.title}" with ${template.cardCount} cards`,
        [
          {
            text: "View Deck",
            onPress: () => router.push(`/deck/${deck.deck_id}`),
          },
          { text: "Browse More", style: "cancel" },
        ],
      );
    } else {
      Alert.alert("Error", "Failed to create deck from template");
    }
  };

  const getSubjectIconComponent = (subject: string) => {
    const iconName = getSubjectIconName(subject);
    const iconFamily = getSubjectIconFamily(subject);
    return iconFamily === "material-community"
      ? { Component: MaterialCommunityIcons, name: iconName }
      : { Component: Ionicons, name: iconName };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#10b981";
      case "medium":
        return "#f59e0b";
      case "hard":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {!userId ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Flashcard Templates</Text>
              <Text style={styles.headerSubtitle}>
                Start learning with pre-made decks
              </Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search"
                size={20}
                color="#6b7280"
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search templates..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                placeholderTextColor="#9ca3af"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              const { Component: IconComponent, name: iconName } =
                category === "All"
                  ? { Component: Ionicons, name: "apps" }
                  : getSubjectIconComponent(category);

              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    isActive && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <IconComponent
                    name={iconName as any}
                    size={14}
                    color={isActive ? "#fff" : "#6b7280"}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isActive && styles.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            {filteredTemplates.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={64} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No Templates Found</Text>
                <Text style={styles.emptyText}>
                  Try a different search term or category
                </Text>
              </View>
            ) : (
              filteredTemplates.map((template) => {
                const isCreating = creatingTemplateId === template.id;
                const { Component: IconComponent, name: iconName } =
                  getSubjectIconComponent(template.category);

                return (
                  <View key={template.id} style={styles.templateCard}>
                    <View style={styles.templateHeader}>
                      <View style={styles.templateIconContainer}>
                        <IconComponent
                          name={iconName as any}
                          size={24}
                          color="#3b82f6"
                        />
                      </View>
                      <View style={styles.templateHeaderText}>
                        <Text style={styles.templateTitle}>
                          {template.title}
                        </Text>
                        <Text style={styles.templateTopic}>
                          {template.topic}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.templateDescription}>
                      {template.description}
                    </Text>

                    <View style={styles.templateMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="layers" size={16} color="#6b7280" />
                        <Text style={styles.metaText}>
                          {template.cardCount} cards
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.difficultyBadge,
                          {
                            backgroundColor: `${getDifficultyColor(template.difficulty)}20`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.difficultyText,
                            { color: getDifficultyColor(template.difficulty) },
                          ]}
                        >
                          {template.difficulty}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.useButton,
                        isCreating && styles.useButtonDisabled,
                      ]}
                      onPress={() => handleUseTemplate(template)}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <Text style={styles.useButtonText}>Creating...</Text>
                      ) : (
                        <>
                          <Ionicons name="add-circle" size={20} color="#fff" />
                          <Text style={styles.useButtonText}>Use Template</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
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
  categoryScroll: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    maxHeight: 50,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryChipActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  templateCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  templateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  templateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  templateHeaderText: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  templateTopic: {
    fontSize: 14,
    color: "#6b7280",
  },
  templateDescription: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 12,
  },
  templateMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#6b7280",
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  useButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 10,
  },
  useButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  useButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
