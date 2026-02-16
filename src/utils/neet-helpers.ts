/**
 * NEET-Specific Helper Functions
 */

import {
  NEET_AI_PROMPTS,
  NEET_SUBJECTS,
  NEET_TOPICS,
} from "../config/neet.config";

export function getSubjectFromCategory(category: string): string {
  const categoryLower = category.toLowerCase();

  if (categoryLower.includes("physics")) return NEET_SUBJECTS.PHYSICS;
  if (categoryLower.includes("chemistry")) return NEET_SUBJECTS.CHEMISTRY;
  if (
    categoryLower.includes("biology") ||
    categoryLower.includes("botany") ||
    categoryLower.includes("zoology")
  ) {
    return NEET_SUBJECTS.BIOLOGY;
  }

  return "General";
}

export function getTopicsForSubject(subject: string): string[] {
  switch (subject) {
    case NEET_SUBJECTS.PHYSICS:
      return NEET_TOPICS.PHYSICS;
    case NEET_SUBJECTS.CHEMISTRY:
      return NEET_TOPICS.CHEMISTRY;
    case NEET_SUBJECTS.BIOLOGY:
      return NEET_TOPICS.BIOLOGY;
    default:
      return [];
  }
}

export function getAIPromptForSubject(
  subject: string,
  topic: string,
  count: number,
): string {
  switch (subject) {
    case NEET_SUBJECTS.PHYSICS:
      return NEET_AI_PROMPTS.PHYSICS(topic, count);
    case NEET_SUBJECTS.CHEMISTRY:
      return NEET_AI_PROMPTS.CHEMISTRY(topic, count);
    case NEET_SUBJECTS.BIOLOGY:
      return NEET_AI_PROMPTS.BIOLOGY(topic, count);
    default:
      return NEET_AI_PROMPTS.GENERAL(topic, count);
  }
}

export function calculateStudyProgress(
  mastered: number,
  learning: number,
  total: number,
) {
  if (total === 0) return 0;

  // Weighted progress: mastered cards count more
  const weightedProgress = (mastered * 1.0 + learning * 0.5) / total;
  return Math.round(weightedProgress * 100);
}

export function getSubjectColor(subject: string): string {
  switch (subject) {
    case NEET_SUBJECTS.PHYSICS:
      return "#FF6B6B"; // Red
    case NEET_SUBJECTS.CHEMISTRY:
      return "#4ECDC4"; // Teal
    case NEET_SUBJECTS.BIOLOGY:
      return "#95E1D3"; // Green
    default:
      return "#007AFF"; // Blue
  }
}

export function getSubjectIcon(subject: string): string {
  switch (subject) {
    case NEET_SUBJECTS.PHYSICS:
      return "⚛️";
    case NEET_SUBJECTS.CHEMISTRY:
      return "🧪";
    case NEET_SUBJECTS.BIOLOGY:
      return "🧬";
    default:
      return "📚";
  }
}

export function formatStudyTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getDaysUntilNEET(examDate: Date): number {
  const today = new Date();
  const diffTime = examDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getRecommendedDailyCards(
  daysUntilExam: number,
  totalCards: number,
): number {
  if (daysUntilExam <= 0) return totalCards;
  return Math.ceil(totalCards / daysUntilExam);
}
