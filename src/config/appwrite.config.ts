/**
 * Appwrite Configuration
 * Centralized configuration for Appwrite services
 */

export const APPWRITE_CONFIG = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  apiKey: process.env.APPWRITE_API_KEY!,
} as const;

// AI Configuration
export const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY!;

// Database and Collection IDs
export const DATABASE_ID = "flashcard_db";

export const COLLECTIONS = {
  DIAGNOSTIC_RESULTS: "diagnostic_results",
  STUDY_PATHS: "study_paths",
  TOPIC_PROGRESS: "topic_progress",
  DAILY_TASKS: "daily_tasks",
  DIAGNOSTIC_QUESTIONS: "diagnostic_questions",
  AI_NOTES: "ai_notes",
  VIDEO_LESSONS: "video_lessons",
} as const;

// Function IDs (if needed in future)
export const FUNCTIONS = {} as const;


