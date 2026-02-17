# Phase 4: AI Enhancement - Implementation Plan

## Overview

Integrate GROQ Vision API to automatically analyze diagram images, suggest labels, generate quiz questions, and validate diagram quality. This phase builds on the existing AI infrastructure (GROQ + Appwrite Functions) to add vision capabilities.

---

## 4.1 AI Label Suggestions

### 4.1.1 Backend: Appwrite Function

**New Function: `analyze-diagram`**

Location: `appwrite-functions/analyze-diagram/`

**Purpose**: Analyze uploaded diagram images using GROQ Vision API and return suggested labels with positions.

**Input**:

```json
{
  "imageUrl": "https://...",
  "imageId": "file_123",
  "userId": "user_123",
  "cardId": "card_123",
  "diagramType": "anatomy|circuit|cell|chemistry|physics",
  "language": "en"
}
```

**Output**:

```json
{
  "success": true,
  "data": {
    "labels": [
      {
        "label_text": "Mitochondria",
        "x_position": 45.5,
        "y_position": 60.2,
        "confidence": 0.95,
        "description": "Powerhouse of the cell"
      }
    ],
    "diagram_quality": {
      "score": 8.5,
      "issues": [],
      "suggestions": ["Increase contrast for better visibility"]
    }
  }
}
```

**Implementation Steps**:

1. Create function directory structure:

```
appwrite-functions/
├── analyze-diagram/
│   ├── main.js
│   ├── package.json
│   └── README.md
```

2. Install dependencies:

```json
{
  "dependencies": {
    "groq-sdk": "^0.8.0",
    "node-appwrite": "^14.1.0",
    "sharp": "^0.33.0"
  }
}
```

3. Implement vision analysis with GROQ:

- Use `llama-3.2-90b-vision-preview` model
- Download image from Appwrite Storage
- Convert to base64 for GROQ API
- Parse structured JSON response
- Validate label positions (0-100 range)

4. Deploy function:

```bash
appwrite functions create \
  --functionId analyze-diagram \
  --name "Analyze Diagram" \
  --runtime node-18.0 \
  --execute any
```

### 4.1.2 Frontend: AI Label Service

**New Service: `ai-diagram.service.ts`**

Location: `src/services/ai-diagram.service.ts`

**Methods**:

```typescript
class AIDiagramService {
  // Analyze diagram and get label suggestions
  static async analyzeDiagram(
    imageId: string,
    imageUrl: string,
    cardId: string,
    diagramType?: string,
  ): Promise<LabelSuggestion[]>;

  // Apply suggested labels to card
  static async applySuggestedLabels(
    cardId: string,
    suggestions: LabelSuggestion[],
    selectedIndices: number[],
  ): Promise<DiagramLabel[]>;

  // Get diagram quality assessment
  static async assessDiagramQuality(
    imageUrl: string,
  ): Promise<DiagramQualityReport>;
}
```

**Types to Add** (in `flashcard.types.ts`):

```typescript
export interface LabelSuggestion {
  label_text: string;
  x_position: number;
  y_position: number;
  confidence: number;
  description?: string;
}

export interface DiagramQualityReport {
  score: number; // 0-10
  issues: string[];
  suggestions: string[];
  is_acceptable: boolean;
}
```

### 4.1.3 UI Components

**New Component: `AILabelSuggestions.tsx`**

Location: `src/components/diagram/AILabelSuggestions.tsx`

**Features**:

- Display AI-suggested labels in a list
- Show confidence scores with visual indicators
- Allow user to select/deselect suggestions
- Preview selected labels on diagram
- "Apply Selected" and "Reject All" buttons
- Loading state during analysis

**UI Flow**:

1. User uploads diagram image
2. "Analyze with AI" button appears
3. Click triggers analysis (loading spinner)
4. Suggestions appear in bottom sheet/modal
5. User reviews and selects desired labels
6. Click "Apply" to add labels to diagram
7. User can still edit/adjust positions

**Update: `LabelEditor.tsx`**

- Add "Analyze with AI" button
- Integrate AILabelSuggestions component
- Show AI suggestions overlay on diagram
- Allow toggling between manual and AI mode

### 4.1.4 Hook: useAIDiagram

**New Hook: `useAIDiagram.ts`**

Location: `src/hooks/useAIDiagram.ts`

