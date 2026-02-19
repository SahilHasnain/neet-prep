/**
 * Setup Script: Mistake Pattern Tracking
 * Creates database collections for tracking quiz mistakes
 */

import { config } from "dotenv";
import { Client, Databases, Permission, Role } from "node-appwrite";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Configuration
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!;

const DATABASE_ID = "flashcard_db";

// Collection IDs
const MISTAKE_PATTERNS_ID = "mistake_patterns";
const QUIZ_ATTEMPTS_ID = "quiz_attempts";

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupMistakeTracking() {
  console.log("🚀 Setting up Mistake Pattern Tracking...\n");

  try {
    await createMistakePatternsCollection();
    await createQuizAttemptsCollection();

    console.log("\n🎉 Mistake Pattern Tracking setup complete!");
  } catch (error: any) {
    console.error("❌ Setup failed:", error.message);
    throw error;
  }
}

async function createMistakePatternsCollection() {
  console.log("📋 Creating mistake_patterns collection...");

  try {
    await databases.createCollection(
      DATABASE_ID,
      MISTAKE_PATTERNS_ID,
      "Mistake Patterns",
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ],
    );

    // Add attributes to mistake_patterns
    await databases.createStringAttribute(
      DATABASE_ID,
      MISTAKE_PATTERNS_ID,
      "user_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      MISTAKE_PATTERNS_ID,
      "subject",
      50,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      MISTAKE_PATTERNS_ID,
      "topic",
      100,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      MISTAKE_PATTERNS_ID,
      "concept_id",
      200,
      true,
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      MISTAKE_PATTERNS_ID,
      "mistake_count",
      true,
      0,
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      MISTAKE_PATTERNS_ID,
      "last_occurrence",
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      MISTAKE_PATTERNS_ID,
      "related_questions",
      10000,
      false,
    );

    // Create indexes
    await databases.createIndex(
      DATABASE_ID,
      MISTAKE_PATTERNS_ID,
      "user_id_idx",
      "key" as any,
      ["user_id"],
    );
    await databases.createIndex(
      DATABASE_ID,
      MISTAKE_PATTERNS_ID,
      "concept_idx",
      "key" as any,
      ["concept_id"],
    );

    console.log("✅ mistake_patterns collection created\n");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("ℹ️  mistake_patterns collection already exists\n");
    } else {
      throw error;
    }
  }
}

async function createQuizAttemptsCollection() {
  console.log("📋 Creating quiz_attempts collection...");

  try {
    await databases.createCollection(
      DATABASE_ID,
      QUIZ_ATTEMPTS_ID,
      "Quiz Attempts",
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ],
    );

    // Add attributes to quiz_attempts
    await databases.createStringAttribute(
      DATABASE_ID,
      QUIZ_ATTEMPTS_ID,
      "user_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      QUIZ_ATTEMPTS_ID,
      "card_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      QUIZ_ATTEMPTS_ID,
      "deck_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      QUIZ_ATTEMPTS_ID,
      "quiz_mode",
      50,
      true,
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      QUIZ_ATTEMPTS_ID,
      "score",
      true,
      0,
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      QUIZ_ATTEMPTS_ID,
      "total_questions",
      true,
      1,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      QUIZ_ATTEMPTS_ID,
      "wrong_answers",
      50000,
      false,
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      QUIZ_ATTEMPTS_ID,
      "completed_at",
      true,
    );

    // Create indexes
    await databases.createIndex(
      DATABASE_ID,
      QUIZ_ATTEMPTS_ID,
      "user_id_idx",
      "key" as any,
      ["user_id"],
    );
    await databases.createIndex(
      DATABASE_ID,
      QUIZ_ATTEMPTS_ID,
      "deck_id_idx",
      "key" as any,
      ["deck_id"],
    );

    console.log("✅ quiz_attempts collection created\n");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("ℹ️  quiz_attempts collection already exists\n");
    } else {
      throw error;
    }
  }
}

setupMistakeTracking();
