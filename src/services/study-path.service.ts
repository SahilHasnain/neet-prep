/**
 * Study Path Service
 * Handles study path generation and management
 */

import { ID, Query } from 'react-native-appwrite';
import { COLLECTIONS, DATABASE_ID } from '../config/appwrite.config';
import { getDependents, getPrerequisites } from '../config/knowledge-graph.config';
import type { DiagnosticResult, StudyPath, TopicProgress } from '../types/study-path.types';
import { databases } from './appwrite';

export class StudyPathService {
  // Save diagnostic results
  static async saveDiagnosticResult(result: Omit<DiagnosticResult, 'result_id'>): Promise<DiagnosticResult> {
    try {
      // Check if a diagnostic result already exists for this user with same scores
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DIAGNOSTIC_RESULTS,
        [
          Query.equal('user_id', result.user_id),
          Query.equal('total_score', result.total_score),
          Query.orderDesc('completed_at'),
          Query.limit(1)
        ]
      );

      // If found within last 5 minutes, return existing (avoid duplicates)
      if (existing.documents.length > 0) {
        const existingDoc = existing.documents[0];
        const existingTime = new Date(existingDoc.completed_at as string).getTime();
        const currentTime = new Date().getTime();
        
        if (currentTime - existingTime < 5 * 60 * 1000) { // 5 minutes
          return {
            ...existingDoc,
            weak_topics: JSON.parse(existingDoc.weak_topics as string),
            strong_topics: JSON.parse(existingDoc.strong_topics as string),
            detailed_results: JSON.parse(existingDoc.detailed_results as string)
          } as unknown as DiagnosticResult;
        }
      }
    } catch (error) {
      console.log('No existing diagnostic found, creating new one');
    }

