/**
 * AI Notes Generation Service
 * Generates comprehensive, personalized study notes with progressive unlocking
 * Saves to database to avoid regeneration and save API costs
 */

import { ID, Query } from 'react-native-appwrite';
import { COLLECTIONS, DATABASE_ID, GROQ_API_KEY } from '../config/appwrite.config';
import { databases } from './appwrite';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export type Language = 'english' | 'hinglish';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type NoteFormat = 'comprehensive' | 'formula-sheet' | 'concept-map' | 'quick-revision' | 'common-mistakes';

export interface NoteSection {
  id: string;
  title: string;
  content: string;
  unlockCondition: {
    type: 'video' | 'quiz' | 'always';
    threshold: number; // percentage
  };
  isUnlocked: boolean;
  order: number;
}

export interface GeneratedNotes {
  topicName: string;
  subject: string;
  language: Language;
  difficulty: DifficultyLevel;
  format: NoteFormat;
  sections: NoteSection[];
  metadata: {
    generatedAt: string;
    estimatedReadTime: number; // minutes
    keyTakeaways: string[];
  };
}

export interface PersonalizedNotesRequest {
  topicName: string;
  subject: string;
  difficulty: DifficultyLevel;
  language: Language;
  format: NoteFormat;
  weakAreas?: string[];
  quizPerformance?: {
    score: number;
    missedConcepts: string[];
  };
}

