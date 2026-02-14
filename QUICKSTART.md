# Quick Start Guide - Phase 1

Get your flashcard backend up and running in 5 steps!

## Step 1: Install Dependencies (2 min)

```bash
npm install
```

## Step 2: Get GROQ API Key (3 min)

1. Go to https://console.groq.com
2. Sign up/login
3. Create API key
4. Copy the key

## Step 3: Configure Environment (1 min)

Edit `.env.local` and add your GROQ key:

```env
GROQ_API_KEY=gsk_your_actual_key_here
```

## Step 4: Setup Database (2 min)

```bash
npm run setup:database
```

You should see:

```
✅ Database created successfully
✅ flashcard_decks collection created
✅ flashcards collection created
✅ user_progress collection created
✅ ai_generation_logs collection created
✨ Database setup completed successfully!
```

## Step 5: Deploy Function (5 min)

### Using Appwrite Console:

1. Open https://cloud.appwrite.io
2. Go to your project → Functions
3. Click "Create Function"
4. Fill in:
   - **Name**: `generate-flashcards`
   - **Runtime**: Node.js 18
   - **Entry point**: `src/main.js`
5. Upload folder: `appwrite-functions/generate-flashcards/`
6. Add environment variables:
   ```
   GROQ_API_KEY=your_key
   APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=69907afc003b9e3d9152
   APPWRITE_API_KEY=your_appwrite_key
   ```
7. Click "Deploy"

## Test It! (1 min)

In Appwrite Console → Functions → generate-flashcards → Execute:

```json
{
  "topic": "React Hooks",
  "count": 5,
  "difficulty": "medium",
  "language": "en",
  "userId": "test-123"
}
```

Expected: 5 flashcards about React Hooks! 🎉

## What's Next?

- ✅ Phase 1 Complete!
- ⏭️ Phase 2: Refine AI prompts and test edge cases
- ⏭️ Phase 3: Build the frontend UI

## Need Help?

Check these docs:

- [Detailed Setup Guide](docs/phase1-setup-guide.md)
- [Database Schema](docs/database-schema.md)
- [Function Documentation](appwrite-functions/generate-flashcards/README.md)
- [Complete Checklist](docs/phase1-checklist.md)

## Common Issues

**"Database already exists"** → Normal if re-running, script skips existing items

**"Invalid API key"** → Check your `.env.local` file has correct keys

**"GROQ API error"** → Verify GROQ key is valid and has credits

---

Total time: ~15 minutes ⚡
