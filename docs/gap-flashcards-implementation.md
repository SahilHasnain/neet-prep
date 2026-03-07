# Gap-Triggered Flashcards Implementation Plan

## Feature Overview
Auto-generate targeted flashcards when students struggle with topics, focusing on weak prerequisite sub-concepts identified by gap detection. Provides a lighter, faster alternative to full micro-interventions.

## Unique Value
- **Performance-triggered**: Auto-generated when quiz score < 60% or mastery < 50%
- **Sub-concept precision**: Targets specific weak areas (e.g., "vector resolution" within "Kinematics")
- **Seamless integration**: Works with existing gap detection, micro-interventions, and study path
- **NEET-optimized**: Hinglish/English support, exam-focused content
- **Progressive unlocking**: Cards unlock as students progress through topics

---

## Phase 1: Database & AI Service

### 1.1 Database Collections
Create script `scripts/setup-flashcard-feature.ts`:

**gap_flashcard_decks**
- `deck_id` (string, unique)
- `user_id` (string, indexed)
- `topic_id` (string, indexed)
- `gap_id` (string) - Links to `TopicProgress.conceptual_gaps`
- `prerequisite_id` (string)
- `prerequisite_name` (string)
- `sub_concepts` (string[]) - Weak sub-concepts targeted
- `language` ('english' | 'hinglish')
- `card_count` (number)
- `cards_mastered` (number)
- `created_at` (datetime)
- `last_reviewed` (datetime)

**gap_flashcards**
- `card_id` (string, unique)
- `deck_id` (string, indexed)
- `front` (string, 500 chars) - Question/concept
- `back` (string, 1000 chars) - Answer/explanation
- `order` (number)
- `mastery_level` (0-100)
- `review_count` (number)
- `last_reviewed` (datetime)
- `next_review` (datetime)
- `created_at` (datetime)

Permissions: User-level read/write

### 1.2 Flashcard Service
Create `src/services/gap-flashcard.service.ts`:

```typescript
class GapFlashcardService {
  // Generate flashcards for detected gap
  static async generateGapFlashcards(
    userId: string,
    topicId: string,
    gap: ConceptualGap,
    language: Language
  ): Promise<{ deckId: string; cards: FlashCard[] }>

  // Get existing deck for gap (or null)
  static async getDeckForGap(
    userId: string,
    gapId: string
  ): Promise<FlashCardDeck | null>

  // Record card review (easy/medium/hard)
  static async recordCardReview(
    cardId: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<void>

  // Get cards due for review
  static async getCardsForReview(
    deckId: string
  ): Promise<FlashCard[]>

  // Calculate next review date (spaced repetition)
  private static calculateNextReview(
    difficulty: 'easy' | 'medium' | 'hard',
    reviewCount: number
  ): Date
}
```

### 1.3 AI Generation Service
Extend `src/services/study-path-ai.service.ts`:

```typescript
static async generateGapFlashcards(
  prerequisiteName: string,
  subConcepts: string[],
  language: Language
): Promise<Array<{ front: string; back: string }>>
```

Prompt strategy:
- Generate 5-8 cards per gap
- Focus on weak sub-concepts
- NEET exam style (MCQ concepts, formula applications)
- Hinglish support with code-switching
- Include common mistakes and tricks

**Deliverable**: Database + service layer with AI generation

---

## Phase 2: UI Components & Gap Integration

### 2.1 Flashcard Review Component
Create `src/components/study-path/FlashcardReview.tsx`:

Features:
- Animated card flip (tap to reveal)
- Swipe gestures (left=hard, right=easy, up=medium)
- Progress bar (X/Y cards completed)
- Difficulty buttons (Easy/Medium/Hard)
- Auto-advance after rating
- Minimal UI (focus on content)

### 2.2 Flashcard Modal
Create `src/components/study-path/GapFlashcardModal.tsx`:

Layout:
- Header: Gap context ("Weak in: Vector Resolution")
- Body: FlashcardReview component
- Footer: Progress + Exit button
- Loading state during AI generation
- Success message on completion

