/**
 * Cleanup Script: Fix Study Path Data
 * Archives all old paths and cleans up orphaned progress documents
 */

import * as dotenv from 'dotenv';
import { Client, Databases, Query } from 'node-appwrite';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = 'flashcard_db';

async function cleanupStudyPaths() {
  console.log('\n🧹 CLEANING UP STUDY PATHS\n');
  console.log('='.repeat(80));
  
  try {
    // Get all study paths
    const response = await databases.listDocuments(
      DATABASE_ID,
      'study_paths',
      [Query.limit(100)]
    );

    console.log(`\nFound ${response.documents.length} study paths\n`);

    // Find the most recent active path
    const activePaths = response.documents
      .filter(doc => doc.status === 'active' || doc.status === null)
      .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime());

    if (activePaths.length === 0) {
      console.log('✅ No active paths to clean up');
      return;
    }

    const mostRecentPath = activePaths[0];
    console.log(`📌 Keeping most recent path: ${mostRecentPath.path_id}`);
    console.log(`   Created: ${mostRecentPath.created_at}`);
    console.log(`   Status: ${mostRecentPath.status === null ? 'NULL (will fix)' : mostRecentPath.status}\n`);

    // Fix the status of the most recent path if it's null
    if (mostRecentPath.status === null) {
      await databases.updateDocument(
        DATABASE_ID,
        'study_paths',
        mostRecentPath.$id,
        { status: 'active' }
      );
      console.log(`✅ Fixed status to 'active' for path ${mostRecentPath.path_id}\n`);
    }

    // Archive all other active/null paths
    const pathsToArchive = activePaths.slice(1);
    console.log(`🗄️  Archiving ${pathsToArchive.length} old paths...\n`);

    for (const path of pathsToArchive) {
      console.log(`   Archiving path ${path.path_id} (created: ${path.created_at})`);
      
      await databases.updateDocument(
        DATABASE_ID,
        'study_paths',
        path.$id,
        { 
          status: 'archived',
          updated_at: new Date().toISOString()
        }
      );
    }

    console.log(`\n✅ Archived ${pathsToArchive.length} old paths\n`);
    return mostRecentPath.path_id;

  } catch (error) {
    console.error('❌ Error cleaning up study paths:', error);
    throw error;
  }
}

async function cleanupTopicProgress(activePathId: string) {
  console.log('\n🧹 CLEANING UP TOPIC PROGRESS\n');
  console.log('='.repeat(80));
  
  try {
    // Get all topic progress documents
    const response = await databases.listDocuments(
      DATABASE_ID,
      'topic_progress',
      [Query.limit(500)]
    );

    console.log(`\nFound ${response.documents.length} topic progress documents\n`);

    // Find documents that don't belong to the active path
    const toDelete = response.documents.filter(doc => doc.path_id !== activePathId);

    console.log(`🗑️  Deleting ${toDelete.length} orphaned progress documents...\n`);

    let deleted = 0;
    for (const doc of toDelete) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          'topic_progress',
          doc.$id
        );
        deleted++;
        if (deleted % 10 === 0) {
          console.log(`   Deleted ${deleted}/${toDelete.length}...`);
        }
      } catch (error) {
        console.error(`   ⚠️  Failed to delete ${doc.$id}:`, error);
      }
    }

    console.log(`\n✅ Deleted ${deleted} orphaned progress documents`);
    console.log(`✅ Kept ${response.documents.length - deleted} documents for active path\n`);

  } catch (error) {
    console.error('❌ Error cleaning up topic progress:', error);
    throw error;
  }
}