    // Create new diagnostic result
    const docId = ID.unique();
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.DIAGNOSTIC_RESULTS,
      docId,
      {
        result_id: docId,
        ...result,
        weak_topics: JSON.stringify(result.weak_topics),
        strong_topics: JSON.stringify(result.strong_topics),
        detailed_results: JSON.stringify(result.detailed_results)
      }
    );

    return {
      ...doc,
      weak_topics: JSON.parse(doc.weak_topics as string),
      strong_topics: JSON.parse(doc.strong_topics as string),
      detailed_results: JSON.parse(doc.detailed_results as string)
    } as unknown as DiagnosticResult;
  }

  // Generate study path from diagnostic results using AI
  static async generateStudyPath(
    userId: string,
    diagnosticId: string,
    weakTopics: string[],
    strongTopics: string[],
    totalScore: number,
    physicsScore: number,
    chemistryScore: number,
    biologyScore: number
  ): Promise<StudyPath> {
    // Archive any existing active study path
    await this.archiveActiveStudyPath(userId);

    // Get all available topics from knowledge graph
    const { KNOWLEDGE_GRAPH } = await import('../config/knowledge-graph.config');
    const availableTopics = KNOWLEDGE_GRAPH.map(topic => ({
      id: topic.id,
      name: topic.name,
      subject: topic.subject,
      prerequisites: topic.prerequisites,
      difficulty: topic.difficulty,
      estimatedHours: topic.estimatedHours,
      neetWeightage: topic.neetWeightage
    }));

    // Use AI to generate personalized study path
    const { StudyPathAIService } = await import('./study-path-ai.service');
    const aiPath = await StudyPathAIService.generatePersonalizedStudyPath(
      weakTopics,
      strongTopics,
      totalScore,
      physicsScore,
      chemistryScore,
      biologyScore,
      availableTopics
    );

    const topicSequence = aiPath.topicSequence;
    
    const now = new Date().toISOString();

    // Create study path with unique ID
    let doc;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const docId = ID.unique();
        doc = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.STUDY_PATHS,
          docId,
          {
            path_id: docId,
            user_id: userId,
            diagnostic_id: diagnosticId,
            topic_sequence: JSON.stringify(topicSequence),
            progress_percentage: 0,
            topics_completed: 0,
            total_topics: topicSequence.length,
            status: 'active',
            created_at: now,
            updated_at: now,
            ai_reasoning: aiPath.reasoning,
            estimated_weeks: aiPath.estimatedCompletionWeeks
          }
        );
        break; // Success, exit loop
      } catch (error: any) {
        attempts++;
        if (error.code === 409 && attempts < maxAttempts) {
          console.log(`Document ID collision, retrying... (${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
          continue;
        }
        throw error; // Re-throw if not a collision or max attempts reached
      }
    }

    if (!doc) {
      throw new Error('Failed to create study path after multiple attempts');
    }

    // Initialize topic progress for all topics with AI priority levels
    await this.initializeTopicProgress(userId, doc.path_id as string, topicSequence, aiPath.priorityLevel);

    return {
      ...doc,
      topic_sequence: JSON.parse(doc.topic_sequence as string)
    } as unknown as StudyPath;
  }

  // Archive active study path (mark as replaced)
  private static async archiveActiveStudyPath(userId: string): Promise<void> {
    try {
      const existingPath = await this.getUserStudyPath(userId);
      if (existingPath) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.STUDY_PATHS,
          existingPath.path_id,
          {
            status: 'archived',
            updated_at: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error('Error archiving study path:', error);
      // Continue even if archiving fails
    }
  }

  // Revert to previous study path
  static async revertToPreviousPath(userId: string): Promise<StudyPath | null> {
    try {
      // Get current active path
      const currentPath = await this.getUserStudyPath(userId);
      
      // Get most recent archived path
      const archivedPaths = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.STUDY_PATHS,
        [
          Query.equal('user_id', userId),
          Query.equal('status', 'archived'),
          Query.orderDesc('created_at'),
          Query.limit(1)
        ]
      );

      if (archivedPaths.documents.length === 0) {
        return null; // No previous path to revert to
      }

      const previousPath = archivedPaths.documents[0];

      // Archive current path
      if (currentPath) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.STUDY_PATHS,
          currentPath.path_id,
          {
            status: 'replaced',
            updated_at: new Date().toISOString()
          }
        );
      }

      // Reactivate previous path
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.STUDY_PATHS,
        previousPath.$id,
        {
          status: 'active',
          updated_at: new Date().toISOString()
        }
      );

      return {
        ...previousPath,
        topic_sequence: JSON.parse(previousPath.topic_sequence as string)
      } as unknown as StudyPath;
    } catch (error) {
      console.error('Error reverting to previous path:', error);
      return null;
    }
  }

  // Get all study paths for user (including archived)
  static async getAllUserStudyPaths(userId: string): Promise<StudyPath[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STUDY_PATHS,
      [
        Query.equal('user_id', userId),
        Query.orderDesc('created_at'),
        Query.limit(10)
      ]
    );

    return response.documents.map(doc => ({
      ...doc,
      topic_sequence: JSON.parse(doc.topic_sequence as string)
    })) as unknown as StudyPath[];
  }

  // Build optimal topic sequence respecting prerequisites
  private static buildTopicSequence(weakTopics: string[]): string[] {
    const sequence: string[] = [];
    const visited = new Set<string>();
    const processing = new Set<string>();

    const addTopicWithPrereqs = (topicId: string) => {
      if (visited.has(topicId)) return;
      if (processing.has(topicId)) {
        // Circular dependency - skip
        return;
      }

      processing.add(topicId);
      const prereqs = getPrerequisites(topicId);
      
      // Add prerequisites first
      for (const prereq of prereqs) {
        addTopicWithPrereqs(prereq.id);
      }

      if (!visited.has(topicId)) {
        sequence.push(topicId);
        visited.add(topicId);
      }
      processing.delete(topicId);
    };

    // Add weak topics and their prerequisites
    for (const topicId of weakTopics) {
      addTopicWithPrereqs(topicId);
    }

    return sequence;
  }

  // Initialize topic progress for all topics in path
  private static async initializeTopicProgress(
    userId: string,
    pathId: string,
    topicSequence: string[],
    priorityLevels?: { [topicId: string]: 'high' | 'medium' | 'low' }
  ): Promise<void> {
    // Check for existing progress for this path
    try {
      const existingProgress = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TOPIC_PROGRESS,
        [
          Query.equal('path_id', pathId),
          Query.limit(100)
        ]
      );

      // If progress already exists for this path, skip initialization
      if (existingProgress.documents.length > 0) {
        console.log('Topic progress already exists for this path, skipping initialization');
        return;
      }
    } catch (error) {
      console.log('No existing progress found, creating new');
    }

    // Create progress for each topic
    for (let i = 0; i < topicSequence.length; i++) {
      const topicId = topicSequence[i];
      
      // First topic is unlocked, rest are locked
      const status = i === 0 ? 'unlocked' : 'locked';
      const priority = priorityLevels?.[topicId] || 'medium';

      try {
        const docId = ID.unique();
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.TOPIC_PROGRESS,
          docId,
          {
            progress_id: docId,
            user_id: userId,
            path_id: pathId,
            topic_id: topicId,
            status,
            mastery_level: 0,
            time_spent_minutes: 0,
            quiz_attempts: 0,
            quiz_average_score: 0,
            priority
          }
        );
      } catch (error: any) {
        // If document already exists, skip it
        if (error.code === 409) {
          console.log(`Topic progress for ${topicId} already exists, skipping`);
          continue;
        }
        throw error;
      }
    }
  }

  // Get study path for user
  static async getUserStudyPath(userId: string): Promise<StudyPath | null> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STUDY_PATHS,
      [
        Query.equal('user_id', userId),
        Query.equal('status', 'active'),
        Query.orderDesc('created_at'),
        Query.limit(1)
      ]
    );

    if (response.documents.length === 0) return null;

    const doc = response.documents[0];
    return {
      ...doc,
      topic_sequence: JSON.parse(doc.topic_sequence as string)
    } as unknown as StudyPath;
  }

  // Get topic progress for path
  static async getTopicProgress(pathId: string): Promise<TopicProgress[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TOPIC_PROGRESS,
      [Query.equal('path_id', pathId), Query.limit(100)]
    );

    return response.documents as unknown as TopicProgress[];
  }

  // Update topic progress
  static async updateTopicProgress(
    progressId: string,
    updates: Partial<TopicProgress>
  ): Promise<TopicProgress> {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TOPIC_PROGRESS,
      progressId,
      updates
    );

    return doc as unknown as TopicProgress;
  }

  // Complete a topic and unlock dependents
  static async completeTopic(
    userId: string,
    pathId: string,
    topicId: string
  ): Promise<void> {
    // Mark topic as completed
    const progressList = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TOPIC_PROGRESS,
      [
        Query.equal('user_id', userId),
        Query.equal('path_id', pathId),
        Query.equal('topic_id', topicId)
      ]
    );

    if (progressList.documents.length > 0) {
      const progress = progressList.documents[0];
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TOPIC_PROGRESS,
        progress.$id,
        {
          status: 'completed',
          completed_at: new Date().toISOString()
        }
      );
    }

    // Unlock dependent topics
    const dependents = getDependents(topicId);
    const allProgress = await this.getTopicProgress(pathId);

    for (const dependent of dependents) {
      const prereqs = getPrerequisites(dependent.id);
      const allPrereqsCompleted = prereqs.every(prereq => {
        const prereqProgress = allProgress.find(p => p.topic_id === prereq.id);
        return prereqProgress?.status === 'completed';
      });

      if (allPrereqsCompleted) {
        const depProgress = allProgress.find(p => p.topic_id === dependent.id);
        if (depProgress && depProgress.status === 'locked') {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.TOPIC_PROGRESS,
            depProgress.progress_id,
            { status: 'unlocked' }
          );
        }
      }
    }

    // Update study path progress
    await this.updateStudyPathProgress(pathId);
  }

  // Update study path overall progress
  private static async updateStudyPathProgress(pathId: string): Promise<void> {
    const progress = await this.getTopicProgress(pathId);
    const completed = progress.filter(p => p.status === 'completed').length;
    const total = progress.length;
    const percentage = Math.round((completed / total) * 100);

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.STUDY_PATHS,
      pathId,
      {
        topics_completed: completed,
        progress_percentage: percentage,
        updated_at: new Date().toISOString()
      }
    );
  }

  // Get diagnostic result
  static async getDiagnosticResult(resultId: string): Promise<DiagnosticResult | null> {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.DIAGNOSTIC_RESULTS,
        resultId
      );

      return {
        ...doc,
        weak_topics: JSON.parse(doc.weak_topics as string),
        strong_topics: JSON.parse(doc.strong_topics as string),
        detailed_results: JSON.parse(doc.detailed_results as string)
      } as unknown as DiagnosticResult;
    } catch {
      return null;
    }
  }

  // Get user's latest diagnostic result
  static async getLatestDiagnosticResult(userId: string): Promise<DiagnosticResult | null> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DIAGNOSTIC_RESULTS,
      [
        Query.equal('user_id', userId),
        Query.orderDesc('completed_at'),
        Query.limit(1)
      ]
    );

    if (response.documents.length === 0) return null;

    const doc = response.documents[0];
    return {
      ...doc,
      weak_topics: JSON.parse(doc.weak_topics as string),
      strong_topics: JSON.parse(doc.strong_topics as string),
      detailed_results: JSON.parse(doc.detailed_results as string)
    } as unknown as DiagnosticResult;
  }
}
