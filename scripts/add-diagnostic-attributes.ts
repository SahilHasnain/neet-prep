/**
 * Add missing attributes to diagnostic_results collection
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
const COLLECTION_ID = 'diagnostic_results';

async function addMissingAttributes() {
  console.log('🚀 Adding missing attributes to diagnostic_results...\n');

  try {
    // Get existing collection to check what attributes exist
    const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    console.log(`Found collection: ${collection.name}`);
    console.log(`Existing attributes: ${collection.attributes.length}\n`);

    const existingAttrs = collection.attributes.map((attr: any) => attr.key);
    console.log('Existing attributes:', existingAttrs.join(', '), '\n');

    // List of required attributes
    const requiredAttributes = [
      { key: 'result_id', type: 'string', size: 36, required: true },
      { key: 'user_id', type: 'string', size: 36, required: true },
      { key: 'total_score', type: 'integer', required: true },
      { key: 'physics_score', type: 'integer', required: true },
      { key: 'chemistry_score', type: 'integer', required: true },
      { key: 'biology_score', type: 'integer', required: true },
      { key: 'weak_topics', type: 'string', size: 10000, required: true },
      { key: 'strong_topics', type: 'string', size: 10000, required: true },
      { key: 'detailed_results', type: 'string', size: 50000, required: true },
      { key: 'completed_at', type: 'datetime', required: true }
    ];

    // Add missing attributes
    for (const attr of requiredAttributes) {
      if (!existingAttrs.includes(attr.key)) {
        console.log(`Adding attribute: ${attr.key} (${attr.type})...`);
        
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
              attr.required
            );
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              DATABASE_ID,
              COLLECTION_ID,
              attr.key,
              attr.required
            );
          }
          console.log(`✅ Added ${attr.key}`);
        } catch (error: any) {
          if (error.code === 409) {
            console.log(`⚠️  ${attr.key} already exists`);
          } else {
            console.error(`❌ Error adding ${attr.key}:`, error.message);
          }
        }
      } else {
        console.log(`✓ ${attr.key} already exists`);
      }
    }

    console.log('\n⏳ Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if indexes exist
    console.log('\nChecking indexes...');
    const updatedCollection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
    console.log(`Current indexes: ${updatedCollection.indexes.length}`);

    const existingIndexes = updatedCollection.indexes.map((idx: any) => idx.key);
    
    // Add indexes if missing
    if (!existingIndexes.includes('result_id_idx')) {
      console.log('Adding result_id index...');
      try {
        await databases.createIndex(
          DATABASE_ID,
          COLLECTION_ID,
          'result_id_idx',
          'unique' as any,
          ['result_id']
        );
        console.log('✅ Added result_id index');
      } catch (error: any) {
        if (error.code === 409) {
          console.log('⚠️  result_id index already exists');
        } else {
          console.error('❌ Error adding index:', error.message);
        }
      }
    }

    if (!existingIndexes.includes('user_id_idx')) {
      console.log('Adding user_id index...');
      try {
        await databases.createIndex(
          DATABASE_ID,
          COLLECTION_ID,
          'user_id_idx',
          'key' as any,
          ['user_id']
        );
        console.log('✅ Added user_id index');
      } catch (error: any) {
        if (error.code === 409) {
          console.log('⚠️  user_id index already exists');
        } else {
          console.error('❌ Error adding index:', error.message);
        }
      }
    }

    console.log('\n🎉 diagnostic_results collection is ready!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

addMissingAttributes()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
