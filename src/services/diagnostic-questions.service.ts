/**
 * Diagnostic Questions Service
 * Manages cached AI-generated diagnostic questions
 */

import { ID, Query } from 'react-native-appwrite';
import { COLLECTIONS, DATABASE_ID } from '../config/appwrite.config';
import { databases } from './appwrite';
import { StudyPathAIService } from './study-path-ai.service';

export type DiagnosticQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  topicId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
};

export class DiagnosticQuestionsService {
  // Get cached questions or generate new ones
  static async getQuestions(): Promise<DiagnosticQuestion[]> {
    try {
      // Check if we have cached questions from today
      const cached = await this.getCachedQuestions();
      
      if (cached && cached.length > 0) {
        console.log('Using cached diagnostic questions');
        return cached;
      }
      
      // Generate new questions
      console.log('Generating new diagnostic questions');
      const questions = await StudyPathAIService.generateDiagnosticQuestions();
      
      if (questions.length > 0) {
        // Cache the questions
        await this.cacheQuestions(questions);
      }
      
      return questions;
    } catch (error) {
      console.error('Error getting diagnostic questions:', error);
      throw error;
    }
  }

  // Get cached questions if they exist and are less than 24 hours old
  private static async getCachedQuestions(): Promise<DiagnosticQuestion[] | null> {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DIAGNOSTIC_QUESTIONS,
        [
          Query.greaterThan('created_at', oneDayAgo.toISOString()),
          Query.orderDesc('created_at'),
          Query.limit(1)
        ]
      );
      
      if (response.documents.length === 0) {
        return null;
      }
      
      const doc = response.documents[0];
      return JSON.parse(doc.questions as string);
    } catch (error) {
      console.error('Error fetching cached questions:', error);
      return null;
    }
  }

  // Cache questions in database
  private static async cacheQuestions(questions: DiagnosticQuestion[]): Promise<void> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DIAGNOSTIC_QUESTIONS,
        ID.unique(),
        {
          questions: JSON.stringify(questions),
          created_at: new Date().toISOString(),
          question_count: questions.length
        }
      );
      
      console.log('Diagnostic questions cached successfully');
    } catch (error) {
      console.error('Error caching questions:', error);
      // Don't throw - caching failure shouldn't break the flow
    }
  }

  // Clean up old cached questions (optional - can be called periodically)
  static async cleanupOldQuestions(): Promise<void> {
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DIAGNOSTIC_QUESTIONS,
        [
          Query.lessThan('created_at', twoDaysAgo.toISOString())
        ]
      );
      
      for (const doc of response.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTIONS.DIAGNOSTIC_QUESTIONS,
          doc.$id
        );
      }
      
      console.log(`Cleaned up ${response.documents.length} old question sets`);
    } catch (error) {
      console.error('Error cleaning up old questions:', error);
    }
  }
}
