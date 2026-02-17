/**
 * Setup Script for Diagram Flashcards Feature
 * Adds image fields to flashcards collection, creates labels collection, and storage bucket
 */

import * as dotenv from "dotenv";
import { Client, Databases, Permission, Role, Storage } from "node-appwrite";

// Load environment variables
dotenv.config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = "flashcard_db";
const FLASHCARDS_COLLECTION_ID = "flashcards";
const LABELS_COLLECTION_ID = "flashcard_labels";
const BUCKET_ID = "flashcard_images";

async function setupDiagramFeature() {
  console.log("🚀 Starting Diagram Feature Setup...\n");

  try {
    // Step 1: Update flashcards collection with image fields
    await updateFlashcardsCollection();

    // Step 2: Create flashcard_labels collection
    await createLabelsCollection();

    // Step 3: Create storage bucket for images
    await createStorageBucket();

    console.log("\n✅ Diagram Feature Setup Complete!");
    console.log("\n📝 Summary:");
    console.log("   - Added image fields to flashcards collection");
    console.log("   - Created flashcard_labels collection");
    console.log("   - Created flashcard_images storage bucket");
    console.log("\n🎉 You can now use diagram flashcards!");
  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  }
}

async function updateFlashcardsCollection() {
  console.log("📝 Step 1: Updating flashcards collection...");

  try {
    // Add has_image field
    await databases.createBooleanAttribute(
      DATABASE_ID,
      FLASHCARDS_COLLECTION_ID,
      "has_image",
      false,
      false,
    );
    console.log("   ✓ Added has_image field");

    // Wait for attribute to be available
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Add image_url field
    await databases.createStringAttribute(
      DATABASE_ID,
      FLASHCARDS_COLLECTION_ID,
      "image_url",
      500,
      false,
    );
    console.log("   ✓ Added image_url field");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Add image_id field
    await databases.createStringAttribute(
      DATABASE_ID,
      FLASHCARDS_COLLECTION_ID,
      "image_id",
      100,
      false,
    );
    console.log("   ✓ Added image_id field");

    console.log("   ✅ Flashcards collection updated successfully\n");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("   ⚠️  Fields already exist, skipping...\n");
    } else {
      throw error;
    }
  }
}

async function createLabelsCollection() {
  console.log("📝 Step 2: Creating flashcard_labels collection...");

  try {
    // Create collection
    await databases.createCollection(
      DATABASE_ID,
      LABELS_COLLECTION_ID,
      "Flashcard Labels",
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
    );
    console.log("   ✓ Created collection");

    // Wait for collection to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Add label_id attribute (unique)
    await databases.createStringAttribute(
      DATABASE_ID,
      LABELS_COLLECTION_ID,
      "label_id",
      36,
      true,
    );
    console.log("   ✓ Added label_id field");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Add card_id attribute (indexed)
    await databases.createStringAttribute(
      DATABASE_ID,
      LABELS_COLLECTION_ID,
      "card_id",
      36,
      true,
    );
    console.log("   ✓ Added card_id field");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Add label_text attribute
    await databases.createStringAttribute(
      DATABASE_ID,
      LABELS_COLLECTION_ID,
      "label_text",
      100,
      true,
    );
    console.log("   ✓ Added label_text field");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Add x_position attribute
    await databases.createFloatAttribute(
      DATABASE_ID,
      LABELS_COLLECTION_ID,
      "x_position",
      true,
    );
    console.log("   ✓ Added x_position field");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Add y_position attribute
    await databases.createFloatAttribute(
      DATABASE_ID,
      LABELS_COLLECTION_ID,
      "y_position",
      true,
    );
    console.log("   ✓ Added y_position field");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Add order_index attribute
    await databases.createIntegerAttribute(
      DATABASE_ID,
      LABELS_COLLECTION_ID,
      "order_index",
      true,
    );
    console.log("   ✓ Added order_index field");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Add created_at attribute
    await databases.createDatetimeAttribute(
      DATABASE_ID,
      LABELS_COLLECTION_ID,
      "created_at",
      true,
    );
    console.log("   ✓ Added created_at field");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create indexes
    await databases.createIndex(
      DATABASE_ID,
      LABELS_COLLECTION_ID,
      "label_id_idx",
      "unique" as any,
      ["label_id"],
    );
    console.log("   ✓ Created label_id index");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await databases.createIndex(
      DATABASE_ID,
      LABELS_COLLECTION_ID,
      "card_id_idx",
      "key" as any,
      ["card_id"],
    );
    console.log("   ✓ Created card_id index");

    console.log("   ✅ Labels collection created successfully\n");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("   ⚠️  Collection already exists, skipping...\n");
    } else {
      throw error;
    }
  }
}

async function createStorageBucket() {
  console.log("📝 Step 3: Creating storage bucket...");

  try {
    await storage.createBucket(
      BUCKET_ID,
      "Flashcard Images",
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false, // fileSecurity
      true, // enabled
      5242880, // maxFileSize (5MB)
      ["jpg", "jpeg", "png"], // allowedFileExtensions
      "gzip" as any, // compression
      true, // encryption
      true, // antivirus
    );
    console.log("   ✓ Created bucket");
    console.log("   ✅ Storage bucket created successfully\n");
  } catch (error: any) {
    if (error.code === 409) {
      console.log("   ⚠️  Bucket already exists, skipping...\n");
    } else {
      throw error;
    }
  }
}

// Run the setup
setupDiagramFeature();
