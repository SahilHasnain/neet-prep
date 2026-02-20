# Spaced Repetition System Plan

## Overview

Implement SM-2 algorithm for intelligent flashcard scheduling based on individual performance and forgetting curves.

## Database Changes

### New Collection: `card_reviews`

```
- cardId (string, required)
- userId (string, required)
- easeFactor (float, default: 2.5)
- interval (int, default: 0) // days until next review
- repetitions (int, default: 0)
- nextReviewDate (datetime, required)
- lastReviewDate (datetime)
```

### Update `flashcards` Collection

```
- Add: dueCount (int, default: 0)
- Add: reviewStatus (enum: new, learning, review, mastered)
```

## Core Algorithm (SM-2)

**Quality Rating (0-5):**

- 0-1: Complete blackout → Reset card
- 2: Incorrect but remembered → Repeat soon
- 3: Correct with difficulty → Short interval
- 4: Correct with hesitation → Medium interval
- 5: Perfect recall → Long interval

**Interval Calculation:**

```
If quality < 3: interval = 1 day, repetitions = 0
If repetitions = 0: interval = 1 day
If repetitions = 1: interval = 6 days
If repetitions > 1: interval = previous_interval × easeFactor

easeFactor = easeFactor + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))
Minimum easeFactor: 1.3
```

## Implementation

### 1. New Service: `src/services/spaced-repetition.service.ts`

- `calculateNextReview(cardId, quality)` - SM-2 logic
- `getDueCards(userId, deckId?)` - Fetch cards due today
- `recordReview(cardId, quality, timeSpent)` - Save review result
- `getReviewStats(userId)` - Daily/weekly stats

### 2. New Hook: `src/hooks/useSpacedRepetition.ts`

- Manage review sessions
- Track quality ratings
- Update card schedules

### 3. UI Components

**`src/components/flashcard/ReviewSession.tsx`**

- Show due count badge
- Quality rating buttons (Again, Hard, Good, Easy)
- Progress indicator for session

**`src/components/flashcard/ReviewCalendar.tsx`**

- Heatmap of review activity
- Upcoming reviews forecast
- Streak counter

### 4. Update Existing Screens

**Home Screen (`app/index.tsx`)**

- Add "Due for Review" section at top
- Show total due count across all decks

**Deck Screen (`app/deck/[deckId].tsx`)**

- Replace "Study" button with "Review (X due)"
- Add "Review All Due Cards" option

**Study Mode (`app/study/[deckId].tsx`)**

- Add quality rating after revealing answer
- Show next review date after rating

## User Experience

### Daily Workflow

1. Open app → See "24 cards due for review"
2. Tap "Start Review" → Cards sorted by priority
3. After each card: Rate difficulty (4 buttons)
4. Session complete → Show stats & tomorrow's forecast

### Visual Feedback

- Green badge: Cards due today
- Yellow badge: Cards due soon (next 3 days)
- Streak counter: Days of consistent reviews
- Progress ring: Today's review completion

## Migration Strategy

1. Run script to initialize `card_reviews` for existing flashcards
2. Set all existing cards to `nextReviewDate = today`
3. Default `easeFactor = 2.5`, `interval = 1`

## Success Metrics

- Retention rate improvement (track quiz scores over time)
- Daily active users (review engagement)
- Average ease factor per deck (difficulty indicator)
- Review completion rate

## Files to Create

- `src/services/spaced-repetition.service.ts`
- `src/hooks/useSpacedRepetition.ts`
- `src/components/flashcard/ReviewSession.tsx`
- `src/components/flashcard/ReviewCalendar.tsx`
- `scripts/setup-spaced-repetition.ts`

## Files to Modify

- `app/index.tsx` - Add due cards section
- `app/deck/[deckId].tsx` - Update study button
- `app/study/[deckId].tsx` - Add quality ratings
- `src/types/flashcard.types.ts` - Add review types
