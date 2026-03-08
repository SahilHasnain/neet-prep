/**
 * Study Path Service
 * Main orchestrator for study path operations
 * Delegates to specialized services for specific functionality
 */

import type { DiagnosticResult, StudyPath, TopicProgress } from '../types/study-path.types';
import { DiagnosticService } from './diagnostic.service';
import { StudyPathCoreService } from './study-path-core.service';
import { TopicProgressService } from './topic-progress.service';

export class StudyPathService {
  // ============================================
  // Diagnostic Operations
  // ============================================

  static async saveDiagnosticResult(result: Omit<DiagnosticResult, 'result_id'>): Promise<DiagnosticResult> {
    return DiagnosticService.saveDiagnosticResult(result);
  }

  static async getDiagnosticResult(resultId: string): Promise<DiagnosticResult | null> {
    return DiagnosticService.getDiagnosticResult(resultId);
  }

  static async getLatestDiagnosticResult(userId: string): Promise<DiagnosticResult | null> {
    return DiagnosticService.getLatestDiagnosticResult(userId);
  }

  // ============================================
  // Study Path Operations
  // ============================================

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
    return StudyPathCoreService.generateStudyPath(
      userId,
      diagnosticId,
      weakTopics,
      strongTopics,
      totalScore,
      physicsScore,
      chemistryScore,
      biologyScore
    );
  }

  static async getUserStudyPath(userId: string): Promise<StudyPath | null> {
    return StudyPathCoreService.getUserStudyPath(userId);
  }

  static async getAllUserStudyPaths(userId: string): Promise<StudyPath[]> {
    return StudyPathCoreService.getAllUserStudyPaths(userId);
  }

  static async revertToPreviousPath(userId: string): Promise<StudyPath | null> {
    return StudyPathCoreService.revertToPreviousPath(userId);
  }

  // ============================================
  // Topic Progress Operations
  // ============================================

  static async getTopicProgress(pathId: string): Promise<TopicProgress[]> {
    return TopicProgressService.getTopicProgress(pathId);
  }

  static async updateTopicProgress(
    progressId: string,
    updates: Partial<TopicProgress>
  ): Promise<TopicProgress> {
    return TopicProgressService.updateTopicProgress(progressId, updates);
  }

  static async completeTopic(
    userId: string,
    pathId: string,
    topicId: string
  ): Promise<void> {
    return TopicProgressService.completeTopic(userId, pathId, topicId);
  }
}
