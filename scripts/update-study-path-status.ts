/**
 * Script to update Study Path status enum to include archived and replaced
 * Run: npx ts-node scripts/update-study-path-status.ts
 */

import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_STUDY_PATHS!;

async function updateStatusEnum() {
  console.log('🔄 Updating Study Path status enum...\n');

  try {
    // Note: Appwrite doesn't support updating enum values directly
    // You need to:
    // 1. Delete the old status attribute
    // 2. Create a new one with updated values
    
    console.log('⚠️  Manual Action Required:');
    console.log('\nPlease update the status attribute in Appwrite Console:');
    console.log('1. Go to your Appwrite Console');
    console.log('2. Navigate to Database > study_paths collection');
    console.log('3. Find the "status" attribute');
    console.log('4. Update it to include these values:');
    console.log('   - active');
    console.log('   - completed');
    console.log('   - paused');
    console.log('   - archived');
    console.log('   - replaced');
    console.log('\nOr delete and recreate the attribute with the new values.');
    console.log('\n✅ Code changes are complete and ready to use!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateStatusEnum();
