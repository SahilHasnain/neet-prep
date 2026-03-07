/**
 * Micro-Intervention Service
 * Generates targeted, quick interventions for prerequisite gaps
 */

import { StudyPathAIService } from './study-path-ai.service';

interface MicroIntervention {
  keyConcepts: string[];
  bridgeExplanation: string;
  practiceQuestions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}

export class MicroInterventionService {
  /**
   * Generate a complete micro-intervention for a prerequisite gap
   */
  static async generateIntervention(
    currentTopicName: string,
    prerequisiteName: string,
    subConcepts: string[]
  ): Promise<MicroIntervention> {
    // Generate all components in parallel for speed
    const [keyConcepts, bridgeExplanation, practiceQuestions] = await Promise.all([
      this.generateKeyConcepts(prerequisiteName, subConcepts),
      this.generateBridgeExplanation(currentTopicName, prerequisiteName),
      this.generatePracticeQuestions(prerequisiteName, subConcepts)
    ]);

    return {
      keyConcepts,
      bridgeExplanation,
      practiceQuestions
    };
  }

  /**
   * Generate 3-4 key concepts to review
   */
  private static async generateKeyConcepts(
    prerequisiteName: string,
    subConcepts: string[]
  ): Promise<string[]> {
    try {
      const subConceptsText = subConcepts.length > 0 
        ? `Focus on: ${subConcepts.join(', ')}` 
        : '';

      const prompt = `Generate 3-4 essential concepts for NEET students to review about "${prerequisiteName}".
${subConceptsText}

Format as JSON array of strings. Each concept should be:
- A fundamental principle or fact
- Clear and concise (1-2 sentences)
- Directly relevant to NEET exam
- Easy to understand

Example: ["Force is mass times acceleration (F=ma)", "Newton's laws apply in inertial frames"]

Return ONLY the JSON array, no other text.`;

      const content = await StudyPathAIService['callGroqAPI'](prompt);
      
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const concepts = JSON.parse(jsonMatch[0]);
        return Array.isArray(concepts) ? concepts.slice(0, 4) : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error generating key concepts:', error);
      return [];
    }
  }

  /**
   * Generate bridge explanation connecting prerequisite to current topic
   */
  private static async generateBridgeExplanation(
    currentTopicName: string,
    prerequisiteName: string
  ): Promise<string> {
    try {
      const prompt = `Explain in 2-3 sentences how "${prerequisiteName}" connects to and is essential for understanding "${currentTopicName}" in NEET preparation.

Make it clear and motivating. Show the student WHY they need to master the prerequisite.

Return ONLY the explanation text, no JSON, no formatting.`;

      const content = await StudyPathAIService['callGroqAPI'](prompt);
      return content.trim();
    } catch (error) {
      console.error('Error generating bridge explanation:', error);
      return `Understanding ${prerequisiteName} is essential for mastering ${currentTopicName}. These concepts build on each other in NEET syllabus.`;
    }
  }

  /**
   * Generate 3-5 focused practice questions
   */
  private static async generatePracticeQuestions(
    prerequisiteName: string,
    subConcepts: string[]
  ): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>> {
    try {
      const subConceptsText = subConcepts.length > 0 
        ? `Focus on: ${subConcepts.join(', ')}` 
        : '';

      const prompt = `Generate 3 quick NEET-style MCQ questions on "${prerequisiteName}".
${subConceptsText}

Format as JSON array:
[{
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation"
}]

Requirements:
- Foundation level (not too hard)
- Test core understanding
- Clear, unambiguous
- Quick to answer (30 seconds each)

Return ONLY the JSON array, no other text.`;

      const content = await StudyPathAIService['callGroqAPI'](prompt);
      
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return Array.isArray(questions) ? questions.slice(0, 5) : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error generating practice questions:', error);
      return [];
    }
  }

  /**
   * Mark a gap as resolved after intervention completion
   */
  static async markGapResolved(
    progressId: string,
    prerequisiteId: string
  ): Promise<void> {
    try {
      const { StudyPathService } = await import('./study-path.service');
      
      // Get current progress
      const { databases } = await import('./appwrite');
      const { DATABASE_ID, COLLECTIONS } = await import('../config/appwrite.config');
      
      const doc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.TOPIC_PROGRESS,
        progressId
      );

      // Parse and update gaps
      const gaps = doc.conceptual_gaps 
        ? JSON.parse(doc.conceptual_gaps as string) 
        : [];
      
      const updatedGaps = gaps.map((gap: any) => 
        gap.prerequisite_id === prerequisiteId 
          ? { ...gap, resolved: true }
          : gap
      );

      // Update progress
      await StudyPathService.updateTopicProgress(progressId, {
        conceptual_gaps: updatedGaps as any
      });
    } catch (error) {
      console.error('Error marking gap as resolved:', error);
    }
  }
}