```typescript
export function useAIDiagram(cardId: string) {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<LabelSuggestion[]>([]);
  const [qualityReport, setQualityReport] =
    useState<DiagramQualityReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeDiagram = async (imageId: string, imageUrl: string) => {
    // Call AI service
  };

  const applySuggestions = async (selectedIndices: number[]) => {
    // Apply selected labels
  };

  const assessQuality = async (imageUrl: string) => {
    // Get quality report
  };

  return {
    analyzing,
    suggestions,
    qualityReport,
    error,
    analyzeDiagram,
    applySuggestions,
    assessQuality,
  };
}
```

---

## 4.2 AI-Generated Quiz Questions

### 4.2.1 Backend: Extend Appwrite Function

**Update Function: `analyze-diagram`**

Add new endpoint/mode for quiz generation.

**Input**:

```json
{
  "mode": "generate_quiz",
  "imageUrl": "https://...",
  "labels": [
    { "label_text": "Mitochondria", "description": "..." },
    { "label_text": "Nucleus", "description": "..." }
  ],
  "questionCount": 5,
  "questionTypes": ["identification", "function", "multiple_choice"],
  "difficulty": "medium"
}
```

**Output**:

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question_id": "q1",
        "type": "identification",
        "question": "What is the powerhouse of the cell?",
        "correct_answer": "Mitochondria",
        "options": ["Nucleus", "Mitochondria", "Ribosome", "Golgi Body"],
        "explanation": "Mitochondria produce ATP...",
        "related_label": "Mitochondria"
      }
    ]
  }
}
```

### 4.2.2 Question Types

**1. Identification Questions**

- "What is the structure labeled at position X?"
- User clicks on diagram or types answer
- Validates against label text

**2. Function Questions**

- "What is the function of [label]?"
- Multiple choice or text input
- Uses AI-generated descriptions

**3. Location Questions**

- "Where is the [label] located?"
- User clicks on diagram
- Validates proximity to actual position

**4. Relationship Questions**

- "How does [label A] relate to [label B]?"
- Multiple choice
- Tests understanding of connections

**5. Fill-in-the-Blank**

- "The **\_** is responsible for..."
- Text input
- Validates against label text

### 4.2.3 Frontend Implementation

**New Types** (add to `flashcard.types.ts`):

```typescript
export enum QuizQuestionType {
  IDENTIFICATION = "identification",
  FUNCTION = "function",
  LOCATION = "location",
  RELATIONSHIP = "relationship",
  FILL_BLANK = "fill_blank",
  MULTIPLE_CHOICE = "multiple_choice",
}

export interface QuizQuestion {
  question_id: string;
  type: QuizQuestionType;
  question: string;
  correct_answer: string;
  options?: string[];
  explanation: string;
  related_label?: string;
  difficulty: DifficultyLevel;
}

export interface QuizSession {
  session_id: string;
  card_id: string;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  score: number;
  started_at: string;
  completed_at?: string;
}

