# Diagnostic Questions Caching System

## Overview
AI-generated diagnostic questions are cached in Appwrite for 24 hours to reduce API costs and improve performance.

## How It Works

### 1. Question Generation Flow
```
User starts diagnostic test
  ↓
Check cache for questions < 24h old
  ↓
If found → Use cached questions
  ↓
If not found → Generate new questions via AI
  ↓
Cache new questions in database
  ↓
Serve questions to user
```

### 2. Caching Strategy
- Questions are stored globally (not per-user)
- Cache duration: 24 hours
- All users get the same questions within the 24-hour window
- After 24 hours, new questions are generated

### 3. Benefits
- **Cost Savings**: Reduces Groq API calls by ~99% (1 generation per day vs per user)
- **Performance**: Instant loading from cache vs 10-15 seconds for AI generation
- **Consistency**: All users taking the test on the same day get the same questions
- **Reliability**: Fallback to hardcoded questions if both cache and AI fail

## Database Schema

### Collection: `diagnostic_questions`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| questions | string | Yes | JSON string of question array (max 100KB) |
| created_at | string | Yes | ISO timestamp of when questions were generated |
| question_count | integer | Yes | Number of questions in the set |

### Indexes
- `created_at_index`: DESC index on created_at for efficient querying

### Permissions
- Read: Any
- Create: Any
- Update: Any
- Delete: Any

## Setup

### Manual Setup (Appwrite Console)
1. Go to Appwrite Console → Databases → flashcard_db
2. Create collection: `diagnostic_questions`
3. Add attributes:
   - `questions` (String, 100000 size, required)
   - `created_at` (String, 50 size, required)
   - `question_count` (Integer, required)
4. Create index: `created_at_index` on `created_at` (DESC)
5. Set permissions: Any role for all operations

### Script Setup
```bash
npx ts-node scripts/setup-diagnostic-questions-cache.ts
```

## Service API

### DiagnosticQuestionsService

#### `getQuestions()`
Main method to get diagnostic questions. Checks cache first, generates if needed.

```typescript
const questions = await DiagnosticQuestionsService.getQuestions();
```

#### `cleanupOldQuestions()`
Optional cleanup method to remove questions older than 2 days.

```typescript
await DiagnosticQuestionsService.cleanupOldQuestions();
```

## Implementation Details

### Question Generation
- Uses batched approach (3 batches of 10 questions each)
- One batch per subject (Physics, Chemistry, Biology)
- Mix of difficulties: 40% easy, 40% medium, 20% hard
- Covers diverse NEET topics

### Cache Validation
- Queries for documents with `created_at > (now - 24 hours)`
- Orders by `created_at DESC` to get most recent
- Limits to 1 document

### Error Handling
- If cache read fails → Generate new questions
- If AI generation fails → Use hardcoded fallback questions
- If cache write fails → Log error but continue (non-blocking)

## Monitoring

### Check Cache Status
```typescript
// In Appwrite Console
// Go to diagnostic_questions collection
// Check latest document's created_at timestamp
```

### Force Regeneration
```typescript
// Delete all documents in diagnostic_questions collection
// Next user will trigger fresh generation
```

## Future Enhancements
- Add difficulty-based caching (separate caches for easy/medium/hard tests)
- Implement multiple question sets per day (morning/evening variants)
- Add analytics on question performance
- Automatic cleanup job (scheduled function)
- Version tracking for question sets
