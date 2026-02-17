/**
 * Setup Script: AI Diagram Feature
 * Creates the ai_diagram_analysis collection and updates flashcards collection
 */

import * as dotenv from "dotenv";
import { Client, Databases } from "node-appwrite";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = "flashcard_db";

async function setupAIDiagramFeature() {
  console.log("🚀 Setting up AI Diagram Feature...\n");

  try {
    // Step 1: Create ai_diagram_analysis collection
    console.log("📦 Creating ai_diagram_analysis collection...");
    try {
      await databases.createCollection(
        DATABASE_ID,
        "ai_diagram_analysis",
        "AI Diagram Analysis",
        [],
        false,
      );
      console.log("✅ Collection created\n");
    } catch (error: any) {
      if (error.code === 409) {
        console.log("⚠️  Collection already exists\n");
      } else {
        throw error;
      }
    }

    // Step 2: Create attributes for ai_diagram_analysis
    console.log("📝 Creating attributes...");

    const attributes = [
      {
        key: "analysis_id",
        type: "string",
        size: 36,
        required: true,
        array: false,
      },
      { key: "user_id", type: "string", size: 36, required: true },
      { key: "card_id", type: "string", size: 36, required: true },
      { key: "image_id", type: "string", size: 36, required: true },
      {
        key: "analysis_type",
        type: "enum",
        elements: ["label_detection", "quality_check", "quiz_generation"],
        required: true,
      },
      {
        key: "status",
        type: "enum",
        elements: ["pending", "success", "failed"],
        required: true,
      },
      { key: "result_data", type: "string", size: 10000, required: false },
      { key: "confidence_score", type: "float", required: false },
      { key: "processing_time", type: "integer", required: true },
      { key: "error_message", type: "string", size: 500, required: false },
      { key: "created_at", type: "datetime", required: true },
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(
            DATABASE_ID,
            "ai_diagram_analysis",
            attr.key,
            attr.size!,
            attr.required,
            undefined,
            attr.array,
          );
        } else if (attr.type === "enum") {
          await databases.createEnumAttribute(
            DATABASE_ID,
            "ai_diagram_analysis",
            attr.key,
            attr.elements!,
            attr.required,
          );
        } else if (attr.type === "float") {
          await databases.createFloatAttribute(
            DATABASE_ID,
            "ai_diagram_analysis",
            attr.key,
            attr.required,
          );
        } else if (attr.type === "integer") {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            "ai_diagram_analysis",
            attr.key,
            attr.required,
          );
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            "ai_diagram_analysis",
            attr.key,
            attr.required,
          );
        }
        console.log(`  ✅ ${attr.key}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ⚠️  ${attr.key} already exists`);
        } else {
          console.error(`  ❌ ${attr.key}: ${error.message}`);
        }
      }
    }

    console.log("\n⏳ Waiting for attributes to be ready...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 3: Create indexes
    console.log("\n🔍 Creating indexes...");

    const indexes = [
      { key: "user_id_idx", type: "key", attributes: ["user_id"] },
      { key: "card_id_idx", type: "key", attributes: ["card_id"] },
      { key: "created_at_idx", type: "key", attributes: ["created_at"] },
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          "ai_diagram_analysis",
          index.key,
          index.type as any,
          index.attributes,
        );
        console.log(`  ✅ ${index.key}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ⚠️  ${index.key} already exists`);
        } else {
          console.error(`  ❌ ${index.key}: ${error.message}`);
        }
      }
    }

    // Step 4: Update flashcards collection with AI fields
    console.log("\n📝 Adding AI fields to flashcards collection...");

    const flashcardAIAttributes = [
      { key: "ai_analyzed", type: "boolean", required: false, default: false },
      { key: "ai_confidence", type: "float", required: false },
      { key: "ai_suggestions_count", type: "integer", required: false },
      { key: "ai_labels_applied", type: "integer", required: false },
    ];

    for (const attr of flashcardAIAttributes) {
      try {
        if (attr.type === "boolean") {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            "flashcards",
            attr.key,
            attr.required,
            attr.default,
          );
        } else if (attr.type === "float") {
          await databases.createFloatAttribute(
            DATABASE_ID,
            "flashcards",
            attr.key,
            attr.required,
          );
        } else if (attr.type === "integer") {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            "flashcards",
            attr.key,
            attr.required,
          );
        }
        console.log(`  ✅ ${attr.key}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ⚠️  ${attr.key} already exists`);
        } else {
          console.error(`  ❌ ${attr.key}: ${error.message}`);
        }
      }
    }

    console.log("\n✨ AI Diagram Feature setup complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Deploy the analyze-diagram Appwrite function");
    console.log(
      "2. Add EXPO_PUBLIC_ANALYZE_DIAGRAM_FUNCTION_URL to .env.local",
    );
    console.log("3. Test AI label detection with a sample diagram");
  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  }
}

// Run setup
setupAIDiagramFeature();
