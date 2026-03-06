/**
 * Script to add AI-related fields to Study Path collections
 * Run: npx ts-node scripts/add-ai-study-path-fields.ts
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

const COLLECTIONS = {
  STUDY_PATHS: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_STUDY_PATHS!,
  TOPIC_PROGRESS: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_TOPIC_PROGRESS!
};

async function addAIFields() {
  console.log('🤖 Adding AI fields to Study Path collections...\n');

  try {
    // Add fields to Study Paths collection
    console.log('📝 Adding AI fields to Study Paths collection...');
    
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        COLLECTIONS.STUDY_PATHS,
        'ai_reasoning',
        1000,
        false
      );
      console.log('✅ Added ai_reasoning field');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  ai_reasoning field already exists');
      } else {
        throw error;
      }
    }

    try {
      await databases.createIntegerAttribute(
        DATABASE_ID,
        COLLECTIONS.STUDY_PATHS,
        'estimated_weeks',
        false
      );
      console.log('✅ Added estimated_weeks field');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  estimated_weeks field already exists');
      } else {
        throw error;
      }
    }

    // Add priority field to Topic Progress collection
    console.log('\n📝 Adding priority field to Topic Progress collection...');
    
    try {
      await databases.createEnumAttribute(
        DATABASE_ID,
        COLLECTIONS.TOPIC_PROGRESS,
        'priority',
        ['high', 'medium', 'low'],
        false,
        'medium'
      );
      console.log('✅ Added priority field');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  priority field already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✨ AI fields added successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Study Paths: ai_reasoning, estimated_weeks');
    console.log('   - Topic Progress: priority');
    console.log('\n🎯 Study paths will now be generated using AI!');

  } catch (error) {
    console.error('❌ Error adding AI fields:', error);
    process.exit(1);
  }
}

addAIFields();
