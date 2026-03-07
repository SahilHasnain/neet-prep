/**
 * Gap Detection Service
 * Analyzes quiz performance to identify missing prerequisite knowledge
 */

import { getPrerequisites, getTopicById } from '../config/knowledge-graph.config';
import type { ConceptualGap } from '../types/study-path.types';
import { StudyPathAIService } from './study-path-ai.service';

export class GapDetectionService {
  // Threshold for triggering gap analysis
  private static readonly STRUGGLE_THRESHOLD = 60; // Quiz score below 60%
  private static readonly LOW_MASTERY_THRESHOLD = 50; // Mastery level below 50%

  /**
   * Analyze quiz performance and detect conceptual gaps
   */
  static async analyzeQuizPerformance(
    topicId: string,
    quizScore: number,
    currentMastery: number,
    quizAttempts: number
  ): Promise<ConceptualGap[]> {
    // Check if student is struggling
    const isStruggling = quizScore < this.STRUGGLE_THRESHOLD || 
                         (currentMastery < this.LOW_MASTERY_THRESHOLD && quizAttempts >= 2);

    if (!isStruggling) {
      return []; // No gaps detected
    }

    console.log(`Student struggling with ${topicId}. Analyzing gaps...`);

    // Get prerequisite chain
    const gaps = await this.tracePrerequisiteGaps(topicId, quizScore);
    
    return gaps;
  }

  /**
   * Trace back through prerequisites to find root cause gaps
   */
  private static async tracePrerequisiteGaps(
    topicId: string,
    quizScore: number
  ): Promise<ConceptualGap[]> {
    const gaps: ConceptualGap[] = [];
    const topic = getTopicById(topicId);
    
    if (!topic) return gaps;

    // Get direct prerequisites
    const prerequisites = getPrerequisites(topicId);

    if (prerequisites.length === 0) {
      // No prerequisites - student needs to review this topic itself
      return gaps;
    }

    // Analyze each prerequisite
    for (const prereq of prerequisites) {
      const severity = this.calculateGapSeverity(quizScore, prereq.difficulty);
      
      // Use AI to identify specific sub-concepts that are weak
      const subConcepts = await this.identifyWeakSubConcepts(
        topic.name,
        prereq.name,
        quizScore
      );

      gaps.push({
        prerequisite_id: prereq.id,
        prerequisite_name: prereq.name,
        gap_severity: severity,
        detected_at: new Date().toISOString(),
        sub_concepts: subConcepts,
        resolved: false
      });
    }

    return gaps;
  }

  /**
   * Calculate how severe the gap is based on quiz performance
   */
  private static calculateGapSeverity(
    quizScore: number,
    prereqDifficulty: string
  ): 'critical' | 'moderate' | 'minor' {
    // Lower scores = more critical gaps
    if (quizScore < 40) {
      return 'critical';
    } else if (quizScore < 55) {
      return prereqDifficulty === 'foundation' ? 'critical' : 'moderate';
    } else {
      return 'minor';
    }
  }

  /**
   * Use AI to identify specific sub-concepts within prerequisite that are weak
   */
  private static async identifyWeakSubConcepts(
    currentTopicName: string,
    prerequisiteName: string,
    quizScore: number
  ): Promise<string[]> {
    try {
      const prompt = `A NEET student scored ${quizScore}% on "${currentTopicName}" quiz, indicating gaps in prerequisite "${prerequisiteName}".

Identify 3-4 specific sub-concepts within "${prerequisiteName}" that are likely causing the struggle.

Format as JSON array of strings:
["Sub-concept 1", "Sub-concept 2", "Sub-concept 3"]

Be specific and actionable. Focus on foundational concepts.

Return ONLY the JSON array, no other text.`;

      const content = await StudyPathAIService['callGroqAPI'](prompt);
      
      // Clean and parse response
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const subConcepts = JSON.parse(jsonMatch[0]);
        return Array.isArray(subConcepts) ? subConcepts.slice(0, 4) : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error identifying weak sub-concepts:', error);
      return [];
    }
  }

  /**
   * Check if existing gaps should be updated based on new quiz performance
   */
  static shouldUpdateGaps(
    existingGaps: ConceptualGap[],
    newQuizScore: number,
    quizAttempts: number
  ): boolean {
    // Update if:
    // 1. No existing gaps but now struggling
    // 2. Existing gaps but performance worsened
    // 3. Multiple attempts with low scores
    
    if (existingGaps.length === 0 && newQuizScore < this.STRUGGLE_THRESHOLD) {
      return true;
    }

    if (existingGaps.length > 0 && newQuizScore < 50 && quizAttempts >= 2) {
      return true;
    }

    return false;
  }

  /**
   * Generate explanation for why student is stuck
   */
  static async generateGapExplanation(
    topicName: string,
    gaps: ConceptualGap[]
  ): Promise<string> {
    if (gaps.length === 0) {
      return `Keep practicing ${topicName}. You're making progress!`;
    }

    const criticalGaps = gaps.filter(g => g.gap_severity === 'critical');
    
    if (criticalGaps.length > 0) {
      const gapNames = criticalGaps.map(g => g.prerequisite_name).join(', ');
      return `You're struggling with ${topicName} because you need to strengthen: ${gapNames}. Master these first, then return to ${topicName}.`;
    }

    const gapNames = gaps.map(g => g.prerequisite_name).join(', ');
    return `To improve in ${topicName}, review these concepts: ${gapNames}.`;
  }
}
