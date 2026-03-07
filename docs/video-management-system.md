# Video Management System Implementation

## Overview
Migrated hardcoded video lessons to Appwrite database with Next.js admin panel.

## Structure

```
neet-prep/
├── shared/                    # Shared code between mobile & admin
│   ├── types/
│   │   └── video.types.ts    # Video interfaces
│   └── config/
│       └── appwrite.config.ts # Shared Appwrite config
├── admin/                     # Next.js 16 admin panel
│   ├── app/
│   │   ├── api/videos/       # REST API routes
│   │   ├── videos/           # Video management UI
│   │   └── globals.css       # Tailwind v4 config
│   └── lib/
│       ├── appwrite.ts       # Appwrite client
│       └── video.service.ts  # Video CRUD service
├── src/                       # Mobile app (Expo)
│   ├── services/
│   │   └── video-lessons.service.ts  # Mobile video service
│   └── components/
│       └── study-path/
│           └── VideoLessons.tsx      # Updated to use DB
└── scripts/
    ├── setup-video-lessons.ts        # Create collection
    └── migrate-videos-to-db.ts       # Migrate existing data
```

## Database Schema

**Collection:** `video_lessons`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| video_id | string | ✓ | Unique video identifier |
| topic_id | string | ✓ | Associated topic |
| title | string | ✓ | Video title |
| channel | string | ✓ | YouTube channel |
| youtube_id | string | ✓ | YouTube video ID |
| duration | string | ✓ | Video duration (HH:MM:SS) |
| description | string | | Video description |
| difficulty | enum | ✓ | beginner/intermediate/advanced |
| language | enum | ✓ | english/hindi/both |
| is_active | boolean | ✓ | Active status |
| order_index | integer | ✓ | Display order |
| created_at | datetime | ✓ | Creation timestamp |
| updated_at | datetime | ✓ | Update timestamp |

## Setup Instructions

### 1. Create Database Collection
```bash
npx ts-node scripts/setup-video-lessons.ts
```

### 2. Migrate Existing Videos
```bash
npx ts-node scripts/migrate-videos-to-db.ts
```

### 3. Setup Admin Panel
```bash
cd admin
npm install
cp .env.local.example .env.local
# Edit .env.local with your Appwrite credentials
npm run dev
```

### 4. Update Mobile App
The mobile app (`src/components/study-path/VideoLessons.tsx`) now automatically fetches from database.

## Admin Panel Features

- **Dashboard:** Overview stats (total videos, active, topics covered)
- **Search:** Filter by title, topic, or channel
- **CRUD Operations:** Create, read, update, delete videos
- **Toggle Status:** Activate/deactivate videos
- **Grouped View:** Videos organized by topic
- **Form Validation:** Required fields and proper types

## API Endpoints

### GET /api/videos
Fetch all videos or filter by topic
```typescript
// All videos
GET /api/videos

// By topic
GET /api/videos?topicId=phy_001
```

### POST /api/videos
Create new video
```typescript
POST /api/videos
Body: CreateVideoInput
```

### PATCH /api/videos/[id]
Update video
```typescript
PATCH /api/videos/abc123
Body: Partial<VideoLesson>
```

### DELETE /api/videos/[id]
Delete video
```typescript
DELETE /api/videos/abc123
```

## Mobile App Changes

**Before:**
```typescript
import { getVideosForTopic } from '@/src/config/video-lessons.config';
const videos = getVideosForTopic(topicId);
```

**After:**
```typescript
import { videoLessonsService } from '@/src/services/video-lessons.service';
const videos = await videoLessonsService.getVideosByTopic(topicId);
```

## Benefits

✅ **No Redeployment:** Update videos without app updates
✅ **Centralized Management:** Single source of truth
✅ **Easy Scaling:** Add unlimited videos
✅ **Better UX:** Admin panel for non-developers
✅ **Analytics Ready:** Track video views/completion
✅ **Version Control:** Audit trail with timestamps

## Next Steps

1. Add authentication to admin panel
2. Implement video analytics
3. Add bulk import from CSV
4. YouTube API integration for auto-discovery
5. User ratings and feedback
6. Video recommendations based on progress

## Deployment

### Admin Panel (Vercel)
```bash
cd admin
vercel
```

### Mobile App
No changes needed - uses existing Appwrite connection

## Tech Stack

- **Mobile:** React Native (Expo), react-native-appwrite
- **Admin:** Next.js 16, Tailwind CSS v4, node-appwrite
- **Database:** Appwrite Cloud
- **Shared:** TypeScript, shared types
