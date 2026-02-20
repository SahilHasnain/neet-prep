/**
 * Fix Card Reviews Collection Permissions
 * Deletes and recreates the collection with proper permissions
 */

import * as dotenv from "dotenv";
import { Client, Databases } from "node-appwrite";

dotenv.config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = "flashcard_db";
const CARD_REVIEWS_COLLECTION = "card_reviews";

async function fixPermissions() {
  try {
    console.log("Deleting old card_reviews collection...");

    try {
      await databases.deleteCollection(DATABASE_ID, CARD_REVIEWS_COLLECTION);
      console.log("✓ Old collection deleted");
    } catch (error: any) {
      if (error.code === 404) {
        console.log("⚠ Collection doesn't exist, creating new one");
      } else {
        throw error;
      }
    }

    // Wait a bit for deletion to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("\nCreating new collection with proper permissions...");

    await databases.createCollection(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "Card Reviews",
      ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
    );

    console.log("✓ Collection created with permissions");

    // Create attributes
    console.log("Creating attributes...");

    await databases.createStringAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "card_id",
      36,
      true,
    );

    await databases.createStringAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "user_id",
      36,
      true,
    );

    await databases.createFloatAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "ease_factor",
      true,
    );

    await databases.createIntegerAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "interval",
      true,
      0,
      365,
    );

    await databases.createIntegerAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "repetitions",
      true,
      0,
      1000,
    );

    await databases.createDatetimeAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "next_review_date",
      true,
    );

    await databases.createDatetimeAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "last_review_date",
      false,
    );

    await databases.createDatetimeAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "created_at",
      true,
    );

    await databases.createDatetimeAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "updated_at",
      true,
    );

    console.log("✓ Attributes created");

    // Wait for attributes to be available
    console.log("Waiting for attributes to be ready...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Create indexes
    console.log("Creating indexes...");

    await databases.createIndex(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "idx_card_user",
      "unique" as any,
      ["card_id", "user_id"],
    );

    await databases.createIndex(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "idx_user_next_review",
      "key" as any,
      ["user_id", "next_review_date"],
    );

    await databases.createIndex(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "idx_next_review",
      "key" as any,
      ["next_review_date"],
    );

    console.log("✓ Indexes created");

    console.log("\n✓ Permissions fixed successfully!");
    console.log("\nNow run: npm run setup:spaced-repetition");
    console.log("This will initialize existing flashcards.");
  } catch (error) {
    console.error("\n✗ Failed to fix permissions:", error);
    process.exit(1);
  }
}

fixPermissions();