async function cleanupDailyTasks(activePathId: string) {
  console.log('\n🧹 CLEANING UP DAILY TASKS\n');
  console.log('='.repeat(80));
  
  try {
    // Get all daily task documents
    const response = await databases.listDocuments(
      DATABASE_ID,
      'daily_tasks',
      [Query.limit(500)]
    );

    console.log(`\nFound ${response.documents.length} daily task documents\n`);

    if (response.documents.length === 0) {
      console.log('✅ No daily tasks to clean up\n');
      return;
    }

    // Find documents that don't belong to the active path
    const toDelete = response.documents.filter(doc => doc.path_id !== activePathId);

    console.log(`🗑️  Deleting ${toDelete.length} orphaned task documents...\n`);

    let deleted = 0;
    for (const doc of toDelete) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          'daily_tasks',
          doc.$id
        );
        deleted++;
      } catch (error) {
        console.error(`   ⚠️  Failed to delete ${doc.$id}:`, error);
      }
    }

    console.log(`\n✅ Deleted ${deleted} orphaned task documents`);
    console.log(`✅ Kept ${response.documents.length - deleted} documents for active path\n`);

  } catch (error) {
    console.error('❌ Error cleaning up daily tasks:', error);
    throw error;
  }
}

async function verifyCleanup() {
  console.log('\n🔍 VERIFYING CLEANUP\n');
  console.log('='.repeat(80));
  
  try {
    // Check study paths
    const paths = await databases.listDocuments(
      DATABASE_ID,
      'study_paths',
      [Query.limit(100)]
    );

    const activeCount = paths.documents.filter(d => d.status === 'active').length;
    const nullCount = paths.documents.filter(d => d.status === null).length;
    const archivedCount = paths.documents.filter(d => d.status === 'archived').length;

    console.log(`\n📊 Study Paths:`);
    console.log(`   Active: ${activeCount} ${activeCount === 1 ? '✅' : '⚠️'}`);
    console.log(`   NULL: ${nullCount} ${nullCount === 0 ? '✅' : '⚠️'}`);
    console.log(`   Archived: ${archivedCount}`);

    // Check topic progress
    const progress = await databases.listDocuments(
      DATABASE_ID,
      'topic_progress',
      [Query.limit(500)]
    );

    const activePath = paths.documents.find(d => d.status === 'active');
    const progressForActive = progress.documents.filter(d => d.path_id === activePath?.path_id).length;
    const orphanedProgress = progress.documents.length - progressForActive;

    console.log(`\n📊 Topic Progress:`);
    console.log(`   Total: ${progress.documents.length}`);
    console.log(`   For active path: ${progressForActive}`);
    console.log(`   Orphaned: ${orphanedProgress} ${orphanedProgress === 0 ? '✅' : '⚠️'}`);

    // Check daily tasks
    const tasks = await databases.listDocuments(
      DATABASE_ID,
      'daily_tasks',
      [Query.limit(500)]
    );

    const tasksForActive = tasks.documents.filter(d => d.path_id === activePath?.path_id).length;
    const orphanedTasks = tasks.documents.length - tasksForActive;

    console.log(`\n📊 Daily Tasks:`);
    console.log(`   Total: ${tasks.documents.length}`);
    console.log(`   For active path: ${tasksForActive}`);
    console.log(`   Orphaned: ${orphanedTasks} ${orphanedTasks === 0 ? '✅' : '⚠️'}`);

    console.log('\n' + '='.repeat(80));
    
    if (activeCount === 1 && nullCount === 0 && orphanedProgress === 0 && orphanedTasks === 0) {
      console.log('\n✅ DATABASE IS CLEAN! All issues resolved.\n');
    } else {
      console.log('\n⚠️  Some issues remain. You may need to run this script again.\n');
    }

  } catch (error) {
    console.error('❌ Error verifying cleanup:', error);
  }
}

async function main() {
  console.log('\n🔧 STUDY PATH CLEANUP TOOL\n');
  console.log('This script will:');
  console.log('1. Keep the most recent study path as active');
  console.log('2. Archive all other active/null paths');
  console.log('3. Delete orphaned topic progress documents');
  console.log('4. Delete orphaned daily task documents\n');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise<string>(resolve => {
    readline.question('Do you want to proceed? (yes/no): ', resolve);
  });
  readline.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Cleanup cancelled\n');
    return;
  }

  console.log('\n🚀 Starting cleanup...\n');

  const activePathId = await cleanupStudyPaths();
  
  if (activePathId) {
    await cleanupTopicProgress(activePathId);
    await cleanupDailyTasks(activePathId);
  }

  await verifyCleanup();

  console.log('✅ Cleanup complete!\n');
}

main().catch(console.error);
