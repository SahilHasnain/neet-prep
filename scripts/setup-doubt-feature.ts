/**
 * Setup Script: Doubt Feature
 * Creates the doubts collection in Appwrite
 */

import * as dotenv from "dotenv";
import { Client, Databases, Permission, Role } from "node-appwrite";

dotenv.config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = "flashcard_db";

async function setupDoubtFeature() {
  try {
    console.log("🚀 Setting up Doubt Feature...\n");

    // Create doubts collection
    console.log("Creating doubts collection...");
    const doubtsCollection = await databases.createCollection(
      DATABASE_ID,
      "doubts",
      "doubts",
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ],
    );
    console.log("✅ Doubts collection created");

    // Create attributes
    console.log("\nCreating attributes...");

    await databases.createStringAttribute(
      DATABASE_ID,
      "doubts",
      "doubt_id",
      255,
      true,
    );
    console.log("✅ doubt_id attribute created");

    await databases.createStringAttribute(
      DATABASE_ID,
      "doubts",
      "user_id",
      255,
      true,
    );
    console.log("✅ user_id attribute created");

    await databases.createStringAttribute(
      DATABASE_ID,
      "doubts",
      "card_id",
      255,
      false,
    );
    console.log("✅ card_id attribute created");

    await databases.createStringAttribute(
      DATABASE_ID,
      "doubts",
      "deck_id",
      255,
      false,
    );
    console.log("✅ deck_id attribute created");

    await databases.createStringAttribute(
      DATABASE_ID,
      "doubts",
      "doubt_text",
      2000,
      true,
    );
    console.log("✅ doubt_text attribute created");

    await databases.createStringAttribute(
      DATABASE_ID,
      "doubts",
      "context",
      2000,
      false,
    );
    console.log("✅ context attribute created");

    await databases.createStringAttribute(
      DATABASE_ID,
      "doubts",
      "explanation",
      3000,
      true,
    );
    console.log("✅ explanation attribute created");

    await databases.createStringAttribute(
      DATABASE_ID,
      "doubts",
      "examples",
      2000,
      true,
    );
    console.log("✅ examples attribute created");

    await databases.createStringAttribute(
      DATABASE_ID,
      "doubts",
      "related_concepts",
      1000,
      true,
    );
    console.log("✅ related_concepts attribute created");

    await databases.createStringAttribute(
      DATABASE_ID,
      "doubts",
      "created_at",
      255,
      true,
    );
    console.log("✅ created_at attribute created");

    // Create indexes
    console.log("\nCreating indexes...");

    await databases.createIndex(
      DATABASE_ID,
      "doubts",
      "idx_user_id",
      "key" as any,
      ["user_id"],
      ["asc"],
    );
    console.log("✅ user_id index created");

    await databases.createIndex(
      DATABASE_ID,
      "doubts",
      "idx_card_id",
      "key" as any,
      ["card_id"],
      ["asc"],
    );
    console.log("✅ card_id index created");

    await databases.createIndex(
      DATABASE_ID,
      "doubts",
      "idx_created_at",
      "key" as any,
      ["created_at"],
      ["desc"],
    );
    console.log("✅ created_at index created");

    console.log("\n✅ Doubt feature setup complete!");
    console.log("\n📝 Next steps:");
    console.log("1. Deploy the resolve-doubt Appwrite function");
    console.log("2. Add EXPO_PUBLIC_RESOLVE_DOUBT_FUNCTION_URL to .env.local");
    console.log("3. Test the doubt feature in your app");
  } catch (error) {
    console.error("❌ Error setting up doubt feature:", error);
    throw error;
  }
}

setupDoubtFeature();
