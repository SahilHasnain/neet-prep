/**
 * Delete All Study Paths Script
 * Completely wipes all study path data to start fresh
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

async function deleteAllStudyPaths() {
  console.log('\n🗑️  DELETING ALL STUDY PATHS\n');
  console.log('='.repeat(80));
  
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'study_paths',
      [Query.limit(100)]
    );

    console.log(`\nFound ${response.documents.length} study paths to delete\n`);

    let deleted = 0;
    for (const doc of response.documents) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          'study_paths',
          doc.$id
        );
        deleted++;
        console.log(`   Deleted ${deleted}/${response.documents.length}: ${doc.path_id}`);
      } catch (error) {
        console.error(`   ⚠️  Failed to delete ${doc.$id}:`, error);
      }
    }

    console.log(`\n✅ Deleted ${deleted} study path documents\n`);
  } catch (error) {
    console.error('❌ Error deleting study paths:', error);
    throw error;
  }
}

async function deleteAllTopicProgress() {
  console.log('\n🗑️  DELETING ALL TOPIC PROGRESS\n');
  console.log('='.repeat(80));
  
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'topic_progress',
      [Query.limit(500)]
    );

    console.log(`\nFound ${response.documents.length} topic progress documents to delete\n`);

    let deleted = 0;
    for (const doc of response.documents) {
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          'topic_progress',
          doc.$id
        );
        deleted++;
        if (deleted % 10 === 0) {
          console.log(`   Deleted ${deleted}/${response.documents.length}...`);
        }
      } catch (error) {
        console.error(`   ⚠️  Failed to delete ${doc.$id}:`, error);
      }
    }

    console.log(`\n✅ Deleted ${deleted} topic progress documents\n`);
  } catch (error) {
    console.error('❌ Error deleting topic progress:', error);
    throw error;
  }
}

async function deleteAllDailyTasks() {
  console.log('\n🗑️  DELETING ALL DAILY TASKS\n');
  console.log('='.repeat(80));
  
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'daily_tasks',
      [Query.limit(500)]
    );

    console.log(`\nFound ${response.documents.length} daily task documents to delete\n`);

    if (response.documents.length === 0) {
      console.log('✅ No daily tasks to delete\n');
      return;
    }

    let deleted = 0;
    for (const doc of response.documents) {
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

    console.log(`\n✅ Deleted ${deleted} daily task documents\n`);
  } catch (error) {
    console.error('❌ Error deleting daily tasks:', error);
    throw error;
  }
}

async function verify() {
  console.log('\n🔍 VERIFYING DELETION\n');
  console.log('='.repeat(80));
  
  try {
    const paths = await databases.listDocuments(
      DATABASE_ID,
      'study_paths',
      [Query.limit(100)]
    );

    const progress = await databases.listDocuments(
      DATABASE_ID,
      'topic_progress',
      [Query.limit(500)]
    );

    const tasks = await databases.listDocuments(
      DATABASE_ID,
      'daily_tasks',
      [Query.limit(500)]
    );

    console.log(`\n📊 Remaining Documents:`);
    console.log(`   Study Paths: ${paths.documents.length} ${paths.documents.length === 0 ? '✅' : '⚠️'}`);
    console.log(`   Topic Progress: ${progress.documents.length} ${progress.documents.length === 0 ? '✅' : '⚠️'}`);
    console.log(`   Daily Tasks: ${tasks.documents.length} ${tasks.documents.length === 0 ? '✅' : '⚠️'}`);

    console.log('\n' + '='.repeat(80));
    
    if (paths.documents.length === 0 && progress.documents.length === 0 && tasks.documents.length === 0) {
      console.log('\n✅ ALL DATA DELETED! Database is completely clean.\n');
    } else {
      console.log('\n⚠️  Some documents remain. You may need to run this script again.\n');
    }

  } catch (error) {
    console.error('❌ Error verifying deletion:', error);
  }
}

async function main() {
  console.log('\n🔥 DELETE ALL STUDY PATH DATA\n');
  console.log('⚠️  WARNING: This will permanently delete ALL study path data!');
  console.log('This includes:');
  console.log('  - All study paths (active and archived)');
  console.log('  - All topic progress documents');
  console.log('  - All daily task documents\n');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise<string>(resolve => {
    readline.question('Are you sure you want to DELETE EVERYTHING? (yes/no): ', resolve);
  });
  readline.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Deletion cancelled\n');
    return;
  }

  console.log('\n🚀 Starting complete deletion...\n');

  await deleteAllStudyPaths();
  await deleteAllTopicProgress();
  await deleteAllDailyTasks();
  await verify();

  console.log('✅ Complete deletion finished!\n');
  console.log('💡 You can now retake the diagnostic test to create a fresh study path.\n');
}

main().catch(console.error);
