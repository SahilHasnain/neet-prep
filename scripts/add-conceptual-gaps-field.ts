/**
 * Add conceptual_gaps field to topic_progress collection
 * Run: npx ts-node scripts/add-conceptual-gaps-field.ts
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
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_TOPIC_PROGRESS!;

async function addConceptualGapsField() {
  try {
    console.log('Adding conceptual_gaps field to topic_progress collection...');

    // Add the conceptual_gaps attribute (stored as JSON string)
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'conceptual_gaps',
      10000, // Max size for JSON array
      false, // Not required
      '[]', // Default empty array
      false // Not array type (we store as JSON string)
    );

    console.log('✅ Successfully added conceptual_gaps field');
    console.log('Note: Existing documents will have empty array [] as default');
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  Field already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

addConceptualGapsField();
