/**
 * Verify Mistake Tracking Setup
 * Checks if collections exist and are accessible
 */

import { config } from "dotenv";
import { Client, Databases } from "node-appwrite";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Configuration
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!;

const DATABASE_ID = "flashcard_db";
const MISTAKE_PATTERNS_ID = "mistake_patterns";
const QUIZ_ATTEMPTS_ID = "quiz_attempts";

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function verifySetup() {
  console.log("🔍 Verifying Mistake Tracking Setup...\n");

  try {
    // Check mistake_patterns collection
    console.log("Checking mistake_patterns collection...");
    try {
      const mistakePatterns = await databases.getCollection(
        DATABASE_ID,
        MISTAKE_PATTERNS_ID,
      );
      console.log("✅ mistake_patterns collection exists");
      console.log(`   - ID: ${mistakePatterns.$id}`);
      console.log(`   - Name: ${mistakePatterns.name}`);
    } catch (error: any) {
      console.log("❌ mistake_patterns collection NOT FOUND");
      console.log(`   Error: ${error.message}`);
    }

    console.log();

    // Check quiz_attempts collection
    console.log("Checking quiz_attempts collection...");
    try {
      const quizAttempts = await databases.getCollection(
        DATABASE_ID,
        QUIZ_ATTEMPTS_ID,
      );
      console.log("✅ quiz_attempts collection exists");
      console.log(`   - ID: ${quizAttempts.$id}`);
      console.log(`   - Name: ${quizAttempts.name}`);
    } catch (error: any) {
      console.log("❌ quiz_attempts collection NOT FOUND");
      console.log(`   Error: ${error.message}`);
    }

    console.log();

    // Try to list documents (should return empty array if no data)
    console.log("Testing data access...");
    try {
      const patterns = await databases.listDocuments(
        DATABASE_ID,
        MISTAKE_PATTERNS_ID,
        [],
      );
      console.log(
        `✅ Can access mistake_patterns (${patterns.total} documents)`,
      );
    } catch (error: any) {
      console.log("❌ Cannot access mistake_patterns");
      console.log(`   Error: ${error.message}`);
    }

    try {
      const attempts = await databases.listDocuments(
        DATABASE_ID,
        QUIZ_ATTEMPTS_ID,
        [],
      );
      console.log(`✅ Can access quiz_attempts (${attempts.total} documents)`);
    } catch (error: any) {
      console.log("❌ Cannot access quiz_attempts");
      console.log(`   Error: ${error.message}`);
    }

    console.log("\n✨ Verification complete!");
  } catch (error: any) {
    console.error("❌ Verification failed:", error.message);
    throw error;
  }
}

verifySetup();
