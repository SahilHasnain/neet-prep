/**
 * Setup Script for Diagnostic Questions Cache Collection
 * Run this to create the diagnostic_questions collection in Appwrite
 */

import * as dotenv from 'dotenv';
import { Client, Databases, Permission, Role } from 'node-appwrite';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = 'flashcard_db';
const COLLECTION_ID = 'diagnostic_questions';

async function setupDiagnosticQuestionsCollection() {
  try {
    console.log('Creating diagnostic_questions collection...');
    
    // Create collection
    await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Diagnostic Questions Cache',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );
    
    console.log('✓ Collection created');
    
    // Create attributes
    console.log('Creating attributes...');
    
    // questions - JSON string of question array
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'questions',
      100000, // Large size for JSON
      true
    );
    console.log('✓ questions attribute created');
    
    // created_at - timestamp
    await databases.createStringAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'created_at',
      50,
      true
    );
    console.log('✓ created_at attribute created');
    
    // question_count - number of questions
    await databases.createIntegerAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      'question_count',
      true
    );
    console.log('✓ question_count attribute created');
    
    // Wait for attributes to be available
    console.log('Waiting for attributes to be available...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create indexes
    console.log('Creating indexes...');
    
    await databases.createIndex(
      DATABASE_ID,
      COLLECTION_ID,
      'created_at_index',
      'key' as any,
      ['created_at'],
      ['DESC'] as any
    );
    console.log('✓ created_at index created');
    
    console.log('\n✅ Diagnostic questions cache collection setup complete!');
    console.log('\nCollection Details:');
    console.log('- Collection ID: diagnostic_questions');
    console.log('- Attributes: questions (string), created_at (string), question_count (integer)');
    console.log('- Indexes: created_at_index');
    console.log('- Permissions: Any role (read, create, update, delete)');
    
  } catch (error: any) {
    if (error.code === 409) {
      console.log('Collection already exists');
    } else {
      console.error('Error setting up collection:', error);
      throw error;
    }
  }
}

setupDiagnosticQuestionsCollection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
