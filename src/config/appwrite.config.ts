/**
 * Appwrite Configuration
 * Centralized configuration for Appwrite services
 */

export const APPWRITE_CONFIG = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  apiKey: process.env.APPWRITE_API_KEY!,
} as const;

// Database and Collection IDs
export const DATABASE_ID = "flashcard_db";

export const COLLECTIONS = {
  FLASHCARD_DECKS: "flashcard_decks",
  FLASHCARDS: "flashcards",
  USER_PROGRESS: "user_progress",
  AI_GENERATION_LOGS: "ai_generation_logs",
  FLASHCARD_LABELS: "flashcard_labels",
  MISTAKE_PATTERNS: "mistake_patterns",
  QUIZ_ATTEMPTS: "quiz_attempts",
  CARD_REVIEWS: "card_reviews",
} as const;

// Storage Buckets
export const BUCKETS = {
  FLASHCARD_IMAGES: "flashcard_images",
} as const;

// Function IDs
export const FUNCTIONS = {
  GENERATE_FLASHCARDS: "generate-flashcards",
  GENERATE_FLASHCARDS_URL:
    process.env.EXPO_PUBLIC_GENERATE_FLASHCARDS_FUNCTION_URL!,
  ANALYZE_DIAGRAM: "analyze-diagram",
  ANALYZE_DIAGRAM_URL: process.env.EXPO_PUBLIC_ANALYZE_DIAGRAM_FUNCTION_URL!,
} as const;

// Validation Constants
export const VALIDATION = {
  MIN_CARDS_PER_GENERATION: 5,
  MAX_CARDS_PER_GENERATION: 50,
  MIN_DECK_TITLE_LENGTH: 3,
  MAX_DECK_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_CARD_CONTENT_LENGTH: 1000,
  MAX_TAGS_PER_CARD: 10,
} as const;
