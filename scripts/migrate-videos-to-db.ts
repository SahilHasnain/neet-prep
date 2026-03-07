/**
 * Migrate existing video config to Appwrite database
 * Run with: npx ts-node scripts/migrate-videos-to-db.ts
 */

import { config } from "dotenv";
import { Client, Databases, ID } from "node-appwrite";
import { VIDEO_LESSONS } from "../src/config/video-lessons.config";

config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = "flashcard_db";
const COLLECTION_ID = "video_lessons";

async function migrateVideos() {
  console.log("🚀 Starting video migration...\n");

  let successCount = 0;
  let errorCount = 0;

  for (const topicVideos of VIDEO_LESSONS) {
    console.log(`📹 Migrating videos for topic: ${topicVideos.topicId}`);

    for (let i = 0; i < topicVideos.videos.length; i++) {
      const video = topicVideos.videos[i];
      
      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          {
            video_id: video.id,
            topic_id: topicVideos.topicId,
            title: video.title,
            channel: video.channel,
            youtube_id: video.youtubeId,
            duration: video.duration,
            description: video.description,
            difficulty: video.difficulty,
            language: video.language,
            is_active: true,
            order_index: i,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
        
        console.log(`  ✅ ${video.title}`);
        successCount++;
      } catch (error: any) {
        console.log(`  ❌ Failed: ${video.title} - ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log(`\n✨ Migration complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
}

migrateVideos();
