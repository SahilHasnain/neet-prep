/**
 * Topic Progress Service
 * Manages individual topic progress and unlocking logic
 */

import { ID, Query } from 'react-native-appwrite';
import { COLLECTIONS, DATABASE_ID } from '../config/appwrite.config';
import { getDependents, getPrerequisites } from '../config/knowledge-graph.config';
import type { TopicProgress } from '../types/study-path.types';
import { databases } from './appwrite';

export class TopicProgressService {
  /**
   * Initialize topic progress for all topics in a study path
   * Unlocks first topic of each subject (Physics, Chemistry, Biology)
   */
  static async initializeTopicProgress(
    userId: string,
    pathId: string,
    topicSequence: string[],
    priorityLevels?: { [topicId: string]: 'high' | 'medium' | 'low' }
  ): Promise<void> {
    // Get knowledge graph to determine subjects
    const { KNOWLEDGE_GRAPH } = await import('../config/knowledge-graph.config');
    const topicMap = new Map(KNOWLEDGE_GRAPH.map(t => [t.id, t]));
    
    // Track first topic of each subject
    const firstTopicBySubject = new Map<string, string>();
    
    for (const topicId of topicSequence) {
      const topic = topicMap.get(topicId);
      if (topic && !firstTopicBySubject.has(topic.subject)) {
        firstTopicBySubject.set(topic.subject, topicId);
      }
    }
    
    console.log('First topics by subject:', Object.fromEntries(firstTopicBySubject));

    // Create progress for each topic
    for (const topicId of topicSequence) {
      // Unlock first topic of each subject
      const isFirstOfSubject = Array.from(firstTopicBySubject.values()).includes(topicId);
      const status = isFirstOfSubject ? 'unlocked' : 'locked';
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
        console.log(`Created progress for topic ${topicId} with status: ${status}`);
      } catch (error: any) {
        console.error(`Error creating progress for ${topicId}:`, error);
      }
    }
  }

  /**
   * Get all topic progress for a study path
   */
  static async getTopicProgress(pathId: string): Promise<TopicProgress[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TOPIC_PROGRESS,
      [Query.equal('path_id', pathId), Query.limit(100)]
    );

    return response.documents.map(doc => this.deserializeTopicProgress(doc));
  }

  /**
   * Update topic progress
   */
  static async updateTopicProgress(
    progressId: string,
    updates: Partial<TopicProgress>
  ): Promise<TopicProgress> {
    // Serialize conceptual_gaps if present
    const serializedUpdates = { ...updates };
    if (updates.conceptual_gaps) {
      serializedUpdates.conceptual_gaps = JSON.stringify(updates.conceptual_gaps) as any;
    }

    const doc = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.TOPIC_PROGRESS,
      progressId,
      serializedUpdates
    );

    return this.deserializeTopicProgress(doc);
  }

  /**
   * Complete a topic and unlock dependent topics
   */
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
    await this.unlockDependentTopics(pathId, topicId);

    // Update study path overall progress
    await this.updateStudyPathProgress(pathId);
  }

  /**
   * Unlock topics that depend on the completed topic
   */
  private static async unlockDependentTopics(pathId: string, completedTopicId: string): Promise<void> {
    // Get all progress for this path
    const allProgress = await this.getTopicProgress(pathId);
    
    // Get the study path to know which topics are in the sequence
    const studyPath = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.STUDY_PATHS,
      pathId
    );
    const topicSequence = JSON.parse(studyPath.topic_sequence as string) as string[];
    const topicsInPath = new Set(topicSequence);

    // Get dependent topics
    const dependents = getDependents(completedTopicId);

    for (const dependent of dependents) {
      // Skip if this dependent topic is not in the current study path
      if (!topicsInPath.has(dependent.id)) {
        continue;
      }

      const prereqs = getPrerequisites(dependent.id);
      
      // Check if all prerequisites are completed (only those in the path)
      const prereqsInPath = prereqs.filter(p => topicsInPath.has(p.id));
      const allPrereqsCompleted = prereqsInPath.every(prereq => {
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
          console.log(`Unlocked topic ${dependent.id} after completing ${completedTopicId}`);
        }
      }
    }
  }

  /**
   * Update study path overall progress percentage
   */
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

  /**
   * Helper to deserialize topic progress from database
   */
  private static deserializeTopicProgress(doc: any): TopicProgress {
    const progress = doc as unknown as TopicProgress;
    if (progress.conceptual_gaps && typeof progress.conceptual_gaps === 'string') {
      progress.conceptual_gaps = JSON.parse(progress.conceptual_gaps as any);
    }
    return progress;
  }
}
