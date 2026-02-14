/**
 * Flashcard Feature Type Definitions
 * Enterprise-level type safety for the flashcard system
 */

// Enums
export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum GenerationStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

// Database Models
export interface FlashcardDeck {
  deck_id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  is_public: boolean;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  card_id: string;
  deck_id: string;
  front_content: string;
  back_content: string;
  difficulty: DifficultyLevel;
  tags: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  progress_id: string;
  user_id: string;
  card_id: string;
  deck_id: string;
  mastery_level: number; // 0-5
  last_reviewed: string;
  next_review: string;
  review_count: number;
  correct_count: number;
  incorrect_count: number;
}

export interface AIGenerationLog {
  log_id: string;
  user_id: string;
  deck_id?: string;
  prompt: string;
  cards_generated: number;
  status: GenerationStatus;
  error_message?: string;
  created_at: string;
}

// DTOs (Data Transfer Objects)
export interface CreateDeckDTO {
  title: string;
  description?: string;
  category?: string;
  is_public?: boolean;
}

export interface UpdateDeckDTO {
  title?: string;
  description?: string;
  category?: string;
  is_public?: boolean;
}

export interface CreateFlashcardDTO {
  deck_id: string;
  front_content: string;
  back_content: string;
  difficulty?: DifficultyLevel;
  tags?: string[];
}

export interface UpdateFlashcardDTO {
  front_content?: string;
  back_content?: string;
  difficulty?: DifficultyLevel;
  tags?: string[];
}

export interface GenerateFlashcardsDTO {
  topic: string;
  count: number;
  difficulty?: DifficultyLevel;
  language?: string;
  deck_id?: string;
}

export interface UpdateProgressDTO {
  card_id: string;
  deck_id: string;
  is_correct: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
