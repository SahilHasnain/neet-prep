# Flashcard Quiz Modes - Implementation Plan

## Overview

Add three quiz modes for non-diagram flashcards: MCQ, True/False, and Fill-in-the-Blank.

## Quiz Modes

### 1. Multiple Choice (MCQ)

- Show front content as question
- Display 4 options: 1 correct (back content) + 3 AI-generated distractors
- Track wrong answers for mistake patterns

### 2. True/False

- Generate statements from card pairs
- Mix correct and incorrect statements
- Simple binary choice interface

### 3. Fill-in-the-Blank

- Show front content with key terms blanked from back
- User types missing word/phrase
- Fuzzy matching for answer validation

## Implementation Steps

1. Create quiz question generator service (uses AI for distractors)
2. Build unified quiz component for all three modes
3. Add mode selector to deck screen
4. Integrate mistake tracking
5. Update quiz results component

## Technical Notes

- Reuse existing AI function for distractor generation
- Cache generated questions per deck
- Support both diagram and flashcard quizzes from same entry point
