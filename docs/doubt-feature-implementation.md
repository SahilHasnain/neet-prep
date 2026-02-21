# Ask Doubt Feature Implementation

## Overview

The Ask Doubt feature allows students to get instant AI-powered explanations for concepts they don't understand while studying flashcards or taking quizzes.

## Features

### 1. Contextual Doubt Submission

- Floating "Ask Doubt" button on flashcard and quiz screens
- Automatically captures current question/concept as context
- Students can ask specific questions about the content

### 2. AI-Powered Explanations

- Uses GROQ AI (Llama 3.3 70B) for instant explanations
- Provides clear, simple answers in 2-3 sentences
- Includes 2-3 practical examples
- Suggests related concepts to explore

### 3. Doubt History & Tracking

- All doubts stored in database with explanations
- Linked to specific cards and decks
- Can retrieve doubt history per user or per card
- Enables "Others also asked" feature (future enhancement)

### 4. Integration with Insights

- Doubt patterns tracked alongside mistake patterns
- Identifies concepts students struggle with most
- Can trigger targeted remediation recommendations

## Components

### AskDoubtButton

- Floating action button (FAB) positioned bottom-right
- Orange color (#f59e0b) with help icon
- Triggers doubt modal on press

### DoubtModal

- Slide-up modal with two states:
  1. Input state: Text area for doubt submission
  2. Explanation state: Shows AI-generated answer with examples
- Displays context (current flashcard/question)
- Loading state during AI processing
- "Ask Another Doubt" button to reset

## Services

### DoubtService

- `submitDoubt()`: Sends doubt to Appwrite function
- `getUserDoubts()`: Retrieves user's doubt history
- `getCardDoubts()`: Gets doubts for specific card
- Handles API errors and timeouts

## Appwrite Function

### resolve-doubt

- Endpoint: `/resolve-doubt`
- Input: `{ doubt_text, context, user_id, card_id, deck_id }`
- Uses GROQ AI to generate explanations
- Stores doubt and explanation in database
- Returns: `{ answer, examples, related_concepts }`

## Database Schema

### doubts Collection

```
- doubt_id: string (unique)
- user_id: string (indexed)
- card_id: string (optional, indexed)
- deck_id: string (optional)
- doubt_text: string (max 5000 chars)
- context: string (optional, max 5000 chars)
- explanation: string (max 10000 chars)
- examples: JSON string (array)
- related_concepts: JSON string (array)
- created_at: ISO timestamp (indexed)
```

## Setup Instructions

### 1. Database Setup

```bash
npm run setup:doubt
```

### 2. Deploy Appwrite Function

```bash
cd appwrite-functions/resolve-doubt
npm install groq-sdk node-appwrite
# Deploy via Appwrite Console or CLI
```

### 3. Environment Variables

Add to `.env.local`:

```
EXPO_PUBLIC_RESOLVE_DOUBT_FUNCTION_URL=https://your-appwrite-endpoint/functions/resolve-doubt/executions
```

### 4. Test the Feature

- Open any flashcard or quiz
- Tap the orange "?" button
- Submit a doubt and verify AI response

## Future Enhancements

### Phase 1 (Current)

- ✅ Basic doubt submission
- ✅ AI-powered explanations
- ✅ Doubt history storage

### Phase 2 (Planned)

- [ ] "Others also asked" suggestions
- [ ] Doubt search and filtering
- [ ] Upvote/downvote explanations
- [ ] Community-contributed answers

### Phase 3 (Planned)

- [ ] Integration with insights dashboard
- [ ] Doubt-based remediation triggers
- [ ] Teacher/expert review system
- [ ] Doubt analytics and reporting

## Usage Examples

### In Flashcard Study

```typescript
// User sees a complex diagram
// Taps "Ask Doubt" button
// Types: "What's the difference between mitosis and meiosis?"
// Gets instant explanation with examples
```

### In Quiz Mode

```typescript
// User gets MCQ wrong
// Taps "Ask Doubt" button
// Context auto-filled with question
// Types: "Why is option B correct?"
// Gets detailed explanation
```

## Performance Considerations

- Timeout: 45 seconds for AI response
- Caching: Consider caching common doubts
- Rate limiting: Implement if needed
- Offline: Show cached doubts when offline

## Analytics Tracking

Track these metrics:

- Doubts submitted per user
- Most common doubt topics
- Average response time
- User satisfaction (future)
- Doubt resolution rate

## Error Handling

- Network errors: Show retry option
- Timeout: Suggest trying again
- Invalid input: Validate before submission
- API errors: Log and show user-friendly message
