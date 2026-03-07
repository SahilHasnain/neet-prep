/**
 * Study Path Core Service
 * Core CRUD operations for study paths
 */

import { ID, Query } from 'react-native-appwrite';
import { COLLECTIONS, DATABASE_ID } from '../config/appwrite.config';
import type { StudyPath } from '../types/study-path.types';
import { databases } from './appwrite';
import { DailyTasksService } from './daily-tasks.service';
import { TopicProgressService } from './topic-progress.service';

export class StudyPathCoreService {
  /**
   * Generate a new AI-powered study path
   */
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

    // Create study path with retry logic for ID collisions
    const doc = await this.createStudyPathDocument(
      userId,
      diagnosticId,
      topicSequence,
      now,
      aiPath.reasoning,
      aiPath.estimatedCompletionWeeks
    );

    // Initialize topic progress for all topics with AI priority levels
    await TopicProgressService.initializeTopicProgress(
      userId,
      doc.path_id as string,
      topicSequence,
      aiPath.priorityLevel
    );

    // Generate initial daily tasks
    try {
      await DailyTasksService.generateDailyTasks(userId, doc.path_id as string, 2);
    } catch (error) {
      console.error('Error generating initial daily tasks:', error);
    }

    return {
      ...doc,
      topic_sequence: JSON.parse(doc.topic_sequence as string)
    } as unknown as StudyPath;
  }

  /**
   * Create study path document with retry logic
   */
  private static async createStudyPathDocument(
    userId: string,
    diagnosticId: string,
    topicSequence: string[],
    now: string,
    aiReasoning: string,
    estimatedWeeks: number
  ): Promise<any> {
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
            ai_reasoning: aiReasoning,
            estimated_weeks: estimatedWeeks
          }
        );
        break;
      } catch (error: any) {
        attempts++;
        if (error.code === 409 && attempts < maxAttempts) {
          console.log(`Document ID collision, retrying... (${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }
        throw error;
      }
    }

    if (!doc) {
      throw new Error('Failed to create study path after multiple attempts');
    }

    return doc;
  }

  /**
   * Archive the current active study path
   */
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
        console.log(`Archived study path ${existingPath.path_id}`);
      }
    } catch (error) {
      console.error('Error archiving study path:', error);
    }
  }

  /**
   * Get user's active study path
   */
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

  /**
   * Get all study paths for user (including archived)
   */
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

  /**
   * Revert to the most recent archived study path
   */
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
        return null;
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
}
