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
        // Check if progress already exists for this user/path/topic combination
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TOPIC_PROGRESS,
          [
            Query.equal('user_id', userId),
            Query.equal('path_id', pathId),
            Query.equal('topic_id', topicId),
            Query.limit(1)
          ]
        );

        if (existing.documents.length > 0) {
          console.log(`Progress already exists for topic ${topicId}, skipping creation`);
          continue;
        }

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
        // If document already exists, log but continue
        if (error.code === 409 || error.message?.includes('already exists')) {
          console.log(`Progress for ${topicId} already exists (conflict), continuing...`);
        } else {
          console.error(`Error creating progress for ${topicId}:`, error);
        }
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

    console.log(`Fetched ${response.documents.length} progress documents for path ${pathId}`);
    
    const deserialized = response.documents.map(doc => {
      const progress = this.deserializeTopicProgress(doc);
      console.log(`  - Topic ${progress.topic_id}: status=${progress.status}, progress_id=${progress.progress_id}`);
      return progress;
    });
    
    return deserialized;
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

    console.log(`Looking for progress record for topic ${topicId}. Found ${progressList.documents.length} documents.`);

    if (progressList.documents.length > 0) {
      const progress = progressList.documents[0];
      console.log(`Found progress document for ${topicId}:`, {
        docId: progress.$id,
        progressId: progress.progress_id,
        currentStatus: progress.status
      });
      
      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TOPIC_PROGRESS,
        progress.$id,
        {
          status: 'completed',
          completed_at: new Date().toISOString()
        }
      );
      
      console.log(`Updated topic ${topicId} to completed. New status:`, updated.status);
      
      // Small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      console.error(`ERROR: No progress record found for topic ${topicId}! Cannot mark as completed.`);
      throw new Error(`No progress record found for topic ${topicId}. The topic may not be in your study path.`);
    }

    // Unlock dependent topics - pass the completed topic ID
    await this.unlockDependentTopics(userId, pathId, topicId);

    // Update study path overall progress
    await this.updateStudyPathProgress(pathId);
  }

  /**
   * Unlock topics that depend on the completed topic
   */
  private static async unlockDependentTopics(userId: string, pathId: string, completedTopicId: string): Promise<void> {
    console.log(`Starting unlock process for dependents of ${completedTopicId}`);
    
    // Get the study path to know which topics are in the sequence
    const studyPath = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.STUDY_PATHS,
      pathId
    );
    const topicSequence = JSON.parse(studyPath.topic_sequence as string) as string[];
    const topicsInPath = new Set(topicSequence);
    
    console.log(`Study path contains ${topicSequence.length} topics:`, topicSequence);
    console.log(`Is ${completedTopicId} in the path?`, topicsInPath.has(completedTopicId));
    
    // Get all progress for this path - fetch fresh data after completion
    const allProgress = await this.getTopicProgress(pathId);
    
    // Verify the completed topic is actually marked as completed
    const completedProgress = allProgress.find(p => p.topic_id === completedTopicId);
    console.log(`Completed topic ${completedTopicId} status:`, completedProgress?.status);
    
    if (!completedProgress) {
      console.error(`ERROR: No progress record found for completed topic ${completedTopicId}!`);
      return;
    }

    // Get dependent topics
    const dependents = getDependents(completedTopicId);
    console.log(`Found ${dependents.length} dependents for ${completedTopicId}:`, dependents.map(d => d.id));

    for (const dependent of dependents) {
      // Skip if this dependent topic is not in the current study path
      if (!topicsInPath.has(dependent.id)) {
        console.log(`Skipping ${dependent.id} - not in current path`);
        continue;
      }

      const prereqs = getPrerequisites(dependent.id);
      console.log(`Checking prerequisites for ${dependent.id}:`, prereqs.map(p => p.id));
      
      // Check if all prerequisites are completed (only those in the path)
      const prereqsInPath = prereqs.filter(p => topicsInPath.has(p.id));
      console.log(`Prerequisites in path for ${dependent.id}:`, prereqsInPath.map(p => p.id));
      
      const allPrereqsCompleted = prereqsInPath.every(prereq => {
        const prereqProgress = allProgress.find(p => p.topic_id === prereq.id);
        const isCompleted = prereqProgress?.status === 'completed';
        console.log(`  - ${prereq.id}: ${prereqProgress?.status} (completed: ${isCompleted})`);
        return isCompleted;
      });

      console.log(`All prerequisites completed for ${dependent.id}: ${allPrereqsCompleted}`);

      if (allPrereqsCompleted) {
        const depProgress = allProgress.find(p => p.topic_id === dependent.id);
        console.log(`Dependent ${dependent.id} current status: ${depProgress?.status}`);
        
        if (depProgress && depProgress.status === 'locked') {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.TOPIC_PROGRESS,
            depProgress.progress_id,
            { status: 'unlocked' }
          );
          console.log(`✓ Unlocked topic ${dependent.id} after completing ${completedTopicId}`);
        } else if (depProgress) {
          console.log(`Skipping ${dependent.id} - already ${depProgress.status}`);
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
    // Map Appwrite document to TopicProgress interface
    const progress: TopicProgress = {
      progress_id: doc.progress_id || doc.$id,
      user_id: doc.user_id,
      path_id: doc.path_id,
      topic_id: doc.topic_id,
      status: doc.status,
      mastery_level: doc.mastery_level,
      time_spent_minutes: doc.time_spent_minutes,
      quiz_attempts: doc.quiz_attempts,
      quiz_average_score: doc.quiz_average_score,
      priority: doc.priority,
      completed_at: doc.completed_at,
      conceptual_gaps: doc.conceptual_gaps && typeof doc.conceptual_gaps === 'string' 
        ? JSON.parse(doc.conceptual_gaps) 
        : doc.conceptual_gaps
    };
    
    return progress;
  }
}
