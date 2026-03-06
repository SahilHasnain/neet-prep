/**
 * Setup Script for Study Path Feature
 * Creates necessary Appwrite collections for knowledge graph and study paths
 */

import * as dotenv from 'dotenv';
import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = 'flashcard_db';

async function collectionExists(collectionId: string): Promise<boolean> {
  try {
    await databases.getCollection(DATABASE_ID, collectionId);
    return true;
  } catch {
    return false;
  }
}

async function createStudyPathsCollection() {
  console.log('Creating study_paths collection...');
  
  try {
    await databases.createCollection(
      DATABASE_ID,
      'study_paths',
      'study_paths',
      [
        Permission.read(Role.user(ID.unique())),
        Permission.create(Role.users()),
        Permission.update(Role.user(ID.unique())),
        Permission.delete(Role.user(ID.unique()))
      ]
    );

    // Add attributes
    await databases.createStringAttribute(DATABASE_ID, 'study_paths', 'path_id', 36, true);
    await databases.createStringAttribute(DATABASE_ID, 'study_paths', 'user_id', 36, true);
    await databases.createStringAttribute(DATABASE_ID, 'study_paths', 'diagnostic_id', 36, true);
    await databases.createStringAttribute(DATABASE_ID, 'study_paths', 'topic_sequence', 50000, true);
    await databases.createStringAttribute(DATABASE_ID, 'study_paths', 'current_topic_id', 50, false);
    await databases.createIntegerAttribute(DATABASE_ID, 'study_paths', 'progress_percentage', true, 0, 100);
    await databases.createIntegerAttribute(DATABASE_ID, 'study_paths', 'topics_completed', true);
    await databases.createIntegerAttribute(DATABASE_ID, 'study_paths', 'total_topics', true);
    await databases.createStringAttribute(DATABASE_ID, 'study_paths', 'status', 20, true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'study_paths', 'created_at', true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'study_paths', 'updated_at', true);

    // Wait for attributes
    console.log('Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create indexes
    await databases.createIndex(DATABASE_ID, 'study_paths', 'path_id_idx', 'unique' as any, ['path_id']);
    await databases.createIndex(DATABASE_ID, 'study_paths', 'user_id_idx', 'key' as any, ['user_id']);
    await databases.createIndex(DATABASE_ID, 'study_paths', 'diagnostic_id_idx', 'key' as any, ['diagnostic_id']);

    console.log('✅ study_paths collection created\n');
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  study_paths collection already exists\n');
    } else {
      throw error;
    }
  }
}

async function createTopicProgressCollection() {
  console.log('Creating topic_progress collection...');
  
  try {
    await databases.createCollection(
      DATABASE_ID,
      'topic_progress',
      'topic_progress',
      [
        Permission.read(Role.user(ID.unique())),
        Permission.create(Role.users()),
        Permission.update(Role.user(ID.unique())),
        Permission.delete(Role.user(ID.unique()))
      ]
    );

    // Add attributes
    await databases.createStringAttribute(DATABASE_ID, 'topic_progress', 'progress_id', 36, true);
    await databases.createStringAttribute(DATABASE_ID, 'topic_progress', 'user_id', 36, true);
    await databases.createStringAttribute(DATABASE_ID, 'topic_progress', 'path_id', 36, true);
    await databases.createStringAttribute(DATABASE_ID, 'topic_progress', 'topic_id', 50, true);
    await databases.createStringAttribute(DATABASE_ID, 'topic_progress', 'status', 20, true);
    await databases.createIntegerAttribute(DATABASE_ID, 'topic_progress', 'mastery_level', true, 0, 100);
    await databases.createIntegerAttribute(DATABASE_ID, 'topic_progress', 'time_spent_minutes', true);
    await databases.createIntegerAttribute(DATABASE_ID, 'topic_progress', 'quiz_attempts', true);
    await databases.createIntegerAttribute(DATABASE_ID, 'topic_progress', 'quiz_average_score', true, 0, 100);
    await databases.createDatetimeAttribute(DATABASE_ID, 'topic_progress', 'started_at', false);
    await databases.createDatetimeAttribute(DATABASE_ID, 'topic_progress', 'completed_at', false);
    await databases.createDatetimeAttribute(DATABASE_ID, 'topic_progress', 'last_accessed', false);

    // Wait for attributes
    console.log('Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create indexes
    await databases.createIndex(DATABASE_ID, 'topic_progress', 'progress_id_idx', 'unique' as any, ['progress_id']);
    await databases.createIndex(DATABASE_ID, 'topic_progress', 'user_topic_idx', 'unique' as any, ['user_id', 'topic_id']);
    await databases.createIndex(DATABASE_ID, 'topic_progress', 'path_id_idx', 'key' as any, ['path_id']);

    console.log('✅ topic_progress collection created\n');
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  topic_progress collection already exists\n');
    } else {
      throw error;
    }
  }
}

