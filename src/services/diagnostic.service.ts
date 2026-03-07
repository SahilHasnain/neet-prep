/**
 * Diagnostic Service
 * Handles diagnostic test results and scoring
 */

import { ID, Query } from 'react-native-appwrite';
import { COLLECTIONS, DATABASE_ID } from '../config/appwrite.config';
import type { DiagnosticResult } from '../types/study-path.types';
import { databases } from './appwrite';

export class DiagnosticService {
  /**
   * Save diagnostic test results
   * Prevents duplicate results within 5 minutes
   */
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
          return this.deserializeDiagnosticResult(existingDoc);
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

    return this.deserializeDiagnosticResult(doc);
  }

  /**
   * Get diagnostic result by ID
   */
  static async getDiagnosticResult(resultId: string): Promise<DiagnosticResult | null> {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.DIAGNOSTIC_RESULTS,
        resultId
      );

      return this.deserializeDiagnosticResult(doc);
    } catch {
      return null;
    }
  }

  /**
   * Get user's latest diagnostic result
   */
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

    return this.deserializeDiagnosticResult(response.documents[0]);
  }

  /**
   * Helper to deserialize diagnostic result from database
   */
  private static deserializeDiagnosticResult(doc: any): DiagnosticResult {
    return {
      ...doc,
      weak_topics: JSON.parse(doc.weak_topics as string),
      strong_topics: JSON.parse(doc.strong_topics as string),
      detailed_results: JSON.parse(doc.detailed_results as string)
    } as unknown as DiagnosticResult;
  }
}
