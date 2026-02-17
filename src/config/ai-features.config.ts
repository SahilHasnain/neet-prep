/**
 * AI Features Configuration
 * Feature flags and settings for AI-powered diagram analysis
 */

export const AI_FEATURES = {
  DIAGRAM_ANALYSIS: {
    enabled:
      process.env.EXPO_PUBLIC_AI_DIAGRAM_ENABLED === "true" ||
      process.env.EXPO_PUBLIC_AI_DIAGRAM_ENABLED === undefined, // Default to true
    minConfidence: parseFloat(
      process.env.EXPO_PUBLIC_AI_MIN_CONFIDENCE || "0.7",
    ),
    maxLabels: parseInt(process.env.EXPO_PUBLIC_AI_MAX_LABELS || "15"),
    timeout: parseInt(process.env.EXPO_PUBLIC_AI_TIMEOUT || "30000"),
  },
  QUIZ_GENERATION: {
    enabled:
      process.env.EXPO_PUBLIC_AI_QUIZ_ENABLED === "true" ||
      process.env.EXPO_PUBLIC_AI_QUIZ_ENABLED === undefined, // Default to true
    defaultQuestionCount: 5,
    maxQuestionCount: 20,
  },
  QUALITY_CHECK: {
    enabled:
      process.env.EXPO_PUBLIC_QUALITY_CHECK_ENABLED === "true" ||
      process.env.EXPO_PUBLIC_QUALITY_CHECK_ENABLED === undefined, // Default to true
    minScore: 6,
    blockLowQuality: false, // Allow proceeding with low quality
  },
} as const;

// Diagram type options
export const DIAGRAM_TYPES = [
  { value: "general", label: "General" },
  { value: "anatomy", label: "Anatomy" },
  { value: "cell", label: "Cell Biology" },
  { value: "circuit", label: "Circuit" },
  { value: "chemistry", label: "Chemistry" },
  { value: "physics", label: "Physics" },
] as const;

export type DiagramType = (typeof DIAGRAM_TYPES)[number]["value"];
