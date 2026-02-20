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
  has_image?: boolean;
  image_url?: string;
  image_id?: string;
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
  has_image?: boolean;
  image_url?: string;
  image_id?: string;
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

// Diagram Types
export interface DiagramLabel {
  label_id: string;
  card_id: string;
  label_text: string;
  x_position: number; // 0-100 percentage
  y_position: number; // 0-100 percentage
  order_index: number;
  created_at: string;
}

export interface CreateLabelDTO {
  card_id: string;
  label_text: string;
  x_position: number;
  y_position: number;
  order_index: number;
}

export interface UpdateLabelDTO {
  label_text?: string;
  x_position?: number;
  y_position?: number;
  order_index?: number;
}

export interface ImageUploadResult {
  fileId: string;
  fileUrl: string;
}

// AI Diagram Analysis Types
export interface LabelSuggestion {
  label_text: string;
  x_position: number; // 0-100 percentage
  y_position: number; // 0-100 percentage
  confidence: number; // 0-1
  description?: string;
}

export interface DiagramQualityReport {
  score: number; // 0-10
  issues: string[];
  suggestions: string[];
  is_acceptable: boolean;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export interface AIAnalysisLog {
  analysis_id: string;
  user_id: string;
  card_id: string;
  image_id: string;
  analysis_type: "label_detection" | "quality_check" | "quiz_generation";
  status: "pending" | "success" | "failed";
  result_data?: string; // JSON string
  confidence_score?: number;
  processing_time: number; // milliseconds
  error_message?: string;
  created_at: string;
}

// Quiz Types
export enum QuizQuestionType {
  IDENTIFICATION = "identification",
  FUNCTION = "function",
  LOCATION = "location",
  RELATIONSHIP = "relationship",
  FILL_BLANK = "fill_blank",
  MULTIPLE_CHOICE = "multiple_choice",
}

export interface QuizQuestion {
  question_id: string;
  type: QuizQuestionType;
  question: string;
  correct_answer: string;
  options?: string[];
  explanation: string;
  related_label?: string;
  difficulty: DifficultyLevel;
}

export interface QuizSession {
  session_id: string;
  card_id: string;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  score: number;
  started_at: string;
  completed_at?: string;
}

export interface QuizAnswer {
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  time_taken: number; // seconds
}

export interface GenerateQuizDTO {
  cardId: string;
  labels: DiagramLabel[];
  questionCount: number;
  questionTypes: QuizQuestionType[];
  difficulty: DifficultyLevel;
}

// Mistake Pattern Types
export interface MistakePattern {
  pattern_id: string;
  user_id: string;
  subject: string;
  topic: string;
  concept_id: string;
  mistake_count: number;
  last_occurrence: string;
  related_questions: string[]; // Array of question IDs
}

export interface QuizAttempt {
  attempt_id: string;
  user_id: string;
  card_id: string;
  deck_id: string;
  quiz_mode: string;
  score: number;
  total_questions: number;
  wrong_answers: WrongAnswer[];
  completed_at: string;
}

export interface WrongAnswer {
  question_id: string;
  label_id: string;
  user_answer: string;
  correct_answer: string;
  concept_id: string;
}

export interface CreateQuizAttemptDTO {
  card_id: string;
  deck_id: string;
  quiz_mode: string;
  score: number;
  total_questions: number;
  wrong_answers: WrongAnswer[];
}

// Remediation Types
export interface RemediationContent {
  concept_id: string;
  explanation: string;
  practice_questions: PracticeQuestion[];
  misconception: string;
  generated_at: string;
}

export interface PracticeQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface GenerateRemediationDTO {
  concept_id: string;
  subject: string;
  topic: string;
  mistake_count: number;
}

// Flashcard Quiz Types
export interface FlashcardQuizQuestion {
  question_id: string;
  card_id: string;
  type: "mcq" | "true_false" | "fill_blank";
  question: string;
  options?: string[]; // For MCQ
  correct_answer: string;
  user_answer?: string;
  is_correct?: boolean;
}

export interface GenerateQuizQuestionsDTO {
  cards: Array<{
    card_id: string;
    front_content: string;
    back_content: string;
  }>;
  quiz_type: "mcq" | "true_false" | "fill_blank";
  question_count: number;
}

// Spaced Repetition Types
export enum ReviewStatus {
  NEW = "new",
  LEARNING = "learning",
  REVIEW = "review",
  MASTERED = "mastered",
}

export enum QualityRating {
  BLACKOUT = 0,
  INCORRECT = 1,
  INCORRECT_EASY = 2,
  CORRECT_DIFFICULT = 3,
  CORRECT_HESITATION = 4,
  PERFECT = 5,
}

export interface CardReview {
  review_id: string;
  card_id: string;
  user_id: string;
  ease_factor: number; // Default: 2.5
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  next_review_date: string; // ISO datetime
  last_review_date?: string; // ISO datetime
  created_at: string;
  updated_at: string;
}

export interface ReviewSessionStats {
  total_due: number;
  reviewed_today: number;
  new_cards: number;
  learning_cards: number;
  review_cards: number;
  mastered_cards: number;
  streak_days: number;
  forecast: {
    tomorrow: number;
    next_week: number;
  };
}

export interface RecordReviewDTO {
  card_id: string;
  quality: QualityRating;
  time_spent: number; // seconds
}

export interface ReviewCalculationResult {
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: string;
  review_status: ReviewStatus;
}
