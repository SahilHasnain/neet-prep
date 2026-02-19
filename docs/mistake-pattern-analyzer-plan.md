# Mistake Pattern Analyzer - Implementation Plan

## Overview

Track quiz mistakes to identify conceptual gaps and generate personalized remediation content using AI.

## Database Schema Updates

### New Collection: `mistake_patterns`

- `userId` (string, indexed)
- `subject` (string: physics/chemistry/biology)
- `topic` (string)
- `conceptId` (string) - specific concept/subtopic
- `mistakeCount` (number)
- `lastOccurrence` (datetime)
- `relatedQuestions` (array of question IDs)

### Update Collection: `quiz_attempts`

Add fields:

- `wrongAnswers` (array of objects: `{ questionId, userAnswer, correctAnswer, conceptId }`)

## Core Features

### 1. Mistake Tracking (Phase 1)

- Capture wrong answers during quiz attempts
- Tag each question with conceptId (physics.mechanics.friction, chemistry.organic.reactions, etc.)
- Aggregate mistakes by concept over time
- Store in `mistake_patterns` collection

### 2. Pattern Analysis (Phase 2)

- Identify top 3-5 weak concepts per subject
- Calculate mistake frequency and recency
- Generate "Weak Areas" dashboard showing:
  - Concept name
  - Mistake count
  - Last mistake date
  - Improvement trend

### 3. AI Remediation (Phase 3)

- For each weak concept, generate:
  - Brief explanation (2-3 sentences)
  - 3 targeted practice questions
  - Common misconception clarification
- Use existing AI service with new prompt template
- Cache generated content to reduce API calls

## UI Components

### New Screen: `app/insights/index.tsx`

- Weak areas list with visual indicators
- Subject filter tabs
- "Practice This" button per concept
- Progress tracking over time

### New Component: `src/components/insights/WeakConceptCard.tsx`

- Displays concept, mistake count, trend
- Opens remediation modal

### New Component: `src/components/insights/RemediationModal.tsx`

- Shows AI-generated explanation
- Practice questions interface
- Mark as "Improved" action

## Implementation Steps

1. ✅ Update database schema (run migration script)
2. ✅ Modify quiz flow to capture mistake metadata
3. ✅ Create mistake aggregation service
4. ✅ Build insights screen UI
5. ✅ Integrate AI remediation generation
6. ✅ Add navigation from home screen

## Phase 1 Status: COMPLETE

### Completed Items:

- Created `mistake_patterns` and `quiz_attempts` collections
- Added TypeScript types for mistake tracking
- Built `MistakeTrackingService` with pattern aggregation
- Integrated mistake logging into quiz flow
- Created concept mapper utility for NEET subjects
- Added React hooks for data access

## Phase 2 Status: COMPLETE

### Completed Items:

- Created insights screen (`app/insights/index.tsx`)
- Built `WeakConceptCard` component with visual indicators
- Added subject filtering (All, Biology, Physics, Chemistry)
- Implemented mistake frequency and recency display
- Added summary statistics dashboard
- Integrated navigation from home screen
- Color-coded subjects and severity levels

### Features:

- Top 5 weak concepts highlighted with rank badges
- Mistake count, last error date, and related questions count
- Subject-specific color coding (Biology: green, Physics: blue, Chemistry: orange)
- Severity levels (High/Medium/Low) based on mistake count
- Compact view for additional concepts
- Empty state for users with no quiz attempts yet

## Phase 3 Status: COMPLETE

### Completed Items:

- Created `RemediationService` with AI integration and caching
- Built `RemediationModal` component with interactive practice questions
- Integrated remediation modal into insights screen
- Added 7-day content caching to reduce API calls
- Implemented fallback mock content for offline/error scenarios

### Features:

- AI-generated explanations for weak concepts
- 3 interactive practice questions per concept
- Common misconception clarification
- Real-time answer checking with feedback
- Subject-specific color theming
- Smooth modal animations
- "Mark as Reviewed" action

### Implementation Complete!

All three phases of the Mistake Pattern Analyzer feature are now complete. Users can:

1. Take quizzes and have mistakes automatically tracked
2. View their weak areas in the insights dashboard
3. Get personalized AI-powered remediation content with practice questions

## Technical Notes

- Reuse existing AI service infrastructure
- Leverage Appwrite functions for pattern analysis
- Keep AI prompts focused and token-efficient
- Cache remediation content for 7 days
