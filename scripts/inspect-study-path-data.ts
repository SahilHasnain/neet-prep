/**
 * Diagnostic Script: Inspect Study Path Data
 * Shows all study paths and topic progress documents to debug issues
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

async function inspectStudyPaths() {
  console.log('\n📊 INSPECTING STUDY PATHS COLLECTION\n');
  console.log('='.repeat(80));
  
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'study_paths',
      [Query.limit(100)]
    );

    console.log(`\nTotal study paths found: ${response.documents.length}\n`);

    for (const doc of response.documents) {
      console.log('─'.repeat(80));
      console.log(`Path ID: ${doc.path_id}`);
      console.log(`Document ID ($id): ${doc.$id}`);
      console.log(`User ID: ${doc.user_id}`);
      console.log(`Status: ${doc.status === null ? 'NULL ⚠️' : doc.status}`);
      console.log(`Diagnostic ID: ${doc.diagnostic_id}`);
      console.log(`Topics Completed: ${doc.topics_completed}/${doc.total_topics}`);
      console.log(`Progress: ${doc.progress_percentage}%`);
      console.log(`Created: ${doc.created_at}`);
      console.log(`Updated: ${doc.updated_at}`);
      
      if (doc.topic_sequence) {
        const topics = JSON.parse(doc.topic_sequence as string);
        console.log(`Topic Sequence (${topics.length} topics): ${topics.slice(0, 5).join(', ')}${topics.length > 5 ? '...' : ''}`);
      }
      
      if (doc.ai_reasoning) {
        console.log(`AI Reasoning: ${(doc.ai_reasoning as string).substring(0, 100)}...`);
      }
      
      console.log('');
    }

    return response.documents;
  } catch (error) {
    console.error('❌ Error fetching study paths:', error);
    return [];
  }
}

async function inspectTopicProgress(studyPaths: any[]) {
  console.log('\n📈 INSPECTING TOPIC PROGRESS COLLECTION\n');
  console.log('='.repeat(80));
  
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'topic_progress',
      [Query.limit(500)]
    );

    console.log(`\nTotal topic progress documents found: ${response.documents.length}\n`);

    // Group by path_id
    const byPath: { [key: string]: any[] } = {};
    for (const doc of response.documents) {
      const pathId = doc.path_id as string;
      if (!byPath[pathId]) {
        byPath[pathId] = [];
      }
      byPath[pathId].push(doc);
    }

    console.log(`Grouped by ${Object.keys(byPath).length} different path_id values:\n`);

    for (const [pathId, docs] of Object.entries(byPath)) {
      console.log('─'.repeat(80));
      console.log(`Path ID: ${pathId}`);
      
      // Check if this path_id exists in study_paths
      const pathExists = studyPaths.find(p => p.path_id === pathId);
      if (pathExists) {
        console.log(`✅ Path exists in study_paths (status: ${pathExists.status === null ? 'NULL' : pathExists.status})`);
      } else {
        console.log(`⚠️  ORPHANED: Path does NOT exist in study_paths collection!`);
      }
      
      console.log(`Progress documents: ${docs.length}`);
      console.log(`User ID: ${docs[0].user_id}`);
      
      // Show first few topics
      const topicIds = docs.map(d => d.topic_id).slice(0, 10);
      console.log(`Topics: ${topicIds.join(', ')}${docs.length > 10 ? '...' : ''}`);
      
      // Show status breakdown
      const statusCounts: { [key: string]: number } = {};
      docs.forEach(d => {
        const status = d.status as string;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      console.log(`Status breakdown:`, statusCounts);
      
      // Show sample document IDs
      console.log(`Sample document IDs: ${docs.slice(0, 3).map(d => d.$id).join(', ')}`);
      console.log(`Sample progress IDs: ${docs.slice(0, 3).map(d => d.progress_id).join(', ')}`);
      console.log('');
    }

    return response.documents;
  } catch (error) {
    console.error('❌ Error fetching topic progress:', error);
    return [];
  }
}

async function inspectDailyTasks(studyPaths: any[]) {
  console.log('\n📅 INSPECTING DAILY TASKS COLLECTION\n');
  console.log('='.repeat(80));
  
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'daily_tasks',
      [Query.limit(500)]
    );

    console.log(`\nTotal daily task documents found: ${response.documents.length}\n`);

    // Group by path_id
    const byPath: { [key: string]: any[] } = {};
    for (const doc of response.documents) {
      const pathId = doc.path_id as string;
      if (!byPath[pathId]) {
        byPath[pathId] = [];
      }
      byPath[pathId].push(doc);
    }

    console.log(`Grouped by ${Object.keys(byPath).length} different path_id values:\n`);

    for (const [pathId, docs] of Object.entries(byPath)) {
      console.log('─'.repeat(80));
      console.log(`Path ID: ${pathId}`);
      
      // Check if this path_id exists in study_paths
      const pathExists = studyPaths.find(p => p.path_id === pathId);
      if (pathExists) {
        console.log(`✅ Path exists in study_paths (status: ${pathExists.status === null ? 'NULL' : pathExists.status})`);
      } else {
        console.log(`⚠️  ORPHANED: Path does NOT exist in study_paths collection!`);
      }
      
      console.log(`Task documents: ${docs.length}`);
      console.log(`User ID: ${docs[0].user_id}`);
      
      // Show status breakdown
      const statusCounts: { [key: string]: number } = {};
      docs.forEach(d => {
        const status = d.status as string;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      console.log(`Status breakdown:`, statusCounts);
      console.log('');
    }

    return response.documents;
  } catch (error) {
    console.error('❌ Error fetching daily tasks:', error);
    return [];
  }
}

async function main() {
  console.log('\n🔍 STUDY PATH DATA INSPECTION TOOL\n');
  console.log('This script will show you exactly what\'s in your database\n');

  const studyPaths = await inspectStudyPaths();
  const topicProgress = await inspectTopicProgress(studyPaths);
  const dailyTasks = await inspectDailyTasks(studyPaths);

  console.log('\n' + '='.repeat(80));
  console.log('\n📋 SUMMARY\n');
  console.log(`Study Paths: ${studyPaths.length}`);
  console.log(`Topic Progress Documents: ${topicProgress.length}`);
  console.log(`Daily Task Documents: ${dailyTasks.length}`);
  
  // Check for issues
  console.log('\n⚠️  POTENTIAL ISSUES:\n');
  
  const nullStatusPaths = studyPaths.filter(p => p.status === null);
  if (nullStatusPaths.length > 0) {
    console.log(`- ${nullStatusPaths.length} study path(s) have NULL status (should be 'active' or 'archived')`);
  }
  
  const activePaths = studyPaths.filter(p => p.status === 'active' || p.status === null);
  if (activePaths.length > 1) {
    console.log(`- ${activePaths.length} active/null study paths found (should only be 1 per user)`);
  }
  
  // Check for orphaned progress
  const pathIds = new Set(studyPaths.map(p => p.path_id));
  const orphanedProgress = topicProgress.filter(p => !pathIds.has(p.path_id as string));
  if (orphanedProgress.length > 0) {
    console.log(`- ${orphanedProgress.length} orphaned topic progress documents (path doesn't exist)`);
  }
  
  const orphanedTasks = dailyTasks.filter(t => !pathIds.has(t.path_id as string));
  if (orphanedTasks.length > 0) {
    console.log(`- ${orphanedTasks.length} orphaned daily task documents (path doesn't exist)`);
  }

  console.log('\n✅ Inspection complete!\n');
}

main().catch(console.error);
