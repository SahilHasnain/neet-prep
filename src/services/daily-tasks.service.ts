/**
 * Daily Tasks Service
 * Manages daily study tasks and scheduling
 */

import { ID, Query } from 'react-native-appwrite';
import { COLLECTIONS, DATABASE_ID } from '../config/appwrite.config';
import type { DailyTask } from '../types/study-path.types';
import { databases } from './appwrite';
import { TopicProgressService } from './topic-progress.service';

export class DailyTasksService {
  /**
   * Generate daily tasks for the next 7 days
   */
  static async generateDailyTasks(
    userId: string,
    pathId: string,
    dailyStudyHours: number = 2
  ): Promise<void> {
    const path = await databases.getDocument(DATABASE_ID, COLLECTIONS.STUDY_PATHS, pathId);
    const progress = await TopicProgressService.getTopicProgress(pathId);

    // Get unlocked topics
    const unlockedTopics = progress.filter(p => 
      p.status === 'unlocked' || p.status === 'in_progress'
    );

    if (unlockedTopics.length === 0) return;

    // Generate tasks for next 7 days
    const today = new Date();
    for (let day = 0; day < 7; day++) {
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + day);
      scheduledDate.setHours(0, 0, 0, 0);

      // Check if tasks already exist for this date
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DAILY_TASKS,
        [
          Query.equal('user_id', userId),
          Query.equal('path_id', pathId),
          Query.equal('scheduled_date', scheduledDate.toISOString())
        ]
      );

      if (existing.documents.length > 0) continue;

      // Create tasks for this day
      const topicForDay = unlockedTopics[day % unlockedTopics.length];
      const minutesPerDay = dailyStudyHours * 60;

      // Study task
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DAILY_TASKS,
        ID.unique(),
        {
          task_id: ID.unique(),
          user_id: userId,
          path_id: pathId,
          topic_id: topicForDay.topic_id,
          task_type: 'study',
          title: `Study: ${topicForDay.topic_id}`,
          description: 'Read theory and make notes',
          estimated_minutes: Math.floor(minutesPerDay * 0.6),
          status: 'pending',
          scheduled_date: scheduledDate.toISOString(),
          created_at: new Date().toISOString()
        }
      );

      // Practice task
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DAILY_TASKS,
        ID.unique(),
        {
          task_id: ID.unique(),
          user_id: userId,
          path_id: pathId,
          topic_id: topicForDay.topic_id,
          task_type: 'practice',
          title: `Practice: ${topicForDay.topic_id}`,
          description: 'Solve practice problems',
          estimated_minutes: Math.floor(minutesPerDay * 0.4),
          status: 'pending',
          scheduled_date: scheduledDate.toISOString(),
          created_at: new Date().toISOString()
        }
      );
    }
  }

  /**
   * Get daily tasks for a specific date
   */
  static async getDailyTasks(
    userId: string,
    date: Date = new Date()
  ): Promise<DailyTask[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_TASKS,
      [
        Query.equal('user_id', userId),
        Query.equal('scheduled_date', startOfDay.toISOString()),
        Query.limit(50)
      ]
    );

    return response.documents as unknown as DailyTask[];
  }

  /**
   * Mark a daily task as completed
   */
  static async completeTask(taskId: string): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.DAILY_TASKS,
      taskId,
      {
        status: 'completed',
        completed_at: new Date().toISOString()
      }
    );
  }

  /**
   * Get task completion statistics
   */
  static async getTaskStats(userId: string, pathId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionRate: number;
    streak: number;
  }> {
    const allTasks = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DAILY_TASKS,
      [
        Query.equal('user_id', userId),
        Query.equal('path_id', pathId),
        Query.limit(1000)
      ]
    );

    const tasks = allTasks.documents;
    const completed = tasks.filter((t: any) => t.status === 'completed').length;
    const pending = tasks.filter((t: any) => t.status === 'pending').length;
    const total = tasks.length;

    // Calculate streak
    const streak = this.calculateStreak(tasks);

    return {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      streak
    };
  }

  /**
   * Calculate consecutive days with completed tasks
   */
  private static calculateStreak(tasks: any[]): number {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const dayTasks = tasks.filter((t: any) => {
        const taskDate = new Date(t.scheduled_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === checkDate.getTime();
      });

      const dayCompleted = dayTasks.filter((t: any) => t.status === 'completed').length;
      
      if (dayCompleted > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }
}
