/**
 * Shared Appwrite Configuration
 */

export const APPWRITE_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  apiKey: process.env.APPWRITE_API_KEY!,
} as const;

export const DATABASE_ID = "flashcard_db";

export const COLLECTIONS = {
  VIDEO_LESSONS: "video_lessons",
  DIAGNOSTIC_RESULTS: "diagnostic_results",
  STUDY_PATHS: "study_paths",
  TOPIC_PROGRESS: "topic_progress",
  DAILY_TASKS: "daily_tasks",
  DIAGNOSTIC_QUESTIONS: "diagnostic_questions",
  AI_NOTES: "ai_notes",
} as const;
