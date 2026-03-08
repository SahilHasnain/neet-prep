/**
 * Clean up orphaned topic progress records
 * Deletes progress records that don't belong to any active study path
 */

import * as dotenv from 'dotenv';
import { Client, Databases, Query } from 'node-appwrite';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = 'flashcard_db';
const COLLECTIONS = {
  STUDY_PATHS: 'study_paths',
  TOPIC_PROGRESS: 'topic_progress',
};

async function cleanupOrphanedProgress() {
  console.log('🧹 Cleaning up orphaned progress records...\n');

  try {
    // Get all active study paths
    const activePaths = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STUDY_PATHS,
      [Query.equal('status', 'active'), Query.limit(100)]
    );

    const activePathIds = new Set(activePaths.documents.map((doc: any) => doc.path_id));
    console.log(`Found ${activePathIds.size} active study paths\n`);

    // Get all progress records
    const allProgress = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TOPIC_PROGRESS,
      [Query.limit(1000)]
    );

    console.log(`Found ${allProgress.documents.length} total progress records\n`);

    let deletedCount = 0;

    for (const progress of allProgress.documents) {
      const pathId = (progress as any).path_id;
      
      if (!activePathIds.has(pathId)) {
        try {
          await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.TOPIC_PROGRESS,
            progress.$id
          );
          deletedCount++;
          console.log(`✓ Deleted orphaned progress: ${progress.$id} (path: ${pathId})`);
        } catch (error: any) {
          console.error(`✗ Failed to delete ${progress.$id}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} orphaned progress records.`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupOrphanedProgress();
