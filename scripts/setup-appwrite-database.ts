/**
 * Appwrite Database Setup Script
 * Creates database, collections, attributes, and indexes
 * Run with: npx ts-node scripts/setup-appwrite-database.ts
 */

import { config } from 'dotenv';
import { Client, Databases, Permission, Role } from "node-appwrite";

// Load environment variables from .env.local
config({ path: '.env.local' });

// Configuration
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!;

const DATABASE_ID = "flashcard_db";

const COLLECTIONS = {
  FLASHCARD_DECKS: "flashcard_decks",
  FLASHCARDS: "flashcards",
  USER_PROGRESS: "user_progress",
  AI_GENERATION_LOGS: "ai_generation_logs",
};

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupDatabase() {
  console.log("🚀 Starting Appwrite Database Setup...\n");

  try {
    // Step 1: Create Database
    console.log("📦 Creating database...");
    try {
      await databases.create(DATABASE_ID, "Flashcard Database");
      console.log("✅ Database created successfully\n");
    } catch (error: any) {
      if (error.code === 409) {
        console.log("ℹ️  Database already exists\n");
      } else {
        throw error;
      }
    }

    // Step 2: Create Collections
    await createFlashcardDecksCollection();
    await createFlashcardsCollection();
    await createUserProgressCollection();
    await createAIGenerationLogsCollection();

    console.log("\n✨ Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  }
}

async function createFlashcardDecksCollection() {
  console.log("📋 Creating flashcard_decks collection...");

  try {
    await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "Flashcard Decks",
      [
        Permission.read(Role.user("ID")),
        Permission.create(Role.users()),
        Permission.update(Role.user("ID")),
        Permission.delete(Role.user("ID")),
      ],
    );

    // Create attributes
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "deck_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "user_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "title",
      100,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "description",
      500,
      false,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "category",
      50,
      false,
    );
    await databases.createBooleanAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "is_public",
      false,
      false,
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "card_count",
      false,
      0,
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "created_at",
      true,
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "updated_at",
      true,
    );

    // Create indexes
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "deck_id_idx",
      "unique" as any,
      ["deck_id"],
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "user_id_idx",
      "key" as any,
      ["user_id"],
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.FLASHCARD_DECKS,
      "category_idx",
      "key" as any,
      ["category"],
    );

    console.log("✅ flashcard_decks collection created\n");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("ℹ️  flashcard_decks collection already exists\n");
    } else {
      throw error;
    }
  }
}

async function createFlashcardsCollection() {
  console.log("📋 Creating flashcards collection...");

  try {
    await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "Flashcards",
      [
        Permission.read(Role.user("ID")),
        Permission.create(Role.users()),
        Permission.update(Role.user("ID")),
        Permission.delete(Role.user("ID")),
      ],
    );

    // Create attributes
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "card_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "deck_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "front_content",
      1000,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "back_content",
      1000,
      true,
    );
    await databases.createEnumAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "difficulty",
      ["easy", "medium", "hard"],
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "tags",
      50,
      false,
      undefined,
      true,
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "order_index",
      true,
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "created_at",
      true,
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "updated_at",
      true,
    );

    // Create indexes
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "card_id_idx",
      "unique" as any,
      ["card_id"],
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.FLASHCARDS,
      "deck_id_idx",
      "key" as any,
      ["deck_id"],
    );

    console.log("✅ flashcards collection created\n");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("ℹ️  flashcards collection already exists\n");
    } else {
      throw error;
    }
  }
}

async function createUserProgressCollection() {
  console.log("📋 Creating user_progress collection...");

  try {
    await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "User Progress",
      [
        Permission.read(Role.user("ID")),
        Permission.create(Role.users()),
        Permission.update(Role.user("ID")),
        Permission.delete(Role.user("ID")),
      ],
    );

    // Create attributes
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "progress_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "user_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "card_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "deck_id",
      36,
      true,
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "mastery_level",
      true,
      0,
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "last_reviewed",
      true,
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "next_review",
      true,
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "review_count",
      false,
      0,
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "correct_count",
      false,
      0,
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "incorrect_count",
      false,
      0,
    );

    // Create indexes
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "progress_id_idx",
      "unique" as any,
      ["progress_id"],
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "user_card_idx",
      "unique" as any,
      ["user_id", "card_id"],
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.USER_PROGRESS,
      "deck_id_idx",
      "key" as any,
      ["deck_id"],
    );

    console.log("✅ user_progress collection created\n");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("ℹ️  user_progress collection already exists\n");
    } else {
      throw error;
    }
  }
}

async function createAIGenerationLogsCollection() {
  console.log("📋 Creating ai_generation_logs collection...");

  try {
    await databases.createCollection(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "AI Generation Logs",
      [Permission.read(Role.user("ID")), Permission.create(Role.users())],
    );

    // Create attributes
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "log_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "user_id",
      36,
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "deck_id",
      36,
      false,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "prompt",
      1000,
      true,
    );
    await databases.createIntegerAttribute(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "cards_generated",
      true,
    );
    await databases.createEnumAttribute(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "status",
      ["pending", "success", "failed"],
      true,
    );
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "error_message",
      500,
      false,
    );
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "created_at",
      true,
    );

    // Create indexes
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "log_id_idx",
      "unique" as any,
      ["log_id"],
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "user_id_idx",
      "key" as any,
      ["user_id"],
    );
    await databases.createIndex(
      DATABASE_ID,
      COLLECTIONS.AI_GENERATION_LOGS,
      "deck_id_idx",
      "key" as any,
      ["deck_id"],
    );

    console.log("✅ ai_generation_logs collection created\n");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("ℹ️  ai_generation_logs collection already exists\n");
    } else {
      throw error;
    }
  }
}

// Run the setup
setupDatabase();
