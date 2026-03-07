/**
 * Setup AI Notes Collection in Appwrite
 * Run: npm run setup:ai-notes
 */

import * as dotenv from 'dotenv';
import { Client, Databases, Permission, Role } from 'node-appwrite';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = 'flashcard_db';
const COLLECTION_ID = 'ai_notes';

async function setupAINotesCollection() {
  try {
    console.log('🚀 Setting up AI Notes collection...');

    // Try to delete existing collection
    try {
      await databases.deleteCollection(DATABASE_ID, COLLECTION_ID);
      console.log('✅ Deleted existing collection');
    } catch (error) {
      console.log('ℹ️  No existing collection to delete');
    }

    // Create collection
    await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'AI Generated Notes',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );
    console.log('✅ Created AI Notes collection');

    // Create attributes
    const attributes = [
      { key: 'note_id', type: 'string', size: 255, required: true },
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'topic_id', type: 'string', size: 255, required: true },
      { key: 'topic_name', type: 'string', size: 500, required: true },
      { key: 'subject', type: 'string', size: 100, required: true },
      { key: 'language', type: 'string', size: 50, required: true }, // 'english' or 'hinglish'
      { key: 'difficulty', type: 'string', size: 50, required: true }, // 'beginner', 'intermediate', 'advanced'
      { key: 'format', type: 'string', size: 100, required: true }, // 'comprehensive', 'formula-sheet', etc.
      { key: 'sections', type: 'string', size: 100000, required: true }, // JSON string
      { key: 'key_takeaways', type: 'string', size: 10000, required: true }, // JSON array
      { key: 'estimated_read_time', type: 'integer', required: true },
      { key: 'generated_at', type: 'datetime', required: true },
      { key: 'last_accessed', type: 'datetime', required: true },
      { key: 'access_count', type: 'integer', required: true, default: 0 },
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.size!,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required,
            undefined,
            undefined,
            (attr as any).default
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required
          );
        }
        console.log(`✅ Created attribute: ${attr.key}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between attributes
      } catch (error: any) {
        console.log(`⚠️  Attribute ${attr.key}: ${error.message}`);
      }
    }

    // Create indexes
    console.log('Creating indexes...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      await databases.createIndex(
        DATABASE_ID,
        COLLECTION_ID,
        'user_topic_idx',
        'key' as any,
        ['user_id', 'topic_id']
      );
      console.log('✅ Created user_topic index');
    } catch (error: any) {
      console.log(`⚠️  Index user_topic: ${error.message}`);
    }

    try {
      await databases.createIndex(
        DATABASE_ID,
        COLLECTION_ID,
        'user_topic_lang_format_idx',
        'key' as any,
        ['user_id', 'topic_id', 'language', 'format']
      );
      console.log('✅ Created user_topic_lang_format index');
    } catch (error: any) {
      console.log(`⚠️  Index user_topic_lang_format: ${error.message}`);
    }

    console.log('\n✅ AI Notes collection setup complete!');
    console.log('\nCollection Details:');
    console.log('- Database ID:', DATABASE_ID);
    console.log('- Collection ID:', COLLECTION_ID);
    console.log('- Attributes: 13');
    console.log('- Indexes: 2');
    console.log('\nNow update COLLECTIONS in src/config/appwrite.config.ts:');
    console.log('AI_NOTES: "ai_notes"');

  } catch (error) {
    console.error('❌ Error setting up collection:', error);
    throw error;
  }
}

setupAINotesCollection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
