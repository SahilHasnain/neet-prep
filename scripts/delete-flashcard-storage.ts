/**
 * Delete Flashcard Storage Bucket Script
 * Removes flashcard images storage bucket from Appwrite
 */

import { Client, Storage } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const storage = new Storage(client);

const BUCKET_ID = 'flashcard_images';

async function main() {
  console.log('🗑️  Deleting flashcard storage bucket...\n');

  try {
    await storage.deleteBucket(BUCKET_ID);
    console.log(`✅ Deleted storage bucket: ${BUCKET_ID}`);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`⚠️  Storage bucket not found (already deleted): ${BUCKET_ID}`);
    } else {
      console.error(`❌ Error deleting storage bucket:`, error.message);
    }
  }

  console.log('\n✨ Storage cleanup complete!');
}

main().catch(console.error);