export interface QuizAnswer {
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  time_taken: number; // seconds
}
```

**Update Component: `DiagramQuiz.tsx`**

Add AI-generated questions mode:

- Toggle between "Label Quiz" and "AI Quiz"
- Display AI-generated questions
- Support multiple question types
- Show explanations after each answer
- Track performance per question type

**New Service Method** (in `ai-diagram.service.ts`):

```typescript
static async generateQuizQuestions(
  imageUrl: string,
  labels: DiagramLabel[],
  questionCount: number,
  questionTypes: QuizQuestionType[],
  difficulty: DifficultyLevel
): Promise<QuizQuestion[]>
```

**New Hook: `useAIQuiz.ts`**

```typescript
export function useAIQuiz(cardId: string) {
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);

  const generateQuestions = async (...) => { };
  const startSession = () => { };
  const submitAnswer = (questionId: string, answer: string) => { };
  const endSession = () => { };

  return { ... };
}
```

---

## 4.3 Diagram Quality Check

### 4.3.1 Quality Assessment Criteria

**Image Quality Checks**:

1. Resolution: Minimum 800x600 pixels
2. File size: 100KB - 5MB
3. Clarity: Detect blur using edge detection
4. Contrast: Ensure sufficient contrast ratio
5. Brightness: Not too dark or overexposed
6. Format: Valid image format (jpg, png)

**Content Quality Checks**:

1. Diagram complexity: Suitable number of identifiable parts
2. Label visibility: Text/parts are distinguishable
3. Educational value: Relevant for learning
4. Duplicate detection: Check if similar diagram exists

### 4.3.2 Backend Implementation

**In `analyze-diagram` function**, add quality assessment:

```javascript
async function assessDiagramQuality(imageBuffer, imageMetadata) {
  const issues = [];
  const suggestions = [];
  let score = 10;

  // Check resolution
  if (imageMetadata.width < 800 || imageMetadata.height < 600) {
    issues.push("Low resolution");
    suggestions.push("Upload a higher resolution image (min 800x600)");
    score -= 2;
  }

  // Check file size
  if (imageMetadata.size < 100000) {
    issues.push("File size too small, may indicate low quality");
    score -= 1;
  }

  // Use GROQ Vision to assess content
  const aiAssessment = await groq.chat.completions.create({
    model: "llama-3.2-90b-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Assess this diagram for educational use. Check: clarity, contrast, label visibility, complexity. Return JSON with score (0-10), issues[], suggestions[]",
          },
          { type: "image_url", image_url: { url: imageBase64 } },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  // Combine technical and AI assessment
  return {
    score,
    issues,
    suggestions,
    is_acceptable: score >= 6,
  };
}
```

### 4.3.3 Frontend Implementation

**New Component: `DiagramQualityIndicator.tsx`**

Location: `src/components/diagram/DiagramQualityIndicator.tsx`

**Features**:

- Display quality score (0-10) with color coding
  - 8-10: Green (Excellent)
  - 6-7: Yellow (Good)
  - 0-5: Red (Poor)
- List issues found
- Show improvement suggestions
- "Retry with better image" option
- "Proceed anyway" option (for score >= 6)

**Integration Points**:

1. `ImageUploader.tsx` - Show quality check after upload
2. `LabelEditor.tsx` - Display quality indicator in corner
3. Create card flow - Block creation if quality < 6

**User Experience**:

```
[Upload Image]
  ↓
[Analyzing quality...]
  ↓
[Quality Score: 7/10 ✓]
Issues:
- Slightly low contrast
Suggestions:
- Increase brightness by 10-20%
- Use a clearer background

[Proceed] [Upload Better Image]
```

---

## 4.4 GROQ Vision API Integration Details

### 4.4.1 Model Selection

**Primary Model**: `llama-3.2-90b-vision-preview`

- Supports image + text input
- JSON mode for structured output
- Good balance of speed and accuracy
- Cost-effective for production

**Fallback Model**: `llama-3.2-11b-vision-preview`

- Faster, lower cost
- Use for quality checks
- Less accurate for complex diagrams

### 4.4.2 Prompt Engineering

**Label Detection Prompt**:

```
You are an expert biology/physics/chemistry educator analyzing educational diagrams.

Analyze this diagram and identify all labeled or identifiable parts.

For each part, provide:
1. label_text: The name of the part (concise, 2-5 words)
2. x_position: Horizontal position as percentage (0-100) from left edge
3. y_position: Vertical position as percentage (0-100) from top edge
4. confidence: Your confidence in this identification (0.0-1.0)
5. description: Brief educational description (1 sentence)

Guidelines:
- Focus on educationally significant parts
- Use standard terminology (e.g., "Mitochondria" not "Mito")
- Position should point to the CENTER of each part
- Only include parts you can clearly identify
- Aim for 5-15 labels per diagram

Return ONLY valid JSON:
{
  "labels": [
    {
      "label_text": "...",
      "x_position": 45.5,
      "y_position": 60.2,
      "confidence": 0.95,
      "description": "..."
    }
  ]
}
```

**Quiz Generation Prompt**:

```
You are creating quiz questions for NEET exam preparation.

Given this diagram and its labeled parts, generate {count} quiz questions.

Labeled parts:
{labels_json}

Question types to include: {question_types}
Difficulty level: {difficulty}

For each question, provide:
1. type: One of [identification, function, location, relationship, multiple_choice]
2. question: The question text
3. correct_answer: The correct answer
4. options: Array of 4 options (for multiple_choice)
5. explanation: Why this answer is correct (2-3 sentences)
6. related_label: Which label this question relates to

Guidelines:
- Questions should test understanding, not just memorization
- Use NEET-style phrasing
- Explanations should be educational
- For multiple_choice, include plausible distractors
- Vary difficulty within the specified level

Return ONLY valid JSON:
{
  "questions": [...]
}
```

### 4.4.3 Image Processing

**Before sending to GROQ**:

1. Download image from Appwrite Storage
2. Validate format and size
3. Resize if too large (max 2048x2048)
4. Convert to base64
5. Optimize quality vs size

**Using Sharp library**:

```javascript
const sharp = require("sharp");

async function processImageForAI(imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata();

  let processed = sharp(imageBuffer);

  // Resize if too large
  if (metadata.width > 2048 || metadata.height > 2048) {
    processed = processed.resize(2048, 2048, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert to JPEG for consistency
  const buffer = await processed.jpeg({ quality: 85 }).toBuffer();

  // Convert to base64
  const base64 = buffer.toString("base64");
  return `data:image/jpeg;base64,${base64}`;
}
```

### 4.4.4 Error Handling & Retries

**Common Errors**:

1. Rate limiting (429)
2. Timeout (504)
3. Invalid image format
4. Model overload
5. Parsing errors

**Retry Strategy**:

```javascript
async function callGroqWithRetry(requestFn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.status === 429) {
        // Rate limited - exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (error.status === 504 && i < maxRetries - 1) {
        // Timeout - retry
        continue;
      }

      throw error;
    }
  }
}
```

**User-Facing Messages**:

- Rate limit: "AI service is busy. Please try again in a moment."
- Timeout: "Analysis taking longer than expected. Retrying..."
- Invalid image: "Unable to analyze this image. Please try a clearer photo."
- Generic error: "AI analysis failed. You can still add labels manually."

---

## 4.5 Database Schema Updates

### 4.5.1 New Collection: `ai_diagram_analysis`

Track AI analysis history for analytics and caching.

```
Collection: ai_diagram_analysis
Attributes:
- analysis_id (string, unique, required)
- user_id (string, indexed, required)
- card_id (string, indexed, required)
- image_id (string, required)
- analysis_type (enum: label_detection, quiz_generation, quality_check)
- status (enum: pending, success, failed)
- result_data (string, JSON) - Stores analysis results
- confidence_score (float) - Average confidence
- processing_time (integer) - Milliseconds
- error_message (string, optional)
- created_at (datetime, required)

