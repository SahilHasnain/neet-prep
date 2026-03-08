# AI Video Curation Implementation

## Summary
Fully automated video curation system using YouTube Data API v3 + Groq AI (Llama 70B).

## What Was Built

### 1. Core Services
- **`admin/lib/groq.ts`** - Groq AI integration
  - `analyzeVideoForEducation()` - Scores videos 0-100
  - `generateSearchQueries()` - Creates optimal search terms
  - `generateVideoDescription()` - Creates student-friendly descriptions

- **`admin/lib/youtube-api.ts`** - YouTube Data API v3 integration
  - `searchVideos()` - Searches YouTube with filters
  - Duration parsing (ISO 8601 → MM:SS)

### 2. API Endpoint
- **`admin/app/api/ai-curate/route.ts`** - Main curation logic
  - POST `/api/ai-curate` with `{ topicId }`
  - Returns curated videos + stats

### 3. UI Updates
- **`admin/app/videos/page.tsx`** - Added AI curation button
  - "✨ AI Auto-Curate" button per topic
  - Loading state with spinner
  - Success message with stats

## How It Works

```
User clicks "AI Auto-Curate" for a topic
         ↓
AI generates 3 search queries (e.g., "NEET Physics Kinematics PW")
         ↓
YouTube API fetches 60 videos (3 queries × 20 results)
         ↓
AI analyzes each video:
  - Educational quality score (0-100)
  - Difficulty level (beginner/intermediate/advanced)
  - Educational vs entertainment check
         ↓
Filter: Keep only score ≥ 60 & isEducational = true
         ↓
Sort by score, select top 5
         ↓
AI generates concise descriptions
         ↓
Save to database with auto-generated video_id
         ↓
Show success: "AI curated and added 5 videos for Kinematics"
```

## AI Evaluation Criteria

Groq AI (Llama 70B) evaluates:
1. Is it genuinely educational (not entertainment)?
2. Is content relevant for NEET exam prep?
3. Is the channel credible (Physics Wallah, Vedantu, etc.)?
4. Is video length appropriate (4-20 minutes)?
5. Does it cover concepts clearly?

## Setup Required

Add to `admin/.env.local`:
```env
YOUTUBE_API_KEY=your_key
GROQ_API_KEY=your_key
```

See `admin/AI_CURATION_SETUP.md` for detailed setup instructions.

## Dependencies Added
- `groq-sdk` - Groq AI client
- `googleapis` - YouTube Data API v3 client

## Cost
- **YouTube API**: Free tier (10,000 units/day)
- **Groq AI**: Free tier (30 req/min, unlimited)
- **Per curation**: ~60 YouTube units + ~25 Groq requests
- **Result**: Completely FREE within quotas

## User Experience

**Before**: Admin manually searches YouTube, copies URLs, fills forms
**After**: Admin clicks one button, AI does everything in 30 seconds

## Example Output

```json
{
  "success": true,
  "message": "AI curated and added 5 videos for Kinematics",
  "videos": [...],
  "searchQueries": [
    "NEET Physics Kinematics complete chapter",
    "Kinematics Physics Wallah NEET 2024",
    "Motion in straight line NEET preparation"
  ],
  "stats": {
    "totalSearched": 58,
    "analyzed": 58,
    "selected": 5,
    "saved": 5
  }
}
```

## Future Enhancements
- Batch curate all topics
- Schedule automatic weekly updates
- AI duplicate detection
- Quality monitoring dashboard
