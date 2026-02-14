# Phase 1: Backend Infrastructure & Database Setup Guide

## Overview

This guide walks you through setting up the Appwrite backend infrastructure for the flashcard feature.

## Prerequisites

1. Appwrite account and project created
2. Node.js 18+ installed
3. GROQ API key (get from https://console.groq.com)
4. Appwrite CLI installed (optional, for function deployment)

## Step 1: Install Dependencies

```bash
npm install node-appwrite ts-node --save-dev
```

## Step 2: Configure Environment Variables

Your `.env.local` file should already have:

```env
EXPO_PUBLIC_APPWRITE_PROJECT_ID=69907afc003b9e3d9152
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_API_KEY=your_api_key_here
```

Add GROQ API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

## Step 3: Run Database Setup Script

Execute the setup script to create database and collections:

```bash
npx ts-node scripts/setup-appwrite-database.ts
```

This will create:

- Database: `flashcard_db`
- Collections: `flashcard_decks`, `flashcards`, `user_progress`, `ai_generation_logs`
- All necessary attributes and indexes
- Proper permissions

## Step 4: Deploy Appwrite Function

### Option A: Using Appwrite Console (Recommended)

1. Go to your Appwrite Console
2. Navigate to Functions
3. Click "Create Function"
4. Configure:
   - Name: `generate-flashcards`
   - Runtime: `Node.js 18`
   - Entry point: `src/main.js`
5. Upload the contents of `appwrite-functions/generate-flashcards/`
6. Set environment variables in the function settings:
   - `GROQ_API_KEY`
   - `APPWRITE_ENDPOINT`
   - `APPWRITE_PROJECT_ID`
   - `APPWRITE_API_KEY`
7. Deploy the function

### Option B: Using Appwrite CLI

```bash
cd appwrite-functions/generate-flashcards
npm install
appwrite deploy function
```

## Step 5: Verify Setup

### Check Database

1. Open Appwrite Console
2. Go to Databases
3. Verify `flashcard_db` exists with 4 collections

### Test Function

Use the Appwrite Console to test the function with this payload:

```json
{
  "topic": "JavaScript Basics",
  "count": 5,
  "difficulty": "easy",
  "language": "en",
  "userId": "test-user-123"
}
```

## Troubleshooting

### Database Creation Fails

- Verify API key has proper permissions
- Check if database already exists
- Ensure endpoint URL is correct

### Function Deployment Fails

- Check GROQ API key is valid
- Verify all environment variables are set
- Check function logs in Appwrite Console

### Permission Errors

- Ensure user authentication is set up
- Verify collection permissions are correct
- Check API key has database access

## Next Steps

Once Phase 1 is complete:

- ✅ Database and collections created
- ✅ Appwrite function deployed
- ✅ Environment variables configured
- ✅ Types and configuration files in place

Proceed to Phase 2: Testing and refining the AI integration.
