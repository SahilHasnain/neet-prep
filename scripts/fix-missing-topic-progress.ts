/**
 * Fix missing topic progress records
 * This script finds study paths with incomplete progress records and creates the missing ones
 */

import * as dotenv from 'dotenv';
import { Client, Databases, ID, Query } from 'node-appwrite';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTIONS = {
  STUDY_PATHS: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_STUDY_PATHS!,
  TOPIC_PROGRESS: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_TOPIC_PROGRESS!,
};

// Import knowledge graph to determine subjects
const KNOWLEDGE_GRAPH = require('../src/config/knowledge-graph.config').KNOWLEDGE_GRAPH;

async function fixMissingProgress() {
  console.log('🔍 Finding study paths with missing progress records...\n');

  try {
    // Get all study paths
    const studyPaths = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STUDY_PATHS,
      [Query.limit(100)]
    );

    console.log(`Found ${studyPaths.documents.length} study paths\n`);

    for (const studyPath of studyPaths.documents) {
      const pathId = studyPath.path_id;
      const userId = studyPath.user_id;
      const topicSequence = JSON.parse(studyPath.topic_sequence as string) as string[];

      console.log(`\n📚 Checking study path ${pathId}`);
      console.log(`   User: ${userId}`);
      console.log(`   Topics in sequence: ${topicSequence.length}`);

      // Get existing progress records
      const existingProgress = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TOPIC_PROGRESS,
        [
          Query.equal('path_id', pathId),
          Query.limit(100)
        ]
      );

      const existingTopicIds = new Set(
        existingProgress.documents.map((doc: any) => doc.topic_id)
      );

      console.log(`   Existing progress records: ${existingProgress.documents.length}`);

      // Find missing topics
      const missingTopics = topicSequence.filter(topicId => !existingTopicIds.has(topicId));

      if (missingTopics.length === 0) {
        console.log(`   ✅ No missing progress records`);
        continue;
      }

      console.log(`   ⚠️  Missing progress for ${missingTopics.length} topics:`, missingTopics);

      // Determine which topics should be unlocked (first of each subject)
      const topicMap = new Map(KNOWLEDGE_GRAPH.map((t: any) => [t.id, t]));
      const firstTopicBySubject = new Map<string, string>();

      for (const topicId of topicSequence) {
        const topic = topicMap.get(topicId);
        if (topic && !firstTopicBySubject.has(topic.subject)) {
          firstTopicBySubject.set(topic.subject, topicId);
        }
      }

      // Create missing progress records
      for (const topicId of missingTopics) {
        const isFirstOfSubject = Array.from(firstTopicBySubject.values()).includes(topicId);
        const status = isFirstOfSubject ? 'unlocked' : 'locked';

        try {
          const docId = ID.unique();
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.TOPIC_PROGRESS,
            docId,
            {
              progress_id: docId,
              user_id: userId,
              path_id: pathId,
              topic_id: topicId,
              status,
              mastery_level: 0,
              time_spent_minutes: 0,
              quiz_attempts: 0,
              quiz_average_score: 0,
              priority: 'medium'
            }
          );
          console.log(`      ✓ Created progress for ${topicId} (${status})`);
        } catch (error: any) {
          console.error(`      ✗ Failed to create progress for ${topicId}:`, error.message);
        }
      }
    }

    console.log('\n✅ Done! All missing progress records have been created.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMissingProgress();
