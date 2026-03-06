/**
 * Delete Flashcard Collections Script
 * Removes all flashcard-related collections from Appwrite database
 */

import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = 'flashcard_db';

// Collections to delete
const COLLECTIONS_TO_DELETE = [
  'flashcard_decks',
  'flashcards',
  'user_progress',
  'ai_generation_logs',
  'flashcard_labels',
  'mistake_patterns',
  'quiz_attempts',
  'card_reviews',
  'doubts',
];

async function deleteCollection(collectionId: string): Promise<void> {
  try {
    await databases.deleteCollection(DATABASE_ID, collectionId);
    console.log(`✅ Deleted collection: ${collectionId}`);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`⚠️  Collection not found (already deleted): ${collectionId}`);
    } else {
      console.error(`❌ Error deleting collection ${collectionId}:`, error.message);
    }
  }
}

async function main() {
  console.log('🗑️  Starting flashcard collections deletion...\n');

  for (const collectionId of COLLECTIONS_TO_DELETE) {
    await deleteCollection(collectionId);
  }

  console.log('\n✨ Flashcard collections deletion complete!');
  console.log('\nRemaining collections:');
  console.log('  - diagnostic_results');
  console.log('  - study_paths');
  console.log('  - topic_progress');
  console.log('  - daily_tasks');
  console.log('  - diagnostic_questions');
}

main().catch(console.error);
