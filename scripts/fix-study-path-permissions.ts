/**
 * Fix permissions for study path collections
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

async function fixCollectionPermissions() {
  console.log('🚀 Fixing study path collection permissions...\n');

  const collections = [
    'diagnostic_results',
    'study_paths',
    'topic_progress',
    'daily_tasks'
  ];

  const correctPermissions = [
    Permission.read(Role.any()),
    Permission.create(Role.any()),
    Permission.update(Role.any()),
    Permission.delete(Role.any())
  ];

  for (const collectionId of collections) {
    try {
      console.log(`Updating ${collectionId}...`);
      
      await databases.updateCollection(
        DATABASE_ID,
        collectionId,
        collectionId,
        correctPermissions
      );
      
      console.log(`✅ ${collectionId} permissions updated\n`);
    } catch (error: any) {
      console.error(`❌ Error updating ${collectionId}:`, error.message, '\n');
    }
  }

  console.log('🎉 All permissions updated!');
  console.log('\nPermissions set to:');
  console.log('  - Read: Any');
  console.log('  - Create: Any');
  console.log('  - Update: Any');
  console.log('  - Delete: Any');
}

fixCollectionPermissions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