async function createDailyTasksCollection() {
  console.log('Creating daily_tasks collection...');
  
  try {
    await databases.createCollection(
      DATABASE_ID,
      'daily_tasks',
      'daily_tasks',
      [
        Permission.read(Role.user(ID.unique())),
        Permission.create(Role.users()),
        Permission.update(Role.user(ID.unique())),
        Permission.delete(Role.user(ID.unique()))
      ]
    );

    // Add attributes
    await databases.createStringAttribute(DATABASE_ID, 'daily_tasks', 'task_id', 36, true);
    await databases.createStringAttribute(DATABASE_ID, 'daily_tasks', 'user_id', 36, true);
    await databases.createStringAttribute(DATABASE_ID, 'daily_tasks', 'path_id', 36, true);
    await databases.createStringAttribute(DATABASE_ID, 'daily_tasks', 'topic_id', 50, true);
    await databases.createStringAttribute(DATABASE_ID, 'daily_tasks', 'task_type', 50, true);
    await databases.createStringAttribute(DATABASE_ID, 'daily_tasks', 'title', 200, true);
    await databases.createStringAttribute(DATABASE_ID, 'daily_tasks', 'description', 500, false);
    await databases.createIntegerAttribute(DATABASE_ID, 'daily_tasks', 'estimated_minutes', true);
    await databases.createStringAttribute(DATABASE_ID, 'daily_tasks', 'status', 20, true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'daily_tasks', 'scheduled_date', true);
    await databases.createDatetimeAttribute(DATABASE_ID, 'daily_tasks', 'completed_at', false);
    await databases.createDatetimeAttribute(DATABASE_ID, 'daily_tasks', 'created_at', true);

    // Wait for attributes
    console.log('Waiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create indexes
    await databases.createIndex(DATABASE_ID, 'daily_tasks', 'task_id_idx', 'unique' as any, ['task_id']);
    await databases.createIndex(DATABASE_ID, 'daily_tasks', 'user_date_idx', 'key' as any, ['user_id', 'scheduled_date']);
    await databases.createIndex(DATABASE_ID, 'daily_tasks', 'path_id_idx', 'key' as any, ['path_id']);

    console.log('✅ daily_tasks collection created\n');
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  daily_tasks collection already exists\n');
    } else {
      throw error;
    }
  }
}

async function setupStudyPathCollections() {
  console.log('🚀 Setting up Study Path Feature collections...\n');

  try {
    // Check diagnostic_results
    if (await collectionExists('diagnostic_results')) {
      console.log('✅ diagnostic_results already exists\n');
    } else {
      console.log('⚠️  diagnostic_results does not exist - create it manually\n');
    }

    // Create remaining collections
    await createStudyPathsCollection();
    await createTopicProgressCollection();
    await createDailyTasksCollection();

    console.log('🎉 Study Path Feature setup completed successfully!');
    console.log('\nCollections created:');
    console.log('  - diagnostic_results (already existed)');
    console.log('  - study_paths');
    console.log('  - topic_progress');
    console.log('  - daily_tasks');
    console.log('\nYou can now use the diagnostic quiz and study path features!');

  } catch (error: any) {
    console.error('❌ Error setting up collections:', error.message);
    throw error;
  }
}

// Run the setup
setupStudyPathCollections()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
