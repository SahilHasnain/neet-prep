# AI Video Curation Setup Guide

## Overview
Automated video curation using YouTube Data API v3 + Groq AI (Llama 70B).

## Features
- **AI-Powered Search**: AI generates optimal YouTube search queries for each topic
- **Smart Analysis**: AI evaluates educational quality, difficulty level, and relevance
- **Auto-Selection**: AI picks top 3-5 videos based on quality scores (60+ rating)
- **Auto-Metadata**: AI generates student-friendly descriptions
- **One-Click**: Admin just clicks "AI Auto-Curate" button per topic

## Setup Instructions

### 1. Get YouTube Data API v3 Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key

**Free Quota**: 10,000 units/day (enough for ~100 searches)

### 2. Get Groq API Key

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up (free)
3. Go to API Keys → Create API Key
4. Copy the key

**Free Tier**: 30 requests/minute, unlimited usage

### 3. Configure Environment Variables

Add to `admin/.env.local`:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Restart Dev Server

```bash
cd admin
npm run dev
```

## How to Use

1. Go to `/videos` page in admin panel
2. Find the topic you want to curate videos for
3. Click **"✨ AI Auto-Curate"** button
4. Wait 30-60 seconds while AI:
   - Generates search queries
   - Searches YouTube
   - Analyzes videos with AI
   - Selects best 3-5 videos
   - Saves to database
5. Done! Videos appear in the list

## AI Evaluation Criteria

The AI scores videos (0-100) based on:
- Educational value (not entertainment)
- NEET exam relevance
- Channel credibility (Physics Wallah, Vedantu, etc.)
- Appropriate video length (4-20 minutes)
- Clear teaching style
- Concept coverage

Only videos scoring 60+ are selected.

## Cost Estimate

**Per Topic Curation:**
- YouTube API: ~60 units (3 searches × 20 results)
- Groq AI: ~25 requests (20 analyses + 5 descriptions)
- Total: FREE (within free tiers)

**Daily Capacity:**
- YouTube: ~150 topic curations
- Groq: ~1,200 topic curations
- Bottleneck: YouTube API

## Troubleshooting

**"YouTube API error"**
- Check API key is correct
- Verify YouTube Data API v3 is enabled
- Check quota hasn't exceeded

**"Groq API error"**
- Check API key is correct
- Verify rate limit (30 req/min)
- Try again in a minute

**"No videos found"**
- Topic might be too specific
- Try manually adding one video first
- Check search queries in result message

## Architecture

```
Admin clicks button
    ↓
AI generates 3 search queries (Groq)
    ↓
YouTube API searches (3 × 20 = 60 videos)
    ↓
AI analyzes each video (Groq)
    ↓
Filter: score ≥ 60, isEducational = true
    ↓
Sort by score, take top 5
    ↓
AI generates descriptions (Groq)
    ↓
Save to Appwrite database
    ↓
Show success message
```

## Future Enhancements

- Batch curate all topics at once
- Schedule automatic weekly curation
- AI-powered duplicate detection
- Video quality monitoring
- Student feedback integration