### 2.3 Gap Detection Integration
Modify `app/study-path/topic/[topicId].tsx`:

Update `handleQuizComplete()` alert:
```typescript
Alert.alert(
  'Knowledge Gaps Detected',
  result.explanation,
  [
    { text: 'Quick Flashcards (2 min)', onPress: () => handleFlashcards(gap) },
    { text: 'Full Explanation (5 min)', onPress: () => handleMicroIntervention(gap) },
    { text: 'Review Later', style: 'cancel' }
  ]
);
```

Add flashcard handler:
```typescript
const handleFlashcards = async (gap: ConceptualGap) => {
  setShowFlashcards(true);
  // Check for existing deck or generate new
  // Open GapFlashcardModal
}
```

### 2.4 Topic Header Enhancement
Modify `src/components/study-path/TopicHeader.tsx`:

Add "Review Flashcards" button when:
- Gap flashcard decks exist for this topic
- Cards are due for review

**Deliverable**: Working flashcard UI integrated with gap detection

---

## Phase 3: Spaced Repetition & Polish

### 3.1 Spaced Repetition Algorithm
Implement in `gap-flashcard.service.ts`:

```typescript
private static calculateNextReview(
  difficulty: 'easy' | 'medium' | 'hard',
  reviewCount: number
): Date {
  const intervals = {
    easy: [1, 3, 7, 14, 30],    // days
    medium: [1, 2, 5, 10, 21],
    hard: [1, 1, 3, 7, 14]
  };
  
  const dayIndex = Math.min(reviewCount, intervals[difficulty].length - 1);
  const daysToAdd = intervals[difficulty][dayIndex];
  
  return new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
}
```

Update mastery:
- Easy: +20 mastery
- Medium: +10 mastery
- Hard: +5 mastery
- Cap at 100

### 3.2 Review Dashboard
Add to `TopicHeader.tsx`:

Show badge when cards due:
- "3 cards due" indicator
- Tap to open review modal
- Only show for topics with gaps

### 3.3 Gap Resolution Integration
Update `src/services/gap-detection.service.ts`:

Mark gap as resolved when:
- All cards in deck have mastery >= 70%
- Average mastery across deck >= 75%

### 3.4 Language Preference
Add to user settings or detect from AI notes preference:
- Store in `TopicProgress` or user profile
- Default to English, allow toggle

### 3.5 Analytics
Track in existing collections:
- Cards generated per gap
- Review completion rate
- Average mastery improvement
- Time spent on flashcards

**Deliverable**: Complete gap-triggered flashcard system with spaced repetition

---

## Technical Implementation Notes

### Database Setup
```bash
npx ts-node scripts/setup-flashcard-feature.ts
```

### AI Prompt Template
```
Generate 5-8 NEET-focused flashcards for the prerequisite topic "${prerequisiteName}".

Focus on these weak sub-concepts: ${subConcepts.join(', ')}

Language: ${language === 'hinglish' ? 'Hinglish (mix Hindi and English naturally)' : 'English'}

Format each card as:
FRONT: [Concise question or concept prompt]
BACK: [Clear explanation with example, common mistakes, NEET tips]

Make cards:
- Exam-focused (NEET patterns)
- Progressive difficulty
- Include formulas/diagrams where needed
- Highlight common mistakes
```

### Integration Points
- Links to `TopicProgress.conceptual_gaps` via `gap_id`
- Uses existing GROQ API (llama-3.3-70b)
- Reuses theme config from `src/config/theme.config.ts`
- Follows same modal pattern as AINotesModal and MicroInterventionModal

### Performance Considerations
- Cache generated decks (don't regenerate)
- Lazy load cards (paginate if > 10)
- Preload next card during review
- Debounce difficulty button taps

### Future Enhancements (Post-MVP)
- Bulk generate flashcards for all unlocked topics
- Export deck as PDF
- Share decks with other users
- Custom card creation
- Image-based flashcards (diagrams)