Indexes:
- user_id (ascending)
- card_id (ascending)
- created_at (descending)
```

### 4.5.2 Update Collection: `flashcards`

Add AI-related fields:

```
New Attributes:
- ai_analyzed (boolean, default: false)
- ai_confidence (float, 0-1, optional)
- ai_suggestions_count (integer, default: 0)
- ai_labels_applied (integer, default: 0)
```

### 4.5.3 Setup Script

**New Script**: `scripts/setup-ai-diagram-feature.ts`

```typescript
import { Client, Databases, ID } from "node-appwrite";

async function setupAIDiagramFeature() {
  // Create ai_diagram_analysis collection
  // Add attributes
  // Create indexes
  // Update flashcards collection with new attributes
}
```

Run with:

```bash
npx tsx scripts/setup-ai-diagram-feature.ts
```

---

## 4.6 Configuration & Environment

### 4.6.1 Environment Variables

**Add to `.env.local`**:

```env
# AI Diagram Analysis
EXPO_PUBLIC_ANALYZE_DIAGRAM_FUNCTION_URL=https://[your-appwrite-endpoint]/v1/functions/analyze-diagram/executions

# Feature Flags
EXPO_PUBLIC_AI_DIAGRAM_ENABLED=true
EXPO_PUBLIC_AI_QUIZ_ENABLED=true
EXPO_PUBLIC_QUALITY_CHECK_ENABLED=true

# AI Settings
EXPO_PUBLIC_AI_MIN_CONFIDENCE=0.7
EXPO_PUBLIC_AI_MAX_LABELS=15
EXPO_PUBLIC_AI_TIMEOUT=30000
```

**Add to Appwrite Function Environment**:

```env
GROQ_API_KEY=gsk_...
APPWRITE_ENDPOINT=https://...
APPWRITE_PROJECT_ID=...
APPWRITE_API_KEY=...
DATABASE_ID=flashcard_db
BUCKET_ID=flashcard_images
```

### 4.6.2 Feature Flags

**New Config**: `src/config/ai-features.config.ts`

```typescript
export const AI_FEATURES = {
  DIAGRAM_ANALYSIS: {
    enabled: process.env.EXPO_PUBLIC_AI_DIAGRAM_ENABLED === "true",
    minConfidence: parseFloat(
      process.env.EXPO_PUBLIC_AI_MIN_CONFIDENCE || "0.7",
    ),
    maxLabels: parseInt(process.env.EXPO_PUBLIC_AI_MAX_LABELS || "15"),
    timeout: parseInt(process.env.EXPO_PUBLIC_AI_TIMEOUT || "30000"),
  },
  QUIZ_GENERATION: {
    enabled: process.env.EXPO_PUBLIC_AI_QUIZ_ENABLED === "true",
    defaultQuestionCount: 5,
    maxQuestionCount: 20,
  },
  QUALITY_CHECK: {
    enabled: process.env.EXPO_PUBLIC_QUALITY_CHECK_ENABLED === "true",
    minScore: 6,
    blockLowQuality: true,
  },
} as const;
```

**Usage in Components**:

```typescript
import { AI_FEATURES } from "@/config/ai-features.config";