export class AINotesService {
  /**
   * Check if notes already exist in database
   */
  static async getExistingNotes(
    userId: string,
    topicId: string,
    language: Language,
    format: NoteFormat
  ): Promise<GeneratedNotes | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AI_NOTES,
        [
          Query.equal('user_id', userId),
          Query.equal('topic_id', topicId),
          Query.equal('language', language),
          Query.equal('format', format),
          Query.limit(1)
        ]
      );

      if (response.documents.length > 0) {
        const doc = response.documents[0];
        
        // Update access tracking
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.AI_NOTES,
          doc.$id,
          {
            last_accessed: new Date().toISOString(),
            access_count: (doc.access_count as number) + 1
          }
        );

        return {
          topicName: doc.topic_name as string,
          subject: doc.subject as string,
          language: doc.language as Language,
          difficulty: doc.difficulty as DifficultyLevel,
          format: doc.format as NoteFormat,
          sections: JSON.parse(doc.sections as string),
          metadata: {
            generatedAt: doc.generated_at as string,
            estimatedReadTime: doc.estimated_read_time as number,
            keyTakeaways: JSON.parse(doc.key_takeaways as string)
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching existing notes:', error);
      return null;
    }
  }

  /**
   * Save generated notes to database
   */
  static async saveNotes(
    userId: string,
    topicId: string,
    notes: GeneratedNotes
  ): Promise<void> {
    try {
      const docId = ID.unique();
      const now = new Date().toISOString();
      
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.AI_NOTES,
        docId,
        {
          note_id: docId,
          user_id: userId,
          topic_id: topicId,
          topic_name: notes.topicName,
          subject: notes.subject,
          language: notes.language,
          difficulty: notes.difficulty,
          format: notes.format,
          sections: JSON.stringify(notes.sections),
          key_takeaways: JSON.stringify(notes.metadata.keyTakeaways),
          estimated_read_time: notes.metadata.estimatedReadTime,
          generated_at: notes.metadata.generatedAt,
          last_accessed: now,
          access_count: 1 // Always provide initial value
        }
      );
      console.log('✅ Notes saved to database');
    } catch (error) {
      console.error('Error saving notes to database:', error);
      // Don't throw - notes are still usable even if save fails
    }
  }

  /**
   * Delete notes (for regeneration or cleanup)
   */
  static async deleteNotes(
    userId: string,
    topicId: string,
    language?: Language,
    format?: NoteFormat
  ): Promise<void> {
    try {
      const queries = [
        Query.equal('user_id', userId),
        Query.equal('topic_id', topicId)
      ];

      if (language) queries.push(Query.equal('language', language));
      if (format) queries.push(Query.equal('format', format));

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AI_NOTES,
        queries
      );

      for (const doc of response.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.AI_NOTES, doc.$id);
      }
      
      console.log(`✅ Deleted ${response.documents.length} note(s)`);
    } catch (error) {
      console.error('Error deleting notes:', error);
    }
  }

  private static async callGroqAPI(prompt: string, maxTokens: number = 3000): Promise<string> {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert NEET exam tutor who creates comprehensive, exam-focused study notes. Always respond in valid JSON format. Do not include any control characters, newlines within strings, or special formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
          response_format: { type: "json_object" } // Force JSON response
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', response.status, errorText);
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      if (!content) {
        throw new Error('Empty response from AI');
      }
      
      return content;
    } catch (error) {
      console.error('Groq API call failed:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive notes with progressive sections
   */
  static async generateComprehensiveNotes(request: PersonalizedNotesRequest): Promise<GeneratedNotes> {
    const languageInstruction = request.language === 'hinglish' 
      ? 'Use Hinglish (Hindi-English mix) - technical terms in English, explanations in simple Hindi-English mix. Example: "Cell membrane ek selectively permeable barrier hai jo cell ko protect karta hai."'
      : 'Use clear, simple English suitable for NEET students.';

    const difficultyInstruction = {
      beginner: 'Use simple language, more examples, step-by-step explanations. Assume basic knowledge only.',
      intermediate: 'Balance theory and application. Include formulas and key concepts. Assume NCERT knowledge.',
      advanced: 'Dense, formula-heavy content. Focus on problem-solving strategies and advanced concepts.'
    }[request.difficulty];

    const weakAreasContext = request.weakAreas && request.weakAreas.length > 0
      ? `\n\nStudent struggles with: ${request.weakAreas.join(', ')}. Give extra attention to these areas with more examples and explanations.`
      : '';

    const quizContext = request.quizPerformance
      ? `\n\nRecent quiz performance: ${request.quizPerformance.score}%. Missed concepts: ${request.quizPerformance.missedConcepts.join(', ')}. Reinforce these areas.`
      : '';

    const prompt = `Generate comprehensive NEET study notes for: "${request.topicName}" (${request.subject})

LANGUAGE: ${languageInstruction}
DIFFICULTY: ${difficultyInstruction}${weakAreasContext}${quizContext}

Create notes divided into 5 progressive sections:
1. Foundation Concepts (Always unlocked)
2. Core Theory (Unlock after 30% video completion)
3. Problem-Solving Techniques (Unlock after 60% video completion)
4. Advanced Applications (Unlock after quiz attempt)
5. Exam Strategy & Quick Revision (Unlock after 80% mastery)

For each section include:
- Clear explanations
- Key formulas (if applicable)
- Important diagrams/concepts to remember
- NEET exam tips
- Common mistakes to avoid

Return JSON:
{
  "sections": [
    {
      "id": "section_1",
      "title": "Foundation Concepts",
      "content": "Detailed markdown content here...",
      "unlockCondition": {"type": "always", "threshold": 0},
      "order": 1
    }
  ],
  "keyTakeaways": ["Key point 1", "Key point 2", "Key point 3"],
  "estimatedReadTime": 15
}

Make content rich, exam-focused, and easy to understand. Use bullet points, numbered lists, and clear formatting.

Return ONLY valid JSON, no markdown blocks.`;

    try {
      const content = await this.callGroqAPI(prompt, 4000);
      const parsed = this.parseJSON(content);

      return {
        topicName: request.topicName,
        subject: request.subject,
        language: request.language,
        difficulty: request.difficulty,
        format: request.format,
        sections: parsed.sections.map((s: any) => ({
          ...s,
          isUnlocked: s.unlockCondition.type === 'always'
        })),
        metadata: {
          generatedAt: new Date().toISOString(),
          estimatedReadTime: parsed.estimatedReadTime || 15,
          keyTakeaways: parsed.keyTakeaways || []
        }
      };
    } catch (error) {
      console.error('Error generating comprehensive notes:', error);
      throw error;
    }
  }

  /**
   * Generate formula sheet format
   */
  static async generateFormulaSheet(request: PersonalizedNotesRequest): Promise<GeneratedNotes> {
    const languageInstruction = request.language === 'hinglish'
      ? 'Formula names and variables in English, brief explanations in Hinglish.'
      : 'Use clear English.';

    const prompt = `Generate a NEET formula sheet for: "${request.topicName}" (${request.subject})

${languageInstruction}

Create organized sections:
1. Essential Formulas (Always unlocked)
2. Derived Formulas (Unlock after 40% progress)
3. Problem-Solving Shortcuts (Unlock after quiz)
4. Common Formula Mistakes (Unlock after 70% mastery)

For each formula include:
- Formula with clear notation
- When to use it
- Units and dimensions
- Quick example
- Common mistakes

Return JSON format:
{
  "sections": [
    {
      "id": "section_1",
      "title": "Essential Formulas",
      "content": "Markdown formatted formulas...",
      "unlockCondition": {"type": "always", "threshold": 0},
      "order": 1
    }
  ],
  "keyTakeaways": ["Formula 1: F=ma", "Formula 2: ..."],
  "estimatedReadTime": 10
}

Return ONLY valid JSON.`;

    try {
      const content = await this.callGroqAPI(prompt, 3000);
      const parsed = this.parseJSON(content);

      return {
        topicName: request.topicName,
        subject: request.subject,
        language: request.language,
        difficulty: request.difficulty,
        format: 'formula-sheet',
        sections: parsed.sections.map((s: any) => ({
          ...s,
          isUnlocked: s.unlockCondition.type === 'always'
        })),
        metadata: {
          generatedAt: new Date().toISOString(),
          estimatedReadTime: parsed.estimatedReadTime || 10,
          keyTakeaways: parsed.keyTakeaways || []
        }
      };
    } catch (error) {
      console.error('Error generating formula sheet:', error);
      throw error;
    }
  }

  /**
   * Generate quick revision notes
   */
  static async generateQuickRevision(request: PersonalizedNotesRequest): Promise<GeneratedNotes> {
    const languageInstruction = request.language === 'hinglish'
      ? 'Use Hinglish for quick recall.'
      : 'Use concise English.';

    const prompt = `Generate quick revision notes for NEET topic: "${request.topicName}" (${request.subject})

${languageInstruction}

Create ultra-concise sections:
1. One-Liner Summary (Always unlocked)
2. Must-Remember Points (5-7 points)
3. Quick Formulas/Facts
4. Last-Minute Tips

Each point should be:
- Maximum 2 lines
- Exam-focused
- Easy to memorize
- Include mnemonics where helpful

Return JSON:
{
  "sections": [
    {
      "id": "section_1",
      "title": "One-Liner Summary",
      "content": "Brief content...",
      "unlockCondition": {"type": "always", "threshold": 0},
      "order": 1
    }
  ],
  "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
  "estimatedReadTime": 5
}

Return ONLY valid JSON.`;

    try {
      const content = await this.callGroqAPI(prompt, 2000);
      const parsed = this.parseJSON(content);

      return {
        topicName: request.topicName,
        subject: request.subject,
        language: request.language,
        difficulty: request.difficulty,
        format: 'quick-revision',
        sections: parsed.sections.map((s: any) => ({
          ...s,
          isUnlocked: true // All sections unlocked for quick revision
        })),
        metadata: {
          generatedAt: new Date().toISOString(),
          estimatedReadTime: parsed.estimatedReadTime || 5,
          keyTakeaways: parsed.keyTakeaways || []
        }
      };
    } catch (error) {
      console.error('Error generating quick revision:', error);
      throw error;
    }
  }

  /**
   * Generate common mistakes guide
   */
  static async generateCommonMistakes(request: PersonalizedNotesRequest): Promise<GeneratedNotes> {
    const languageInstruction = request.language === 'hinglish'
      ? 'Explain mistakes in Hinglish for better understanding.'
      : 'Use clear English.';

    const prompt = `Generate common mistakes guide for NEET topic: "${request.topicName}" (${request.subject})

${languageInstruction}

Create sections:
1. Conceptual Mistakes (Always unlocked)
2. Calculation Errors (Unlock after quiz)
3. Exam-Specific Pitfalls (Unlock after 50% mastery)

For each mistake include:
- What students commonly do wrong
- Why it's wrong
- Correct approach
- How to avoid it

Return JSON:
{
  "sections": [
    {
      "id": "section_1",
      "title": "Conceptual Mistakes",
      "content": "Detailed mistakes...",
      "unlockCondition": {"type": "always", "threshold": 0},
      "order": 1
    }
  ],
  "keyTakeaways": ["Avoid mistake 1", "Remember to..."],
  "estimatedReadTime": 8
}

Return ONLY valid JSON.`;

    try {
      const content = await this.callGroqAPI(prompt, 2500);
      const parsed = this.parseJSON(content);

      return {
        topicName: request.topicName,
        subject: request.subject,
        language: request.language,
        difficulty: request.difficulty,
        format: 'common-mistakes',
        sections: parsed.sections.map((s: any) => ({
          ...s,
          isUnlocked: s.unlockCondition.type === 'always'
        })),
        metadata: {
          generatedAt: new Date().toISOString(),
          estimatedReadTime: parsed.estimatedReadTime || 8,
          keyTakeaways: parsed.keyTakeaways || []
        }
      };
    } catch (error) {
      console.error('Error generating common mistakes:', error);
      throw error;
    }
  }

  /**
   * Main entry point - generates notes based on format
   */
  static async generateNotes(request: PersonalizedNotesRequest): Promise<GeneratedNotes> {
    switch (request.format) {
      case 'formula-sheet':
        return this.generateFormulaSheet(request);
      case 'quick-revision':
        return this.generateQuickRevision(request);
      case 'common-mistakes':
        return this.generateCommonMistakes(request);
      case 'comprehensive':
      default:
        return this.generateComprehensiveNotes(request);
    }
  }

  /**
   * Calculate which sections should be unlocked based on progress
   */
  static calculateUnlockedSections(
    notes: GeneratedNotes,
    progress: {
      videoProgress: number; // 0-100
      quizAttempts: number;
      masteryLevel: number; // 0-100
    }
  ): GeneratedNotes {
    const updatedSections = notes.sections.map(section => {
      let isUnlocked = section.isUnlocked;

      if (!isUnlocked) {
        switch (section.unlockCondition.type) {
          case 'video':
            isUnlocked = progress.videoProgress >= section.unlockCondition.threshold;
            break;
          case 'quiz':
            isUnlocked = progress.quizAttempts > 0;
            break;
          case 'always':
            isUnlocked = true;
            break;
        }
      }

      return { ...section, isUnlocked };
    });

    return { ...notes, sections: updatedSections };
  }

  /**
   * Helper to parse JSON from API response
   */
  private static parseJSON(content: string): any {
    // Clean the content first
    let jsonStr = content.trim();
    
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Remove control characters (U+0000 to U+001F) that break JSON parsing
    jsonStr = jsonStr.replace(/[\u0000-\u001F]/g, '');
    
    // Find JSON object or array
    const jsonMatch = jsonStr.match(/[\{\[][\s\S]*[\}\]]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('JSON parse error:', error);
      console.error('Attempted to parse:', jsonStr.substring(0, 200));
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
}
