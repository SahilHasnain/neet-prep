/**
 * Setup Script for Spaced Repetition Feature
 * Creates card_reviews collection and initializes existing flashcards
 */

import * as dotenv from "dotenv";
import { Client, Databases, Query } from "node-appwrite";

dotenv.config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = "flashcard_db";
const CARD_REVIEWS_COLLECTION = "card_reviews";
const FLASHCARDS_COLLECTION = "flashcards";

async function setupCardReviewsCollection() {
  try {
    console.log("Creating card_reviews collection...");

    await databases.createCollection(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "Card Reviews",
      [
        // Allow any user to read/write their own reviews
        'read("any")',
        'create("any")',
        'update("any")',
        'delete("any")',
      ],
    );

    console.log("✓ Collection created");

    // Create attributes
    console.log("Creating attributes...");

    await databases.createStringAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "review_id",
      36,
      true,
    );

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
      undefined,
      2.5,
    );

    await databases.createIntegerAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "interval",
      true,
      undefined,
      0,
    );

    await databases.createIntegerAttribute(
      DATABASE_ID,
      CARD_REVIEWS_COLLECTION,
      "repetitions",
      true,
      undefined,
      0,
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
  } catch (error: any) {
    if (error.code === 409) {
      console.log("⚠ Collection already exists");
    } else {
      console.error("Error creating collection:", error);
      throw error;
    }
  }
}

async function initializeExistingCards() {
  try {
    console.log("\nInitializing existing flashcards...");

    // Get all flashcards
    const flashcards = await databases.listDocuments(
      DATABASE_ID,
      FLASHCARDS_COLLECTION,
      [Query.limit(10000)],
    );

    console.log(`Found ${flashcards.documents.length} flashcards`);

    const now = new Date().toISOString();
    let initialized = 0;

    for (const card of flashcards.documents) {
      try {
        // Check if review already exists
        const existing = await databases.listDocuments(
          DATABASE_ID,
          CARD_REVIEWS_COLLECTION,
          [Query.equal("card_id", card.card_id)],
        );

        if (existing.documents.length === 0) {
          // Create initial review record
          await databases.createDocument(
            DATABASE_ID,
            CARD_REVIEWS_COLLECTION,
            `review_${card.card_id}`,
            {
              review_id: `review_${card.card_id}`,
              card_id: card.card_id,
              user_id: card.user_id || "anonymous",
              ease_factor: 2.5,
              interval: 0,
              repetitions: 0,
              next_review_date: now,
              created_at: now,
              updated_at: now,
            },
          );
          initialized++;
        }
      } catch (error: any) {
        if (error.code !== 409) {
          console.error(`Error initializing card ${card.card_id}:`, error);
        }
      }
    }

    console.log(`✓ Initialized ${initialized} cards`);
  } catch (error) {
    console.error("Error initializing cards:", error);
    throw error;
  }
}

async function main() {
  console.log("=== Spaced Repetition Setup ===\n");

  try {
    await setupCardReviewsCollection();
    await initializeExistingCards();

    console.log("\n✓ Setup complete!");
    console.log("\nNext steps:");
    console.log("1. Test the spaced repetition service");
    console.log("2. Integrate into study mode UI");
    console.log("3. Add review dashboard");
  } catch (error) {
    console.error("\n✗ Setup failed:", error);
    process.exit(1);
  }
}

main();
