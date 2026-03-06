/**
 * Type definitions for Study Path feature
 */

import { TopicNode } from '../config/knowledge-graph.config';

export interface DiagnosticResult {
  result_id: string;
  user_id: string;
  total_score: number;
  physics_score: number;
  chemistry_score: number;
  biology_score: number;
  weak_topics: string[]; // Topic IDs
  strong_topics: string[]; // Topic IDs
  detailed_results: {
    questionId: string;
    isCorrect: boolean;
    selectedAnswer: number;
    timeTaken: number;
  }[];
  completed_at: string;
}

export interface StudyPath {
  path_id: string;
  user_id: string;
  diagnostic_id: string;
  topic_sequence: string[]; // Ordered array of topic IDs
  current_topic_id?: string;
  progress_percentage: number;
  topics_completed: number;
  total_topics: number;
  status: 'active' | 'completed' | 'paused' | 'archived' | 'replaced';
  created_at: string;
  updated_at: string;
  ai_reasoning?: string; // AI explanation for the path strategy
  estimated_weeks?: number; // AI-estimated completion time
}

export interface TopicProgress {
  progress_id: string;
  user_id: string;
  path_id: string;
  topic_id: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  mastery_level: number; // 0-100
  time_spent_minutes: number;
  quiz_attempts: number;
  quiz_average_score: number;
  started_at?: string;
  completed_at?: string;
  last_accessed?: string;
  priority?: 'high' | 'medium' | 'low'; // AI-assigned priority level
}

export interface DailyTask {
  task_id: string;
  user_id: string;
  path_id: string;
  topic_id: string;
  task_type: 'study' | 'practice' | 'review' | 'quiz';
  title: string;
  description?: string;
  estimated_minutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  scheduled_date: string;
  completed_at?: string;
  created_at: string;
}

export interface TopicWithProgress extends TopicNode {
  progress?: TopicProgress;
  isLocked: boolean;
  dependencyCount: number;
  dependentCount: number;
}

export interface StudyPathAnalytics {
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  lockedTopics: number;
  averageMastery: number;
  totalTimeSpent: number;
  streakDays: number;
  subjectBreakdown: {
    Physics: { completed: number; total: number };
    Chemistry: { completed: number; total: number };
    Biology: { completed: number; total: number };
  };
}

export interface PathGenerationRequest {
  diagnosticId: string;
  userId: string;
  focusAreas?: ('Physics' | 'Chemistry' | 'Biology')[];
  targetDate?: string; // NEET exam date
  dailyStudyHours?: number;
}

export interface PathGenerationResponse {
  path: StudyPath;
  topicSequence: TopicWithProgress[];
  estimatedCompletionDate: string;
  dailySchedule: {
    date: string;
    topics: string[];
    estimatedHours: number;
  }[];
}
