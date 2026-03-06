/**
 * Setup Script: Add topic_id field to flashcard_decks collection
 * Run this before the migration script
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';
const DECKS_COLLECTION = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_FLASHCARD_DECKS || '';

async function addTopicIdAttribute() {
  console.log('Adding topic_id attribute to flashcard_decks collection...');

  try {
    // Add topic_id string attribute
    await databases.createStringAttribute(
      DATABASE_ID,
      DECKS_COLLECTION,
      'topic_id',
      50,
      false, // not required
      undefined,  // no default
      false  // not array
    );

    console.log('✓ topic_id attribute created');
    console.log('Waiting for attribute to be available...');
    
    // Wait for attribute to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create index on topic_id
    await databases.createIndex(
      DATABASE_ID,
      DECKS_COLLECTION,
      'topic_id_idx',
      'key' as any,
      ['topic_id']
    );

    console.log('✓ topic_id_idx index created');
    console.log('\n✓ Setup completed successfully!');
    console.log('\nYou can now run: npm run migrate:decks-to-topics');
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  Attribute or index already exists');
    } else {
      console.error('Error:', error);
      throw error;
    }
  }
}

async function main() {
  console.log('=== Add topic_id Field Setup ===\n');

  try {
    await addTopicIdAttribute();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { addTopicIdAttribute };
