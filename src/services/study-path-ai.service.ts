/**
 * AI Service for Study Path Features
 * Generates personalized study recommendations and practice questions using Groq API
 */

import { GROQ_API_KEY } from '../config/appwrite.config';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export class StudyPathAIService {
  private static async callGroqAPI(prompt: string): Promise<string> {
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
              content: 'You are an expert NEET exam tutor. Provide accurate, concise responses in valid JSON format only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API call failed:', error);
      throw error;
    }
  }

  // Generate personalized study tips for a topic
  static async generateStudyTips(
    topicName: string,
    subject: string,
    difficulty: string,
    studentWeaknesses?: string[]
  ): Promise<string[]> {
    try {
      const prompt = `Generate 5 concise, actionable study tips for NEET ${subject} topic: "${topicName}" (${difficulty} level).
${studentWeaknesses ? `Student struggles with: ${studentWeaknesses.join(', ')}` : ''}

Format as a JSON array of strings. Each tip should be:
- Specific and actionable
- Focus on NEET exam patterns
- Include memory techniques or shortcuts
- Be under 100 characters

Example: ["Focus on NCERT diagrams - 60% of questions come from them", "Practice numerical problems daily"]

Return ONLY the JSON array, no other text.`;

      const content = await this.callGroqAPI(prompt);
      const tips = JSON.parse(content);
      return Array.isArray(tips) ? tips : [];
    } catch (error) {
      console.error('Error generating study tips:', error);
      return [];
    }
  }

  // Generate practice questions for a topic
  static async generatePracticeQuestions(
    topicName: string,
    subject: string,
    count: number = 5
  ): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>> {
    try {
      const prompt = `Generate ${count} NEET-style multiple choice questions for ${subject} topic: "${topicName}".

Format as JSON array with this structure:
[{
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Why this answer is correct"
}]

Requirements:
- NEET exam difficulty level
- Clear, unambiguous questions
- 4 options each
- Detailed explanations
- Focus on conceptual understanding

Return ONLY the JSON array, no other text.`;

      const content = await this.callGroqAPI(prompt);
      const questions = JSON.parse(content);
      return Array.isArray(questions) ? questions : [];
    } catch (error) {
      console.error('Error generating practice questions:', error);
      return [];
    }
  }

  // Analyze diagnostic results and provide personalized recommendations
  static async analyzeDiagnosticResults(
    totalScore: number,
    physicsScore: number,
    chemistryScore: number,
    biologyScore: number,
    weakTopics: string[],
    detailedResults: Array<{ questionId: string; isCorrect: boolean }>
  ): Promise<{
    overallAnalysis: string;
    studyStrategy: string[];
    focusAreas: string[];
    timeAllocation: { subject: string; percentage: number }[];
  }> {
    try {
      const prompt = `Analyze NEET diagnostic test results and provide personalized study recommendations:

Scores:
- Overall: ${totalScore}%
- Physics: ${physicsScore}%
- Chemistry: ${chemistryScore}%
- Biology: ${biologyScore}%

Weak Topics: ${weakTopics.join(', ')}
Total Questions: ${detailedResults.length}
Correct: ${detailedResults.filter(r => r.isCorrect).length}

Provide analysis as JSON:
{
  "overallAnalysis": "2-3 sentence assessment of student's current level",
  "studyStrategy": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "focusAreas": ["Area 1", "Area 2", "Area 3"],
  "timeAllocation": [
    {"subject": "Physics", "percentage": 30},
    {"subject": "Chemistry", "percentage": 25},
    {"subject": "Biology", "percentage": 45}
  ]
}

Base recommendations on:
- Score patterns
- Subject-wise performance
- NEET exam weightage (Biology 50%, Physics 25%, Chemistry 25%)
- Weak topic distribution

Return ONLY the JSON object, no other text.`;

      const content = await this.callGroqAPI(prompt);
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing diagnostic results:', error);
      return {
        overallAnalysis: 'Analysis unavailable',
        studyStrategy: [],
        focusAreas: [],
        timeAllocation: []
      };
    }
  }

  // Generate study schedule for a topic
  static async generateStudySchedule(
    topicName: string,
    estimatedHours: number,
    dailyStudyHours: number = 2
  ): Promise<Array<{
    day: number;
    activity: string;
    duration: number;
  }>> {
    try {
      const days = Math.ceil(estimatedHours / dailyStudyHours);
      
      const prompt = `Create a ${days}-day study schedule for NEET topic: "${topicName}" (${estimatedHours} hours total, ${dailyStudyHours} hours/day).

Format as JSON array:
[{
  "day": 1,
  "activity": "Read NCERT chapter + make notes",
  "duration": 2
}]

Include:
- Theory reading
- Practice problems
- Revision
- Mock tests
- Break days if needed

Return ONLY the JSON array, no other text.`;

      const content = await this.callGroqAPI(prompt);
      const schedule = JSON.parse(content);
      return Array.isArray(schedule) ? schedule : [];
    } catch (error) {
      console.error('Error generating study schedule:', error);
      return [];
    }
  }

  // Generate diagnostic quiz questions in batches
  static async generateDiagnosticQuestions(): Promise<Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    subject: 'Physics' | 'Chemistry' | 'Biology';
    topicId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation: string;
  }>> {
    try {
      // Generate questions in 3 batches (one per subject)
      const subjects: Array<'Physics' | 'Chemistry' | 'Biology'> = ['Physics', 'Chemistry', 'Biology'];
      const allQuestions: any[] = [];
      
      for (const subject of subjects) {
        const batch = await this.generateQuestionBatch(subject, allQuestions.length);
        allQuestions.push(...batch);
      }
      
      return allQuestions;
    } catch (error) {
      console.error('Error generating diagnostic questions:', error);
      return [];
    }
  }

  private static async generateQuestionBatch(
    subject: 'Physics' | 'Chemistry' | 'Biology',
    startIndex: number
  ): Promise<Array<any>> {
    try {
      const topicIds = {
        Physics: ['mechanics', 'thermodynamics', 'electromagnetism', 'optics', 'modern-physics'],
        Chemistry: ['physical-chemistry', 'organic-chemistry', 'inorganic-chemistry'],
        Biology: ['cell-biology', 'genetics', 'ecology', 'human-physiology', 'plant-physiology']
      };

      const prompt = `Generate exactly 10 NEET ${subject} questions for diagnostic test.

Requirements:
- 4 easy, 4 medium, 2 hard difficulty
- Cover topics: ${topicIds[subject].join(', ')}
- Clear, unambiguous questions
- 4 options each
- Correct answer index (0-3)

Format as JSON array:
[{
  "id": "q${startIndex + 1}",
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "subject": "${subject}",
  "topicId": "mechanics",
  "difficulty": "medium",
  "explanation": "Brief explanation"
}]

Return ONLY valid JSON array, no markdown, no extra text.`;

      const content = await this.callGroqAPI(prompt);
      
      // Extract JSON from response
      let jsonStr = content.trim();
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON array
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      const questions = JSON.parse(jsonStr);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      // Ensure correct IDs
      return questions.map((q, idx) => ({
        ...q,
        id: `q${startIndex + idx + 1}`,
        subject
      }));
    } catch (error) {
      console.error(`Error generating ${subject} questions:`, error);
      return [];
    }
  }
}
