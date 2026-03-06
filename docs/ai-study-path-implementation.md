# AI-Powered Study Path Implementation

## Overview

The study path generation has been upgraded from a rule-based algorithm to an AI-powered system that creates truly personalized learning paths for NEET students.

## What Changed

### Before (Rule-Based)
- Used hardcoded prerequisite chains
- Simple topological sort of weak topics
- No consideration of learning patterns or student context
- Fixed sequence for all students with same weak topics

### After (AI-Powered)
- Dynamic path generation using Groq AI (Llama 3.3 70B)
- Considers multiple factors:
  - Student's performance across subjects
  - NEET exam weightage of topics
  - Prerequisite dependencies
  - Difficulty progression
  - Subject balancing to avoid burnout
  - Individual learning gaps

## How It Works

### 1. Diagnostic Analysis
```typescript
// Student takes diagnostic test
// System identifies:
- Overall score: 65%
- Physics: 45% (weak)
- Chemistry: 70% (moderate)
- Biology: 80% (strong)
- Weak topics: ['phy_014', 'chem_006', 'bio_005']
- Strong topics: ['bio_013', 'chem_001']
```

### 2. AI Path Generation
```typescript
StudyPathAIService.generatePersonalizedStudyPath(
  weakTopics,
  strongTopics,
  totalScore,
  physicsScore,
  chemistryScore,
  biologyScore,
  availableTopics // Full knowledge graph
)
```

### 3. AI Decision Making

The AI analyzes:
- **Performance Gaps**: Prioritizes subjects with lowest scores
- **NEET Weightage**: Focuses on high-weightage topics first
- **Prerequisites**: Ensures foundational topics come before advanced
- **Difficulty Curve**: Gradual progression from easy to hard
- **Subject Mix**: Alternates subjects to maintain engagement
- **Scope**: Limits to 8-15 topics for manageable completion

### 4. Output Structure
```json
{
  "topicSequence": [
    "phy_001",  // Foundation: Units & Measurements
    "phy_011",  // Foundation: Electrostatics
    "phy_012",  // Intermediate: Current Electricity
    "chem_005", // Intermediate: Thermodynamics
    "phy_013",  // Intermediate: Magnetism
    "bio_005",  // Intermediate: Genetics
    "phy_014"   // Advanced: Electromagnetic Induction
  ],
  "reasoning": "Path focuses on Physics fundamentals first due to low score (45%). Includes high-weightage topics like Electromagnetism and Genetics. Alternates subjects to prevent burnout.",
  "estimatedCompletionWeeks": 10,
  "priorityLevel": {
    "phy_014": "high",
    "bio_005": "high",
    "chem_005": "medium",
    "phy_001": "medium"
  }
}
```

## Database Schema Updates

### Study Paths Collection
```typescript
{
  // Existing fields...
  ai_reasoning: string,      // AI's explanation for the path
  estimated_weeks: number    // AI-estimated completion time
}
```

### Topic Progress Collection
```typescript
{
  // Existing fields...
  priority: 'high' | 'medium' | 'low'  // AI-assigned priority
}
```

## Setup Instructions

### 1. Add Database Fields
```bash
npx ts-node scripts/add-ai-study-path-fields.ts
```

This adds:
- `ai_reasoning` (string) to Study Paths
- `estimated_weeks` (integer) to Study Paths
- `priority` (enum) to Topic Progress

### 2. Environment Variables
Ensure `.env.local` has:
```env
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

### 3. Test the Feature
1. Navigate to `/diagnostic`
2. Complete the diagnostic test
3. View results with AI analysis
4. Click "Generate AI-Powered Study Path"
5. View personalized path at `/study-path`

## Benefits

### For Students
- **Truly Personalized**: No two students get the same path
- **Adaptive**: Considers individual strengths and weaknesses
- **Efficient**: Focuses on high-impact topics first
- **Motivating**: Clear reasoning and estimated timeline
- **Balanced**: Prevents subject fatigue

### For Learning Outcomes
- **Better Retention**: Proper prerequisite sequencing
- **Higher Scores**: Focus on NEET-weighted topics
- **Faster Progress**: Optimal difficulty progression
- **Reduced Dropout**: Manageable scope (8-15 topics)

## AI Prompt Engineering

The AI prompt includes:
- Student performance data (scores, weak/strong topics)
- Complete knowledge graph with prerequisites
- NEET exam context and weightage
- Specific constraints (sequence length, difficulty progression)
- Output format requirements (JSON schema)

## Error Handling

If AI generation fails:
- System logs the error
- Shows user-friendly error message
- User can retry generation
- Fallback: Could implement rule-based backup (optional)

## Future Enhancements

1. **Adaptive Replanning**: Regenerate path based on progress
2. **Learning Style**: Consider visual/auditory/kinesthetic preferences
3. **Time Constraints**: Adjust for exam date proximity
4. **Peer Comparison**: Show how path compares to successful students
5. **Topic Recommendations**: AI suggests additional topics mid-journey

## Performance Considerations

- AI call takes 2-5 seconds
- Cached in database (no repeated calls)
- Async operation with loading state
- Graceful error handling

## Monitoring

Track:
- AI generation success rate
- Average generation time
- Path completion rates
- Student satisfaction scores
- Topic mastery improvements

## Code Files Modified

1. `src/services/study-path-ai.service.ts` - Added `generatePersonalizedStudyPath()`
2. `src/services/study-path.service.ts` - Updated `generateStudyPath()` to use AI
3. `app/diagnostic/results.tsx` - Updated to pass all scores to AI
4. `src/types/study-path.types.ts` - Added AI-related fields
5. `scripts/add-ai-study-path-fields.ts` - Database migration script

## Testing Checklist

- [ ] Diagnostic test completes successfully
- [ ] AI analysis shows on results screen
- [ ] Study path generation works with loading state
- [ ] Generated path respects prerequisites
- [ ] Path includes 8-15 topics
- [ ] Priority levels are assigned
- [ ] AI reasoning is displayed
- [ ] Estimated weeks is calculated
- [ ] First topic is unlocked, rest locked
- [ ] Path displays correctly on study path screen

## Conclusion

The AI-powered study path transforms NeuroPrep from a static learning platform into an intelligent, adaptive tutor that creates unique learning journeys for each NEET aspirant.