if (AI_FEATURES.DIAGRAM_ANALYSIS.enabled) {
  // Show AI analysis button
}
```

---

## 4.7 Testing Strategy

### 4.7.1 Test Datasets

**Prepare Test Images**:

1. Biology: Cell diagram, heart anatomy, digestive system
2. Physics: Circuit diagram, force diagram, wave diagram
3. Chemistry: Molecular structure, periodic table section
4. Quality variations: Clear, blurry, low-res, high-res

**Expected Outcomes**:

- Cell diagram → 8-12 labels (nucleus, mitochondria, etc.)
- Circuit diagram → 5-10 labels (resistor, capacitor, etc.)
- Blurry image → Quality score < 6, rejection

### 4.7.2 Unit Tests

**Test Files**:

```
src/services/__tests__/
├── ai-diagram.service.test.ts
└── ai-diagram-mock-responses.ts

appwrite-functions/analyze-diagram/__tests__/
├── main.test.js
└── fixtures/
    ├── cell-diagram.jpg
    └── expected-labels.json
```

**Key Test Cases**:

1. Label detection accuracy
2. Position validation (0-100 range)
3. Confidence filtering
4. Error handling
5. Timeout handling
6. Quality assessment accuracy
7. Quiz question generation
8. JSON parsing robustness

### 4.7.3 Integration Tests

**Test Scenarios**:

1. Upload image → Analyze → Apply labels → Save card
2. Upload low-quality image → Get rejection → Upload better image
3. Analyze diagram → Generate quiz → Take quiz → View results
4. Analyze diagram → Reject all suggestions → Add manual labels
5. Network failure during analysis → Show error → Retry

**Manual Testing Checklist**:

- [ ] AI analysis works on real NEET diagrams
- [ ] Label positions are accurate
- [ ] Quality check catches bad images
- [ ] Quiz questions are relevant and correct
- [ ] UI is responsive during analysis
- [ ] Error messages are clear
- [ ] Works on slow network
- [ ] Works offline (graceful degradation)

---

## 4.8 Performance Optimization

### 4.8.1 Caching Strategy

**Cache AI Results**:

- Store analysis results in `ai_diagram_analysis` collection
- Check cache before calling GROQ API
- Cache TTL: 30 days
- Invalidate on image update

**Implementation**:

```typescript
async function analyzeDiagramWithCache(imageId: string, cardId: string) {
  // Check cache
  const cached = await databases.listDocuments(
    DATABASE_ID,
    'ai_diagram_analysis',
    [
      Query.equal('image_id', imageId),
      Query.equal('analysis_type', 'label_detection'),
      Query.equal('status', 'success'),
      Query.orderDesc('created_at'),
      Query.limit(1)
    ]
  );

  if (cached.documents.length > 0) {
    const cacheAge = Date.now() - new Date(cached.documents[0].created_at).getTime();
    if (cacheAge < 30 * 24 * 60 * 60 * 1000) { // 30 days
      return JSON.parse(cached.documents[0].result_data);
    }
  }

  // Call API and cache result
  const result = await callGroqAPI(...);
  await cacheResult(imageId, cardId, result);
  return result;
}
```

### 4.8.2 Image Optimization

**Reduce API Costs**:

1. Compress images before sending to GROQ
2. Use lower resolution for quality checks
3. Batch multiple operations when possible
4. Implement request debouncing

**Size Limits**:

- Quality check: Max 512x512 (faster, cheaper)
- Label detection: Max 1024x1024 (balance)
- Quiz generation: Use cached labels (no image needed)

### 4.8.3 Loading States

**Progressive Enhancement**:

1. Show immediate feedback on button click
2. Display progress indicator during analysis
3. Stream results as they arrive (if possible)
4. Show partial results while processing

**UI States**:

```typescript
enum AnalysisState {
  IDLE = "idle",
  UPLOADING = "uploading",
  ANALYZING = "analyzing",
  PROCESSING = "processing",
  COMPLETE = "complete",
  ERROR = "error",
}
```
