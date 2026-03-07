# NEET Prep Admin Panel

Next.js 16 admin panel for managing NEET Prep app content.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Copy `.env.local.example` to `.env.local` and fill in your Appwrite credentials:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
```

3. **Setup database:**
Run the setup script from the root directory:
```bash
cd ..
npx ts-node scripts/setup-video-lessons.ts
npx ts-node scripts/migrate-videos-to-db.ts
```

4. **Run development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- ✅ Video CRUD operations
- ✅ Search and filter videos
- ✅ Group by topics
- ✅ Toggle active/inactive status
- ✅ Dark theme with Tailwind v4

## Tech Stack

- Next.js 16
- Tailwind CSS v4
- Appwrite (Database)
- TypeScript
