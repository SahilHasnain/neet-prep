/**
 * Video Lessons Database Setup Script
 * Creates video_lessons collection in Appwrite
 * Run with: npx ts-node scripts/setup-video-lessons.ts
 */

import { config } from "dotenv";
import { Client, Databases, Permission, Role } from "node-appwrite";

config({ path: ".env.local" });

const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = "flashcard_db";
const COLLECTION_ID = "video_lessons";

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupVideoLessonsCollection() {
  console.log("🎥 Setting up video_lessons collection...\n");

  try {
    // Create collection
    console.log("📋 Creating collection...");
    try {
      await databases.createCollection(
        DATABASE_ID,
        COLLECTION_ID,
        "Video Lessons",
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
      );
      console.log("✅ Collection created\n");
    } catch (error: any) {
      if (error.code === 409) {
        console.log("ℹ️  Collection already exists\n");
      } else {
        throw error;
      }
    }

    // Create attributes
    console.log("📝 Creating attributes...");
    
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, "video_id", 50, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, "topic_id", 20, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, "title", 200, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, "channel", 100, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, "youtube_id", 20, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, "duration", 10, true);
    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, "description", 1000, false);
    await databases.createEnumAttribute(DATABASE_ID, COLLECTION_ID, "difficulty", ["beginner", "intermediate", "advanced"], true);
    await databases.createEnumAttribute(DATABASE_ID, COLLECTION_ID, "language", ["english", "hindi", "both"], true);
    await databases.createBooleanAttribute(DATABASE_ID, COLLECTION_ID, "is_active", false, true);
    await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, "order_index", false, 0);
    await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, "created_at", true);
    await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, "updated_at", true);

    console.log("✅ Attributes created\n");

    // Create indexes
    console.log("🔍 Creating indexes...");
    
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, "video_id_idx", "unique" as any, ["video_id"]);
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, "topic_id_idx", "key" as any, ["topic_id"]);
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, "youtube_id_idx", "key" as any, ["youtube_id"]);
    await databases.createIndex(DATABASE_ID, COLLECTION_ID, "is_active_idx", "key" as any, ["is_active"]);

    console.log("✅ Indexes created\n");
    console.log("✨ Video lessons collection setup completed!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

setupVideoLessonsCollection();
